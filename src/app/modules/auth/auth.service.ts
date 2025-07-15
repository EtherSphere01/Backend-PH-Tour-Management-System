import AppError from "../../errorHelpers/AppError";
import { IsActive, IUser } from "../user/user.interface";
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

const resetPassword = async (
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

export const AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    resetPassword,
};
