import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";

const credentialsLogin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const loginInfo = await AuthServices.credentialsLogin(req.body);

        setAuthCookie(res, loginInfo);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Login successful",
            data: loginInfo,
        });
    }
);

const getNewAccessToken = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Refresh token is missing",
                ""
            );
        }

        const tokenInfo = await AuthServices.getNewAccessToken(refreshToken);

        setAuthCookie(res, tokenInfo);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "New Access token retrieve successful",
            data: tokenInfo,
        });
    }
);

const logout = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Logout successful",
            data: null,
        });
    }
);

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
};
