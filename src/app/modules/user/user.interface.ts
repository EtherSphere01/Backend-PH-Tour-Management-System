import { Types } from "mongoose";

export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    USER = "USER",
    ADMIN = "ADMIN",
    GUIDE = "GUIDE",
}

export interface IAuthProvider {
    provider: "google" | "credentials"; // google , credential, etc.
    providerId: string; // googleId, etc.
}

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED",
}
export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    address?: string;
    picture?: string;
    isDeleted?: boolean;
    isVerified?: boolean;
    isActive?: IsActive;
    role: Role;
    auths: IAuthProvider[];
    bookings?: Types.ObjectId[];
    guides?: Types.ObjectId[];
}
