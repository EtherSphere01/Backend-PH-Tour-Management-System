import passport from "passport";
import {
    Strategy as GoogleStrategy,
    Profile,
    VerifyCallback,
} from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { IsActive, Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";

passport.use(
    new GoogleStrategy(
        {
            clientID: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL: envVars.GOOGLE_CALLBACK_URL,
        },
        async (
            accessToken: string,
            refreshToken: string,
            profile: Profile,
            done: VerifyCallback
        ) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email) {
                    return done(null, false, {
                        message: "No email found in profile",
                    });
                }

                let isUserExist = await User.findOne({ email });

                if (
                    isUserExist &&
                    (isUserExist.isActive === IsActive.BLOCKED ||
                        isUserExist.isActive === IsActive.INACTIVE)
                ) {
                    // throw new AppError(
                    //     httpStatus.UNAUTHORIZED,
                    //     `User is ${isUserExist.isActive}`,
                    //     ""
                    // );

                    return done(null, false, {
                        message: `User is ${isUserExist.isActive}`,
                    });
                }

                if (isUserExist && isUserExist.isDeleted) {
                    // throw new AppError(
                    //     httpStatus.UNAUTHORIZED,
                    //     "User is deleted",
                    //     ""
                    // );

                    return done(null, false, {
                        message: "User is deleted",
                    });
                }

                if (isUserExist && !isUserExist.isVerified) {
                    // throw new AppError(
                    //     httpStatus.UNAUTHORIZED,
                    //     "User is not verified",
                    //     ""
                    // );
                    return done(null, false, {
                        message: "User is not verified",
                    });
                }

                if (!isUserExist) {
                    isUserExist = await User.create({
                        email,
                        name: profile.displayName || "Unknown User",
                        profilePicture: profile.photos?.[0]?.value || "",
                        role: Role.USER,
                        isVerified: true,
                        auths: {
                            provider: "google",
                            providerId: profile.id,
                        },
                    });
                }
                return done(null, isUserExist);
            } catch (error) {
                return done(error as Error);
            }
        }
    )
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id);
});

passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
        },
        async (email: string, passport: string, done: any) => {
            try {
                const isUserExist = await User.findOne({ email });
                if (!isUserExist) {
                    return done(null, false, {
                        message: "User does not exist",
                    });
                }

                if (
                    isUserExist.isActive === IsActive.BLOCKED ||
                    isUserExist.isActive === IsActive.INACTIVE
                ) {
                    throw new AppError(
                        httpStatus.UNAUTHORIZED,
                        `User is ${isUserExist.isActive}`,
                        ""
                    );
                }

                if (isUserExist.isDeleted) {
                    throw new AppError(
                        httpStatus.UNAUTHORIZED,
                        "User is deleted",
                        ""
                    );
                }

                if (!isUserExist.isVerified) {
                    throw new AppError(
                        httpStatus.UNAUTHORIZED,
                        "User is not verified",
                        ""
                    );
                }

                const isGoogleAuthenticated = isUserExist.auths.some(
                    (providerObjects) => providerObjects.provider === "google"
                );

                if (isGoogleAuthenticated && !isUserExist.password) {
                    return done(null, false, {
                        message: "Please login with Google",
                    });
                }

                const isPasswordMatch = await bcrypt.compare(
                    passport,
                    isUserExist.password!
                );
                if (!isPasswordMatch) {
                    return done(null, false, {
                        message: "Incorrect password",
                    });
                }

                return done(null, isUserExist);
            } catch (error) {
                done(error);
            }
        }
    )
);
