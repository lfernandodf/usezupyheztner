  import { verify } from "jsonwebtoken";
  import { Request, Response, NextFunction } from "express";
  
  import AppError from "../errors/AppError";
  import authConfig from "../config/auth";
  import User from "../models/User";
  
  interface TokenPayload {
    id: string;
    username: string;
    profile: string;
    tenantId: number;
    iat: number;
    exp: number;
  }
  
  const isAuthAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const adminDomain = process.env.ADMIN_DOMAIN;
  
    if (!authHeader) {
      throw new AppError("Token was not provided.", 403);
    }
    if (!adminDomain) {
      throw new AppError("Not exists admin domains defined.", 403);
    }
  
    const [, token] = authHeader.split(" ");
  
    try {
      const decoded = verify(token, authConfig.secret);
      const { id, profile, tenantId } = decoded as TokenPayload;
      const user = await User.findByPk(id);
      if (!user || (profile === "admin" && user.email.indexOf(adminDomain) === -1)) {
        throw new AppError("Not admin permission", 403);
      }
      if (profile !== "admin" && profile !== "superadmin") {
        throw new AppError("Not admin permission", 403);
      }
      const selectedTenant = req.headers["x-selected-tenant"] as string;

      req.user = {
        id,
        profile,
        tenantId:
          profile === "superadmin" && selectedTenant
            ? Number(selectedTenant)
            : tenantId
      };
    } catch (err) {
      throw new AppError("Invalid token or not Admin", 403);
    }
  
    return next();
  };
  
  export default isAuthAdmin;

