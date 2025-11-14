import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IsActive, IUser, Role } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      default: Role.USER,
    },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === "USER" ? true : false;
      },
    },
    profileImg: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || "12");
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
