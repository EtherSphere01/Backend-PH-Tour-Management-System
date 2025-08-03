import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IsActive, IUser } from "../user/user.interface";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { generateToken, verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import {
    createNewAccessTokenWithRefresh,
    createUserTokens,
} from "../../utils/userTokens";
import { sendEmail } from "../../utils/sendEmail";

const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload;
    const isUserExists = await User.findOne({ email });

    if (!isUserExists) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Email does not exist", "");
    }

    const isPasswordMatch = await bcryptjs.compare(
        password as string,
        isUserExists.password as string
    );
    if (!isPasswordMatch) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            "Password is incorrect",
            ""
        );
    }

    // const jwtPayload = {
    //     userId: isUserExists._id,
    //     email: isUserExists.email,
    //     role: isUserExists.role,
    // };

    // const accessToken = jwt.sign(jwtPayload, "secretKey", {
    //     expiresIn: "1d",
    // });

    // const accessToken = generateToken(
    //     jwtPayload,
    //     envVars.JWT_ACCESS_SECRET,
    //     envVars.JWT_ACCESS_EXPIRES
    // );

    // const refreshToken = generateToken(
    //     jwtPayload,
    //     envVars.JWT_REFRESH_SECRET,
    //     envVars.JWT_REFRESH_EXPIRES
    // );

    const userTokens = createUserTokens(isUserExists);

    const { password: pass, ...rest } = isUserExists.toObject();
    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest,
    };
};
const getNewAccessToken = async (refreshToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefresh(refreshToken);
    return {
        accessToken: newAccessToken,
    };
};

const changePassword = async (
    oldPassword: string,
    newPassword: string,
    decodedToken: JwtPayload
) => {
    const user = await User.findById(decodedToken.userId);
    const isOldPasswordMatch = await bcryptjs.compare(
        oldPassword,
        user!.password as string
    );
    if (!isOldPasswordMatch) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            "Old password is incorrect",
            ""
        );
    }

    const hashedNewPassword = await bcryptjs.hash(
        newPassword,
        parseInt(envVars.BCRYPT_SALT_ROUNDS)
    );
    user!.password = hashedNewPassword;
    await user!.save();
};

const setPassword = async (userId: string, plainPassword: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found", "");
    }

    if (
        user.password &&
        user.auths.some(
            (providerObject) => providerObject.provider === "google"
        )
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "User already has a password set",
            ""
        );
    }

    const hashedPassword = await bcryptjs.hash(
        plainPassword,
        parseInt(envVars.BCRYPT_SALT_ROUNDS)
    );

    const credentialProvider: IAuthProvider = {
        provider: "credentials",
        providerId: user.email,
    };
    const auths: IAuthProvider[] = [...user.auths, credentialProvider];
    user.password = hashedPassword;
    user.auths = auths;
    await user.save();
};

const resetPassword = async (
    payload: Record<string, any>,
    decodedToken: JwtPayload
) => {
    if (payload.id !== decodedToken.userId) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            "You are not authorized to reset this password",
            ""
        );
    }

    const isUserExists = await User.findById(decodedToken.userId);
    if (!isUserExists) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found", "");
    }
    const hashedNewPassword = await bcryptjs.hash(
        payload.newPassword,
        parseInt(envVars.BCRYPT_SALT_ROUNDS)
    );

    isUserExists.password = hashedNewPassword;
    await isUserExists.save();
};
const forgotPassword = async (email: string) => {
    const isUserExists = await User.findOne({ email });

    if (!isUserExists) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User does not exist", "");
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
        throw new AppError(httpStatus.UNAUTHORIZED, "User is deleted", "");
    }

    if (!isUserExists.isVerified) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User is not verified", "");
    }

    const jwtPayload = {
        userId: isUserExists._id,
        email: isUserExists.email,
        role: isUserExists.role,
    };

    const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
        expiresIn: "10m",
    });

    const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExists._id}&token=${resetToken}`;
    sendEmail({
        to: isUserExists.email,
        subject: "Reset Password",
        templateName: "forgetPassword",
        templateData: {
            name: isUserExists.name,
            resetUILink,
        },
    });
};

export const AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    resetPassword,
    setPassword,
    changePassword,
    forgotPassword,
};
