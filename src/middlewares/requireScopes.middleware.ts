import { NextFunction, Request, Response } from "express";
import { checkScopes } from "../utils/checkScopes.js";

export const requireScopes = (requiredScopes: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const grantedScopes = req.user.scopes;

    const hasAll = checkScopes(grantedScopes, requiredScopes);

    if (!hasAll) {
      return res.status(403).json({
        error: "Insufficient permissions",
      });
    }

    next();
  };
};
