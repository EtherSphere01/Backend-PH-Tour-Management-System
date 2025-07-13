import { envVars } from "../config/env";
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs";

export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExists = await User.findOne({
            email: envVars.SUPER_ADMIN_EMAIL,
        });

        if (isSuperAdminExists) {
            console.log("Super admin already exists.");
            return;
        }

        const hashedPassword = await bcryptjs.hash(
            envVars.SUPER_ADMIN_PASSWORD,
            parseInt(envVars.BCRYPT_SALT_ROUNDS)
        );

        const authProvider: IAuthProvider = {
            provider: "credentials",
            providerId: envVars.SUPER_ADMIN_EMAIL,
        };

        const payload: IUser = {
            name: "Super Admin",
            role: Role.SUPER_ADMIN,
            email: envVars.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            auths: [authProvider],
            isVerified: true,
        };
        const superAdmin = await User.create(payload);
        console.log("Super admin seeded successfully:", superAdmin);
    } catch (error) {
        console.error("Error seeding super admin:", error);
    }
};
