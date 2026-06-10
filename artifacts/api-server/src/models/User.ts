import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  addresses: {
    _id?: mongoose.Types.ObjectId;
    type: string;
    address: string;
    lat?: number;
    lng?: number;
  }[];
  createdAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    addresses: [
      {
        type: { type: String, default: "Home" },
        address: String,
        lat: Number,
        lng: Number,
      },
    ],
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

export const User = mongoose.model<IUser>("User", UserSchema);
