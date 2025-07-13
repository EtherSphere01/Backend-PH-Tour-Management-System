import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";

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
    return {
        email: isUserExists.email,
    };
};

export const AuthServices = {
    credentialsLogin,
};
