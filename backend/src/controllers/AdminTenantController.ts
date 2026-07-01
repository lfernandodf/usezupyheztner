import { Request, Response } from "express";
import AppError from "../errors/AppError";
import AdminCreateTenantService from "../services/AdminServices/AdminCreateTenantService";
import AdminListTenantsService from "../services/AdminServices/AdminListTenantsService";
import AdminUpdateTenantService from "../services/AdminServices/AdminUpdateTenantService";
import AdminDeleteTenantService from "../services/AdminServices/AdminDeleteTenantService";

export const indexTenants = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tenants = await AdminListTenantsService();
  return res.status(200).json(tenants);
};

export const storeTenant = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, status, ownerId } = req.body;
  const tenant = await AdminCreateTenantService({ name, status, ownerId });
  return res.status(201).json(tenant);
};

export const updateTenant = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.params;
  const tenantData = req.body;
  const tenant = await AdminUpdateTenantService({ tenantId, tenantData });
  return res.status(200).json(tenant);
};

export const deleteTenant = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.params;
  await AdminDeleteTenantService({ tenantId });
  return res.status(200).json({ message: "Tenant deleted" });
};
