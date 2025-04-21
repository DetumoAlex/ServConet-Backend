// const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user-model");
const asyncHandler = require("express-async-handler");
const { generateOTP, hashOTP } = require("../utils/otp");
const { sendOTPEmail } = require("../utils/email-utils");

// Register user
exports.register = async (req, res) => {
    console.log("Register route initialized");
    try {
      const { name, email, password, role } = req.body;
      console.log("Registering user:", { name, email, password, role });
  
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });
  
    //   const salt = await bcrypt.genSalt(10);
    //   const hashedPassword = await bcrypt.hash(password, salt);
  
      const otp = generateOTP(); // 🔐 Create raw OTP
      const hashedOtp = await hashOTP(otp); // 🔐 Hash OTP
  
      user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        emailVerificationOTP: hashedOtp,
        emailVerificationOTPExpires: new Date(Date.now() + 5 * 60 * 1000),
      });
  
      await user.save();
  
      // You can send OTP here via email or SMS if needed
      console.log(`Generated OTP for ${email}: ${otp}`);
  
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};

// Update user details
exports.updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Allow users to update only their own data (unless admin)
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

// Delete a user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

// 🔹 GET /api/users
exports.requestPasswordReset = asyncHandler(async (req, res) => {
  const { identifier } = req.body; // email or phone

  if (!identifier) {
    return res.status(400).json({
      message: "Email or phone is required",
      ok: false,
      statusCode: 400,
    });
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
  });

  if (!user) {
    return res
      .status(404)
      .json({ message: "User not found", ok: false, statusCode: 400 });
  }

  const otp = generateOTP(6); // e.g., "128394"
  const hashedOtp = await hashOTP(otp);

  user.passwordResetOtp = hashedOtp;
  user.passwordResetOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
  user.passwordResetVerified = false;
  await user.save();

  try {
    await sendOTPEmail(user.email, user.fullName, otp, 5); // Replace with SMS if needed
    return res.status(200).json({
      message: "OTP has been sent to your email/phone",
      ok: true,
      statusCode: 200,
    });
  } catch (err) {
    console.error("OTP send error:", err);
    return res.status(500).json({
      message: "Failed to send OTP. Please try again.",
      ok: false,
      statusCode: 500,
    });
  }
});

//verify forgot password-otp
exports.verifyOtp = asyncHandler(async (req, res) => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    return res.status(400).json({
      message: "Email/phone and OTP are required",
      ok: false,
      statusCode: 400,
    });
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
  });

  if (!user || !user.passwordResetOtp || !user.passwordResetOtpExpires) {
    return res
      .status(400)
      .json({ message: "Invalid request", ok: false, statusCode: 400 });
  }

  if (user.passwordResetOtpExpires < Date.now()) {
    return res
      .status(400)
      .json({ message: "OTP has expired", ok: false, statusCode: 400 });
  }

  const isMatch = await bcrypt.compare(otp, user.passwordResetOtp);
  if (!isMatch) {
    return res
      .status(400)
      .json({ message: "Invalid OTP", ok: false, statusCode: 400 });
  }

  user.passwordResetVerified = true;
  await user.save();

  return res
    .status(200)
    .json({ message: "OTP verified successfully", ok: true, statusCode: 200 });
});

//reset password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { identifier, newPassword } = req.body;

  if (!identifier || !newPassword) {
    return res
      .status(400)
      .json({ message: "All fields are required", ok: false, statusCode: 400 });
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
  });

  if (!user || !user.passwordResetVerified) {
    return res.json({
      message: "OTP verification required",
      ok: false,
      statusCode: 400,
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  if (!hashedPassword) {
    return res.status(500).json({
      message: "Failed to hash password",
      ok: false,
      statusCode: 500,
    });
  }
  user.password = hashedPassword;
  console.log("Stored password hash in DB:", user.password); //debugging

  user.passwordResetOtp = null;
  user.passwordResetOtpExpires = null;
  user.passwordResetVerified = false;
  await user.save();

  return res
    .status(200)
    .json({ message: "Password has been reset", ok: true, statusCode: 200 });
});

//logout
exports.logout = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get the user ID from the session or JWT payload
  
    User.isLoggedIn = false; // Set isLoggedIn to false
    User.lastLogout = new Date();
    await User.save();
  
    // Clear session in Redis
    try {
      await deleteSession(userId);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Error invalidating session", ok: false, statusCode: 500 });
    }
  
    // Clear the cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
  
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
  
    return res.status(200).json({ message: "Logout successful", ok: true, statusCode: 200 });
  });