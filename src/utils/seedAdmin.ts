import { enVars } from "../config/env";
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs";

export const seedAdmin = async() => {
    try{
        const isUserAdminExist = await User.findOne({email: enVars.ADMIN_EMAIL})
        if(isUserAdminExist){
            return;
        };


        const hashedPassword = await bcryptjs.hash(enVars.ADMIN_PASSWORD, Number(enVars.BCRYPT_SALT_ROUND));

        const authProvider : IAuthProvider = {
            provider: "credentials",
            providerId: enVars.ADMIN_EMAIL,
        }

        const payload: Partial<IUser> = {
            name: "Admin",
            role: Role.ADMIN,
            email: enVars.ADMIN_EMAIL,
            password: hashedPassword,
            isApproved: true,
            auths: [authProvider],
        }

        await User.create(payload);
   
    }catch(error){
        console.log(error)
    }
};
