import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import httpStatus from "http-status-codes";
import { IsActive } from "../modules/user/user.interface";

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

            const isUserExists = await User.findOne({
                email: verifyToken.email,
            });

            if (!isUserExists) {
                throw new AppError(
                    httpStatus.UNAUTHORIZED,
                    "User does not exist",
                    ""
                );
            }

            if (
                isUserExists.isActive === IsActive.BLOCKED ||
                isUserExists.isActive === IsActive.INACTIVE
            ) {
                throw new AppError(
                    httpStatus.UNAUTHORIZED,
                    `User is ${isUserExists.isActive}`,
                    ""
                );
            }

            if (isUserExists.isDeleted) {
                throw new AppError(
                    httpStatus.UNAUTHORIZED,
                    "User is deleted",
                    ""
                );
            }

            req.user = verifyToken;
            next();
        } catch (error) {
            next(error);
        }
    };
