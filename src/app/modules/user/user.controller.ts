import { NextFunction, Request, Response } from "express";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import { userServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

// const createUser = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const user = await userServices.createUser(req.body);
//         res.status(httpStatus.CREATED).json({
//             message: "User created successfully",
//             user,
//         });
//     } catch (error: any) {
//         next(error);
//     }
// };

const createUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = {
            ...req.body,
            image: req.file?.path || "",
        };

        const user = await userServices.createUser(payload);

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "User created successfully",
            data: user,
        });
    }
);

const getAllUsers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await userServices.getAllUsers();
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Users retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    }
);

const updateUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.id;

        // const token = req.headers.authorization;
        // const verifiedToken = verifyToken(
        //     token as string,
        //     envVars.JWT_ACCESS_SECRET
        // ) as JwtPayload;

        const verifiedToken = req.user;

        const payload = {
            ...req.body,
            picture: req.file?.path || "",
        };
        const user = await userServices.updateUser(
            userId,
            payload,
            verifiedToken as JwtPayload
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "User updated successfully",
            data: user,
        });
    }
);

export const UserControllers = {
    createUser,
    getAllUsers,
    updateUser,
};
