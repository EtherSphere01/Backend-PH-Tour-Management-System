import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import mongoose from "mongoose";
import { deleteImageFromCLoudinary } from "../config/cloudinary.config";

const handleDuplicateError = (err: any) => {
    return {
        statusCode: 400,
        message: `Duplicate field value: ${
            Object.keys(err.keyValue)[0]
        }. Please use another value!`,
    };
};

const handleValidationError = (err: any) => {
    return {
        statusCode: 400,
        message: Object.values(err.errors)
            .map((error: any) => error.message)
            .join(", "),
    };
};

const handleCastError = (err: mongoose.Error.CastError) => {
    return {
        statusCode: 400,
        message: `Invalid ${err.path}: ${err.value}`,
    };
};

const handleZodError = (err: any) => {
    return {
        statusCode: 400,
        message: err.errors.map((error: any) => error.message).join(", "),
    };
};

export const globalErrorHandler = async (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.file) {
        await deleteImageFromCLoudinary(req.file.path);
    }
    if (req.files && Array.isArray(req.files) && req.files.length) {
        const imageUrls = (req.files as Express.Multer.File[]).map(
            (file) => file.path
        );
        await Promise.all(
            imageUrls.map((url) => deleteImageFromCLoudinary(url))
        );
    }
    let statusCode = 500;
    let message = "Internal server error";

    if (err.code === 11000) {
        const duplicateError = handleDuplicateError(err);
        statusCode = duplicateError.statusCode;
        message = duplicateError.message;
    } else if (err.name === "ZodError") {
        const zodError = handleZodError(err);
        statusCode = zodError.statusCode;
        message = zodError.message;
    } else if (err.name === "CastError") {
        // mongoose validation error
        const castError = handleCastError(err);
        statusCode = castError.statusCode;
        message = castError.message;
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof Error) {
        statusCode = 500;
        message = err.message;
    } else if (err.name === "ValidationError") {
        const validationError = handleValidationError(err);
        statusCode = validationError.statusCode;
        message = validationError.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        err,
        stack: envVars.NODE_ENV === "development" ? err.stack : null,
    });
};
