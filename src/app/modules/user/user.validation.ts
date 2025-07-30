import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
    name: z
        .string({ message: "Name must be string" })
        .min(2, { message: "Name too short. Minimum 2 character long" })
        .max(50, {
            message: "Name too long. Maximum 50 character long",
        }),
    email: z
        .string({ message: "Email must be string" })
        .email({ message: "Invalid email format" }),
    password: z
        .string()
        .min(8, {
            message: "Password must minimum 8 character long",
        })
        .regex(/[A-Z]/, {
            message: "Password must contain at least one uppercase letter",
        })
        .regex(/[a-z]/, {
            message: "Password must contain at least one lowercase letter",
        })
        .regex(/\d/, {
            message: "Password must contain at least one number",
        })
        .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, {
            message: "Password must contain at least one special character",
        }),

    phone: z
        .string({ message: "Phone must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message:
                "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
        .optional(),
    address: z
        .string({ message: "Address must be string" })
        .max(200, {
            message: "Address too long. Maximum 200 character long",
        })
        .optional(),
});

export const updateUserZodSchema = z.object({
    name: z
        .string({ message: "Name must be string" })
        .min(2, { message: "Name too short. Minimum 2 character long" })
        .max(50, {
            message: "Name too long. Maximum 50 character long",
        })
        .optional(),

    phone: z
        .string({ message: "Phone must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message:
                "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
        .optional(),
    address: z
        .string({ message: "Address must be string" })
        .max(200, {
            message: "Address too long. Maximum 200 character long",
        })
        .optional(),
    role: z.enum(Object.values(Role) as [string]).optional(),
    isActive: z.enum(Object.values(IsActive) as [string]).optional(),
    isDeleted: z
        .boolean({ message: "isDeleted must be a true or false" })
        .optional(),
    isVerified: z
        .boolean({ message: "isVerified must be a true or false" })
        .optional(),
});
