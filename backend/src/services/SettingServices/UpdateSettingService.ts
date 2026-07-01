import Setting from "../../models/Setting";

interface Request {
  key: string;
  value: string;
  tenantId: string | number;
}

const UpdateSettingService = async ({
  key,
  value,
  tenantId
}: Request): Promise<Setting | undefined> => {
  let setting = await Setting.findOne({
    where: { key, tenantId }
  });

  if (!setting) {
    setting = await Setting.create({
      key,
      value,
      tenantId: Number(tenantId)
    });
    return setting;
  }

  await setting.update({ value });

  return setting;
};

export default UpdateSettingService;
