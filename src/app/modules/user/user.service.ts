/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";

const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    const isUserExists = await User.findOne({ email });
    if (isUserExists) {
        throw new AppError(httpStatus.BAD_REQUEST, "User already exists", "");
    }

    const hashedPassword = await bcryptjs.hash(
        password as string,
        parseInt(envVars.BCRYPT_SALT_ROUNDS)
    );

    const authProvider: IAuthProvider = {
        provider: "credentials",
        providerId: email!,
    };
    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest,
    });
    return user;
};

const getAllUsers = async () => {
    const users = await User.find({});

    const totalUsers = await User.countDocuments();
    return {
        data: users,
        meta: {
            page: 1,
            limit: totalUsers,
            total: totalUsers,
            totalPage: 1,
        },
    };
};

const getSingleUser = async (id: string) => {
    const user = await User.findById(id).select("-password");
    return {
        data: user,
    };
};
const getMe = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    return {
        data: user,
    };
};

const updateUser = async (
    userId: string,
    payload: Partial<IUser>,
    decodedToken: JwtPayload
) => {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
        if (userId !== decodedToken.useId) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not Authorized to update this user",
                ""
            );
        }
    }

    const isUserExists = await User.findById(userId);
    if (!isUserExists) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found", "");
    }
    if (
        decodedToken.role === Role.ADMIN &&
        isUserExists.role === Role.SUPER_ADMIN
    ) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not Authorized to update this user",
            ""
        );
    }

    if (payload.role) {
        if (
            decodedToken.role === Role.USER ||
            decodedToken.role === Role.GUIDE
        ) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not Authorized",
                ""
            );
        }
        // if (
        //     payload.role === Role.SUPER_ADMIN &&
        //     decodedToken.role === Role.ADMIN
        // ) {
        //     throw new AppError(
        //         httpStatus.FORBIDDEN,
        //         "You are not Authorized",
        //         ""
        //     );
        // }
    }

    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (
            decodedToken.role === Role.USER ||
            decodedToken.role === Role.GUIDE
        ) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not Authorized",
                ""
            );
        }
    }

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    });

    if (isUserExists.picture && payload.picture) {
        await deleteImageFromCLoudinary(isUserExists.picture);
    }
    return newUpdatedUser;
};

export const userServices = {
    createUser,
    getAllUsers,
    updateUser,
    getMe,
    getSingleUser,
};
