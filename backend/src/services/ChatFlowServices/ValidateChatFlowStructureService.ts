interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const normalize = (value: any): string =>
  String(value || "")
    .toLowerCase()
    .trim();

const extractFlow = (payload: any): any => {
  if (payload?.nodeList) return payload;
  if (payload?.flow?.nodeList) return payload.flow;
  if (payload?.flow?.flow?.nodeList) return payload.flow.flow;
  return payload;
};

const ValidateChatFlowStructureService = (payload: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const flow = extractFlow(payload);
  const nodeList = flow?.nodeList;
  const lineList = Array.isArray(flow?.lineList) ? flow.lineList : [];

  if (!Array.isArray(nodeList) || nodeList.length === 0) {
    return {
      valid: false,
      errors: ["Fluxo sem etapas. Adicione pelo menos uma etapa do tipo node."],
      warnings
    };
  }

  const startNode = nodeList.find((node: any) => node?.type === "start");
  const configNode = nodeList.find(
    (node: any) => node?.type === "configurations"
  );

  if (!startNode) {
    errors.push("Fluxo sem etapa de inicio (start).");
  }

  if (!configNode) {
    errors.push("Fluxo sem etapa de configuracoes.");
  }

  const startLines = lineList.filter((line: any) => line?.from === "start");
  if (startLines.length === 0) {
    errors.push("Etapa start sem conexao de entrada para a primeira etapa.");
  }
  if (startLines.length > 1) {
    warnings.push(
      "Etapa start com mais de uma conexao. O bot usa somente a primeira encontrada."
    );
  }

  const nodeById = new Map<string, any>();
  nodeList.forEach((node: any) => {
    if (node?.id) nodeById.set(String(node.id), node);
  });

  if (startLines.length > 0) {
    const firstTarget = startLines[0]?.to;
    const firstNode = nodeById.get(String(firstTarget));
    if (!firstTarget || !firstNode || firstNode?.type !== "node") {
      errors.push(
        "A conexao da etapa start deve apontar para uma etapa do tipo node."
      );
    }
  }

  let hasTerminalRouting = false;

  const conversationNodes = nodeList.filter((node: any) => node?.type === "node");
  conversationNodes.forEach((node: any) => {
    const nodeLabel = node?.name || node?.id || "sem_nome";
    const conditions = Array.isArray(node?.conditions) ? node.conditions : [];
    const interactions = Array.isArray(node?.interactions) ? node.interactions : [];

    if (interactions.length === 0) {
      warnings.push(
        `Etapa ${nodeLabel} sem interacao de mensagem. O cliente pode nao receber menu/texto.`
      );
    }

    if (conditions.length === 0) {
      errors.push(
        `Etapa ${nodeLabel} sem condicoes de resposta. Dica: para etapas informativas (ex.: Promocoes), adicione 'Qualquer resposta' com acao 'Etapa' apontando para o menu inicial.`
      );
      return;
    }

    const universalIndexes = conditions
      .map((condition: any, idx: number) =>
        condition?.type === "US" ? idx : -1
      )
      .filter((idx: number) => idx >= 0);

    if (universalIndexes.length > 1) {
      errors.push(
        `Etapa ${nodeLabel} possui mais de uma condicao 'Qualquer resposta'.`
      );
    }
    if (
      universalIndexes.length === 1 &&
      universalIndexes[0] !== conditions.length - 1
    ) {
      errors.push(
        `Etapa ${nodeLabel} possui 'Qualquer resposta' antes das demais condicoes. Ela deve ficar por ultimo.`
      );
    }

    const conflictingAnswers = new Set<string>();
    const answerRouteMap = new Map<string, string>();

    conditions.forEach((condition: any, idx: number) => {
      const action = Number(condition?.action);
      const conditionName = `condicao ${idx + 1} da etapa ${nodeLabel}`;

      if (condition?.type === "R") {
        const values = Array.isArray(condition?.condition)
          ? condition.condition
          : [];
        if (values.length === 0) {
          errors.push(`${conditionName} sem respostas configuradas.`);
        }

        values.forEach((value: any) => {
          const normalized = normalize(value);
          if (!normalized) return;

          const action = Number(condition?.action);
          const routeKey =
            action === 0
              ? `step:${String(condition?.nextStepId || "")}`
              : action === 1
                ? `queue:${String(condition?.queueId || "")}`
                : action === 2
                  ? `user:${String(condition?.userIdDestination || "")}`
                  : `invalid:${String(action)}`;

          const previousRoute = answerRouteMap.get(normalized);
          if (previousRoute && previousRoute !== routeKey) {
            conflictingAnswers.add(normalized);
          } else {
            answerRouteMap.set(normalized, routeKey);
          }
        });
      }

      if (![0, 1, 2].includes(action)) {
        errors.push(`${conditionName} com acao invalida.`);
      }

      if (action === 0) {
        const nextStepId = condition?.nextStepId;
        const nextNode = nodeById.get(String(nextStepId));
        if (!nextStepId) {
          errors.push(`${conditionName} deve apontar para proxima etapa.`);
        } else if (nextNode?.type === "start") {
          errors.push(
            `${conditionName} aponta para 'Início'. Use a etapa inicial do menu (ex.: Boas vindas), e nao o bloco start.`
          );
        } else if (!nextNode || nextNode?.type !== "node") {
          errors.push(
            `${conditionName} aponta para etapa inexistente ou nao permitida.`
          );
        } else if (String(nextStepId) === String(node?.id)) {
          errors.push(`${conditionName} nao pode apontar para a propria etapa.`);
        }
      }

      if (action === 1) {
        if (!condition?.queueId) {
          errors.push(`${conditionName} deve informar uma fila.`);
        } else {
          hasTerminalRouting = true;
        }
      }

      if (action === 2) {
        if (!condition?.userIdDestination) {
          errors.push(`${conditionName} deve informar um usuario.`);
        } else {
          hasTerminalRouting = true;
        }
      }
    });

    if (conflictingAnswers.size > 0) {
      warnings.push(
        `Etapa ${nodeLabel} possui respostas ambiguas (mesma palavra para destinos diferentes): ${Array.from(
          conflictingAnswers
        ).join(", ")}.`
      );
    }

    // Etapas informativas podem encaminhar apenas para outra etapa (acao 0),
    // por isso nao tratamos esse formato como warning por padrao.
  });

  const closeKeywords = Array.isArray(configNode?.configurations?.answerCloseTicket)
    ? configNode.configurations.answerCloseTicket
    : [];

  if (closeKeywords.length === 0) {
    warnings.push(
      "Nenhum parametro de encerramento configurado em 'Encerrar Atendimento'."
    );
  }

  const hasCloseZero = closeKeywords.some((value: any) => normalize(value) === "0");
  const menuMentionsZero = conversationNodes.some((node: any) => {
    const interactions = Array.isArray(node?.interactions) ? node.interactions : [];
    return interactions.some((interaction: any) => {
      const text = interaction?.data?.message || interaction?.data?.caption || "";
      return /digite\s*0|opcao\s*0|encerrar\s*0|0\s*encerrar/i.test(
        String(text)
      );
    });
  });

  if (menuMentionsZero && !hasCloseZero) {
    warnings.push(
      "O texto do menu menciona opcao 0 para encerrar, mas o valor 0 nao esta em 'Encerrar Atendimento'."
    );
  }

  if (!hasTerminalRouting && closeKeywords.length === 0) {
    errors.push(
      "Fluxo sem fim definido: configure ao menos uma condicao que envie para fila/usuario ou regra de encerramento."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

export default ValidateChatFlowStructureService;