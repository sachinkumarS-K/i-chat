import User from "../models/userModel.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields except pic are required",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    let pic = `https://api.dicebear.com/5.x/initials/svg?seed=${name}%20K`;

    const user = await User.create({
      name,
      email,
      password,
      img: { secure_url: pic },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Unable to register user, please try again",
      });
    }

    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });
        if (result) {
          user.img.public_id = result.public_id;
          user.img.secure_url = result.secure_url;
          fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
    await user.save();

    const token = user.generateToken();

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }
    if (password !== user.password) {
      return res.status(400).json({
        success: false,
        message: "Password not matched",
      });
    }

    const token = user.generateToken();

    user.password = undefined;
    res
      .cookie("token", "sachin", {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .status(200)
      .json({
        success: true,
        message: "User log in successfully",
        user,
        token,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const allUsers = async (req, res) => {
  try {
    const searchKeyword = req.query.search;

    if (!searchKeyword) {
      return res
        .status(400)
        .json({ success: false, message: "Search keyword is required" });
    }
    const query = {
      $and: [
        {
          $or: [
            { name: { $regex: searchKeyword, $options: "i" } },
            { email: { $regex: searchKeyword, $options: "i" } },
          ],
        },
        { _id: { $ne: req.user.id } },
      ],
    };

    const users = await User.find(query);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { registerUser, loginUser, allUsers };
