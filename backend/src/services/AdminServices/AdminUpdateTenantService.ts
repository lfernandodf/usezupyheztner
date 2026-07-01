import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Tenant from "../../models/Tenant";

interface Request {
  tenantId: string | number;
  tenantData: {
    name?: string;
    status?: string;
    ownerId?: number;
  };
}

interface Response {
  id: number;
  name: string;
  status: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUpdateTenantService = async ({
  tenantId,
  tenantData
}: Request): Promise<Response> => {
  const tenant = await Tenant.findByPk(tenantId);

  if (!tenant) {
    throw new AppError("ERR_NO_TENANT_FOUND", 404);
  }

  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    status: Yup.string(),
    ownerId: Yup.number().nullable()
  });

  try {
    await schema.validate(tenantData);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await tenant.update(tenantData);

  return {
    id: tenant.id,
    name: tenant.name,
    status: tenant.status,
    ownerId: tenant.ownerId,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt
  };
};

export default AdminUpdateTenantService;
