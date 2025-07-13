import { NextFunction, Request, Response } from "express";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import { userServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

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
        const user = await userServices.createUser(req.body);

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

export const UserControllers = {
    createUser,
    getAllUsers,
};
