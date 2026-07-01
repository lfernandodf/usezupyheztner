import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import authConfig from "../config/auth";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  tenantId: number;
  iat: number;
  exp: number;
}

const isAuthSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Token was not provided.", 403);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.secret);
    const { id, profile, tenantId } = decoded as TokenPayload;

    if (profile !== "superadmin") {
      throw new AppError("Not superadmin permission", 403);
    }

    req.user = {
      id,
      profile,
      tenantId
    };
  } catch (err) {
    throw new AppError("Invalid token or not Superuser", 403);
  }

  return next();
};

export default isAuthSuperAdmin;
