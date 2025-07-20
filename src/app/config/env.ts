import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
    PORT: string;
    DB_URL: string;
    NODE_ENV: "development" | "production";
    BCRYPT_SALT_ROUNDS: string;
    SUPER_ADMIN_EMAIL: string;
    SUPER_ADMIN_PASSWORD: string;
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRES: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_CALLBACK_URL?: string;
    EXPRESS_SESSION_SECRET?: string;
    FRONTEND_URL?: string;
    SSL: {
        STORE_ID: string;
        STORE_PASS: string;
        SSL_PAYMENT_API: string;
        SSL_VALIDATION_API: string;
        SSL_SUCCESS_FRONTEND_URL: string;
        SSL_FAIL_FRONTEND_URL: string;
        SSL_CANCEL_FRONTEND_URL: string;
        SSL_SUCCESS_BACKEND_URL: string;
        SSL_FAIL_BACKEND_URL: string;
        SSL_CANCEL_BACKEND_URL: string;
    };
}

const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVars: string[] = [
        "PORT",
        "DB_URL",
        "NODE_ENV",
        "JWT_ACCESS_SECRET",
        "JWT_ACCESS_EXPIRES",
        "JWT_REFRESH_SECRET",
        "JWT_REFRESH_EXPIRES",
        "BCRYPT_SALT_ROUNDS",
        "SUPER_ADMIN_EMAIL",
        "SUPER_ADMIN_PASSWORD",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_CALLBACK_URL",
        "EXPRESS_SESSION_SECRET",
        "FRONTEND_URL",
        "SSL_STORE_ID",
        "SSL_STORE_PASS",
        "SSL_PAYMENT_API",
        "SSL_VALIDATION_API",
        "SSL_SUCCESS_FRONTEND_URL",
        "SSL_FAIL_FRONTEND_URL",
        "SSL_CANCEL_FRONTEND_URL",
        "SSL_SUCCESS_BACKEND_URL",
        "SSL_FAIL_BACKEND_URL",
        "SSL_CANCEL_BACKEND_URL",
    ];

    requiredEnvVars.forEach((envVar) => {
        if (!process.env[envVar]) {
            throw new Error(`Environment variable ${envVar} is not defined`);
        }
    });
    return {
        PORT: process.env.PORT as string,
        DB_URL: process.env.DB_URL!,
        NODE_ENV: process.env.NODE_ENV as "development" | "production",
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES!,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES!,
        BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS!,
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL!,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD!,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
        EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET,
        FRONTEND_URL: process.env.FRONTEND_URL,
        SSL: {
            STORE_ID: process.env.SSL_STORE_ID!,
            STORE_PASS: process.env.SSL_STORE_PASS!,
            SSL_PAYMENT_API: process.env.SSL_PAYMENT_API!,
            SSL_VALIDATION_API: process.env.SSL_VALIDATION_API!,
            SSL_SUCCESS_FRONTEND_URL: process.env.SSL_SUCCESS_FRONTEND_URL!,
            SSL_FAIL_FRONTEND_URL: process.env.SSL_FAIL_FRONTEND_URL!,
            SSL_CANCEL_FRONTEND_URL: process.env.SSL_CANCEL_FRONTEND_URL!,
            SSL_SUCCESS_BACKEND_URL: process.env.SSL_SUCCESS_BACKEND_URL!,
            SSL_FAIL_BACKEND_URL: process.env.SSL_FAIL_BACKEND_URL!,
            SSL_CANCEL_BACKEND_URL: process.env.SSL_CANCEL_BACKEND_URL!,
        },
    };
};

export const envVars = loadEnvVariables();
