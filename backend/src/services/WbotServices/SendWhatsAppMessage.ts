import { Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import SerializeWbotMsgId from "../../helpers/SerializeWbotMsgId";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import UserMessagesLog from "../../models/UserMessagesLog";
import { logger } from "../../utils/logger";
// import { StartWhatsAppSessionVerify } from "./StartWhatsAppSessionVerify";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  userId?: number | string | undefined;
}

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const isMenuMessage = (body: string): boolean => {
  const text = String(body || "").toLowerCase();
  const hasZeroOption = /digite\s*0|op[cç][aã]o\s*0/.test(text);
  const hasMultipleNumberedOptions =
    (text.match(/\n\s*\d+\s*[-.)]/g) || []).length >= 3 ||
    (text.match(/\b\d+\b/g) || []).length >= 5;

  return hasZeroOption || hasMultipleNumberedOptions;
};

const calculateTypingDelay = (body: string): number => {
  const menuProfile = isMenuMessage(body);

  const minDelay = Number(
    process.env[
      menuProfile ? "BOT_TYPING_MENU_MIN_DELAY_MS" : "BOT_TYPING_MIN_DELAY_MS"
    ] || (menuProfile ? 500 : 900)
  );
  const maxDelay = Number(
    process.env[
      menuProfile ? "BOT_TYPING_MENU_MAX_DELAY_MS" : "BOT_TYPING_MAX_DELAY_MS"
    ] || (menuProfile ? 1800 : 3200)
  );
  const perCharDelay = Number(
    process.env[
      menuProfile
        ? "BOT_TYPING_MENU_MS_PER_CHAR"
        : "BOT_TYPING_MS_PER_CHAR"
    ] || (menuProfile ? 22 : 45)
  );

  const longMessageThreshold = Number(
    process.env.BOT_TYPING_LONG_MESSAGE_THRESHOLD || 260
  );
  const longMessageExtraDelay = Number(
    process.env.BOT_TYPING_LONG_MESSAGE_EXTRA_DELAY_MS || 700
  );
  const messageLength = String(body || "").trim().length;

  let computed = minDelay + messageLength * perCharDelay;

  if (!menuProfile && messageLength >= longMessageThreshold) {
    computed += longMessageExtraDelay;
  }

  return clamp(computed, minDelay, maxDelay);
};

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
  userId
}: Request): Promise<WbotMessage> => {
  let quotedMsgSerializedId: string | undefined;
  if (quotedMsg) {
    await GetWbotMessage(ticket, quotedMsg.id);
    quotedMsgSerializedId = SerializeWbotMsgId(ticket, quotedMsg);
  }

  const wbot = await GetTicketWbot(ticket);
  const chatId = `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`;

  try {
    const typingEnabled = String(
      process.env.BOT_TYPING_ENABLED || "true"
    ).toLowerCase() !== "false";

    if (typingEnabled) {
      const typingDelay = calculateTypingDelay(body);
      try {
        const chat = await wbot.getChatById(chatId);
        await chat.sendStateTyping();
        await sleep(typingDelay);
        await chat.clearState();
      } catch (error) {
        // Se não conseguir atualizar presença, ainda mantém o atraso de resposta.
        await sleep(typingDelay);
      }
    }

    const sendMessage = await wbot.sendMessage(chatId, body, {
      quotedMessageId: quotedMsgSerializedId,
      linkPreview: false // fix: send a message takes 2 seconds when there's a link on message body
    });

    await ticket.update({
      lastMessage: body,
      lastMessageAt: new Date().getTime()
    });
    try {
      if (userId) {
        await UserMessagesLog.create({
          messageId: sendMessage.id.id,
          userId,
          ticketId: ticket.id
        });
      }
    } catch (error) {
      logger.error(`Error criar log mensagem ${error}`);
    }
    return sendMessage;
  } catch (err) {
    logger.error(`SendWhatsAppMessage | Error: ${err}`);
    // await StartWhatsAppSessionVerify(ticket.whatsappId, err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
