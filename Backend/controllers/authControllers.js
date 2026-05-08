import { otpStore } from "../utils/otpStore.js";
import { sendOtpEmail } from "../utils/sendEmail.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";


// =========================
// SEND OTP
// =========================
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // generate OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // store OTP
    otpStore[email] = {
  otp,
  expires: Date.now() + 5 * 60 * 1000,
  verified: false,
};

    // send email
    await sendOtpEmail(email, otp);

    return res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.log("SEND OTP ERROR:", error);

    return res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};


// =========================
// VERIFY OTP
// =========================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedOtp = otpStore[email];

    if (!storedOtp) {
      return res.status(400).json({
        message: "OTP not found",
      });
    }

    if (storedOtp.expires < Date.now()) {
      delete otpStore[email];

      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    otpStore[email].verified = true;

    return res.status(200).json({
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.log("VERIFY OTP ERROR:", error);

    return res.status(500).json({
      message: "OTP verification failed",
    });
  }
};


// =========================
// SIGNUP
// =========================
export const signup = async (req, res) => {
  try {

    const {
      fullName,
      email,
      phone,
      address,
      password,
      role,
    } = req.body;

    // validation
    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !password
    ) {
      return res.status(400).json({
        message: "Please enter all fields",
      });
    }

    // OTP check (IMPORTANT)
    if (!otpStore[email] || !otpStore[email].verified) {
      return res.status(400).json({
        message: "OTP not verified",
      });
    }

    if (!otpStore[email].verified) {
      return res.status(400).json({
        message: "OTP not verified",
      });
    }

    // check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      fullName,
      email,
      phone,
      address,
      password: hashedPassword,
      role,
    });

    // JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });

  } catch (error) {
    console.log("SIGNUP ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// =========================
// LOGIN
// =========================
export const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter all fields",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};