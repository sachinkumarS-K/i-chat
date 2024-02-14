import mongoose from "mongoose";
import Jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    img: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

userSchema.methods = {
  generateToken: function () {
    const token = Jwt.sign(
      {
        id: this._id,
        email: this.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
    return token;
  },
};

const User = mongoose.model("User", userSchema);

export default User;
