import { NextFunction, Request, Response, Router } from "express";
import { UserControllers } from "./user.controller";
import z from "zod";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { ZodObject } from "zod";
import { validateRequest } from "../../middlewares/validateRequest";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { Role } from "./user.interface";
import { envVars } from "../../config/env";
import { checkAuth } from "../../middlewares/checkAuth";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
    "/register",
    validateRequest(createUserZodSchema),
    multerUpload.single("file"),
    UserControllers.createUser
);
router.get(
    "/all-users",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    UserControllers.getAllUsers
);
router.get(
    "/:id",
    checkAuth(...Object.values(Role)),
    UserControllers.getSingleUser
);
router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe);
router.patch(
    "/:id",
    validateRequest(updateUserZodSchema),
    multerUpload.single("file"),
    checkAuth(...Object.values(Role)),
    UserControllers.updateUser
);

export const UserRoutes = router;
