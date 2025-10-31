import { enVars } from "../config/env";
import { IAuthProviders, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs";

export const seedAdmin = async() => {
    try{
        const isUserAdminExist = await User.findOne({email: enVars.ADMIN_EMAIL})
        if(isUserAdminExist){
            console.log("Admin Already Exist");
            return;
        };

        console.log("Trying to create admin")

        const hashedPassword = await bcryptjs.hash(enVars.ADMIN_PASSWORD, Number(enVars.BCRYPT_SALT_ROUND));

        const authProvider : IAuthProviders = {
            provider: "credential",
            providerId: enVars.ADMIN_EMAIL,
        }

        const payload: IUser = {
            name: "Admin",
            role: Role.ADMIN,
            email: enVars.ADMIN_EMAIL,
            password: hashedPassword,
            isVerified: true,
            auths: [authProvider],
        }

        const Admin = await User.create(payload);
        console.log(Admin);
        console.log("Admin Created Successfully!")
    }catch(error){
        console.log(error)
    }
};
