import express from "express";
import * as AdminController from "../controllers/AdminController";
import * as AdminTenantController from "../controllers/AdminTenantController";
import isAuthAdmin from "../middleware/isAuthAdmin";
import isAuthSuperAdmin from "../middleware/isAuthSuperAdmin";

const adminRoutes = express.Router();

adminRoutes.get("/admin/users", isAuthAdmin, AdminController.indexUsers);
adminRoutes.put(
  "/admin/users/:userId",
  isAuthAdmin,
  AdminController.updateUser
);

adminRoutes.get("/admin/tenants", isAuthSuperAdmin, AdminController.indexTenants);
adminRoutes.post(
  "/admin/tenants",
  isAuthSuperAdmin,
  AdminTenantController.storeTenant
);
adminRoutes.put(
  "/admin/tenants/:tenantId",
  isAuthSuperAdmin,
  AdminTenantController.updateTenant
);
adminRoutes.delete(
  "/admin/tenants/:tenantId",
  isAuthSuperAdmin,
  AdminTenantController.deleteTenant
);
adminRoutes.get(
  "/admin/chatflow/:tenantId",
  isAuthAdmin,
  AdminController.indexChatFlow
);
adminRoutes.put(
  "/admin/settings/:tenantId",
  isAuthAdmin,
  AdminController.updateSettings
);

adminRoutes.get("/admin/channels", isAuthAdmin, AdminController.indexChannels);
adminRoutes.post("/admin/channels", isAuthAdmin, AdminController.storeChannel);

export default adminRoutes;
