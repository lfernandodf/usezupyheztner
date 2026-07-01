import AppError from "../../errors/AppError";
import Tenant from "../../models/Tenant";

interface Request {
  tenantId: string | number;
}

const AdminDeleteTenantService = async ({
  tenantId
}: Request): Promise<void> => {
  const tenant = await Tenant.findByPk(tenantId);

  if (!tenant) {
    throw new AppError("ERR_NO_TENANT_FOUND", 404);
  }

  await tenant.destroy();
};

export default AdminDeleteTenantService;
