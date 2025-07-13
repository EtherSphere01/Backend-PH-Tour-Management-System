import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";

export const checkAuth =
    (...authRoles: string[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const accessToken = req.headers.authorization;
            if (!accessToken) {
                throw new AppError(401, "No access token provided", "");
            }

            const verifyToken = jwt.verify(
                accessToken,
                envVars.JWT_ACCESS_SECRET
            ) as JwtPayload;

            if (!authRoles.includes(verifyToken.role)) {
                throw new AppError(
                    403,
                    "You are not permitted to view this route",
                    ""
                );
            }

            req.user = verifyToken;
            next();
        } catch (error) {
            next(error);
        }
    };
