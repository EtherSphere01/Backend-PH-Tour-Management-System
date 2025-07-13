import { Types } from "mongoose";

export enum Role {
    Super_Admin = "SUPER_ADMIN",
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
