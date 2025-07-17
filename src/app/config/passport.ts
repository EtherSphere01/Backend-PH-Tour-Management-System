import passport from "passport";
import {
    Strategy as GoogleStrategy,
    Profile,
    VerifyCallback,
} from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";

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

                let user = await User.findOne({ email });
                if (!user) {
                    user = await User.create({
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
                return done(null, user);
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
