import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
    PORT: string;
    DB_URL: string;
    NODE_ENV: "development" | "production";
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRES: string;
    BCRYPT_SALT_ROUNDS: string;
    SUPER_ADMIN_EMAIL: string;
    SUPER_ADMIN_PASSWORD: string;
}

const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVars: string[] = [
        "PORT",
        "DB_URL",
        "NODE_ENV",
        "JWT_ACCESS_SECRET",
        "JWT_ACCESS_EXPIRES",
        "BCRYPT_SALT_ROUNDS",
        "SUPER_ADMIN_EMAIL",
        "SUPER_ADMIN_PASSWORD",
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
        BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS!,
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL!,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD!,
    };
};

export const envVars = loadEnvVariables();
