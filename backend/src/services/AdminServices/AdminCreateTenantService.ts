import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Tenant from "../../models/Tenant";

interface Request {
  name: string;
  status?: string;
  ownerId?: number;
}

interface Response {
  id: number;
  name: string;
  status: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdminCreateTenantService = async ({
  name,
  status = "active",
  ownerId
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(2),
    status: Yup.string(),
    ownerId: Yup.number().nullable()
  });

  try {
    await schema.validate({ name, status, ownerId });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const tenant = await Tenant.create({
    name,
    status,
    ownerId
  });

  return {
    id: tenant.id,
    name: tenant.name,
    status: tenant.status,
    ownerId: tenant.ownerId,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt
  };
};

export default AdminCreateTenantService;
