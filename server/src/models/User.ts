import mongoose from "mongoose";
import type { IUser } from "../types/user";

const UserSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    set: (v: string | undefined) => {
      if (v) {
        return v.trim().toLowerCase();
      }
    },
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
