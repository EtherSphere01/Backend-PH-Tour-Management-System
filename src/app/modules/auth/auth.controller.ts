import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";
import { createUserTokens } from "../../utils/userTokens";
import { envVars } from "../../config/env";
import passport from "passport";
import { JwtPayload } from "jsonwebtoken";

const credentialsLogin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        // const loginInfo = await AuthServices.credentialsLogin(req.body);
        passport.authenticate(
            "local",
            async (err: any, user: any, info: any) => {
                if (err) {
                    return next(
                        new AppError(httpStatus.UNAUTHORIZED, err.message, "")
                    );
                }

                if (!user) {
                    return next(
                        new AppError(httpStatus.NOT_FOUND, info.message, "")
                    );
                }

                const userTokens = await createUserTokens(user);

                const { password, ...rest } = user.toObject();

                setAuthCookie(res, userTokens);

                sendResponse(res, {
                    statusCode: 200,
                    success: true,
                    message: "Login successful",
                    data: {
                        accessToken: userTokens.accessToken,
                        refreshToken: userTokens.refreshToken,
                        user: rest,
                    },
                });
            }
        )(req, res, next);
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

const changePassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        const decodedToken = req.user;

        await AuthServices.changePassword(
            oldPassword,
            newPassword,
            decodedToken!
        );

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Password change successful",
            data: null,
        });
    }
);
const setPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const decodedToken = req.user as JwtPayload;
        const { password } = req.body;

        await AuthServices.setPassword(decodedToken.userId, password);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Set Password successful",
            data: null,
        });
    }
);
const resetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const decodedToken = req.user;

        await AuthServices.resetPassword(req.body, decodedToken!);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Reset Password successful",
            data: null,
        });
    }
);
const forgotPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;

        await AuthServices.forgotPassword(email);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Email sent Password successful",
            data: null,
        });
    }
);

const googleCallback = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found", "");
        }
        const tokenInfo = createUserTokens(user!);
        setAuthCookie(res, tokenInfo);

        let redirectTo = req.query.state ? String(req.query.state) : "";
        if (redirectTo.startsWith("/")) {
            redirectTo = redirectTo.slice(1);
        }
        res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
    }
);

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    setPassword,
    googleCallback,
    changePassword,
    forgotPassword,
};
