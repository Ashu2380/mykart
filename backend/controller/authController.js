import User from "../model/userModel.js";
import Referral from "../model/referralModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import otpGenerator from "otp-generator";
import { genToken, genToken1 } from "../config/token.js";
import { validateReferralCode } from "./referralController.js";
import sendOtp from "../utils/sendOtp.js";
import LoginHistory from "../model/LoginHistory.js";
import geoip from "geoip-lite";

// ✅ CORRECT IMPORT (FIXED)
import { UAParser } from "ua-parser-js";

// ========================= DEVICE HELPER =========================
const getDeviceInfo = (req) => {
  const parser = new UAParser(req.headers["user-agent"]);
  const result = parser.getResult();

  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "0.0.0.0";

  const geo = geoip.lookup(ip);

  return {
    ip,
    browser: result.browser.name || "Unknown",
    os: result.os.name || "Unknown",
    device: result.device.type || "desktop",
    location: geo
      ? `${geo.city || "Unknown"}, ${geo.country}`
      : "Unknown",
  };
};

// ========================= SEND OTP =========================
export const sendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    let user = await User.findOne({ email });

    if (user && user.otpExpiry && user.otpExpiry > Date.now()) {
      return res.status(400).json({ message: "OTP already sent. Try later." });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    if (!user) {
      user = new User({ email });
    }

    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();
    await sendOtp(email, otp);

    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    console.log("Send OTP error", error);
    return res.status(500).json({ message: "Send OTP error" });
  }
};

// ========================= VERIFY OTP + REGISTER =========================
export const verifyOtpAndRegister = async (req, res) => {
  try {
    const { name, email, password, otp, referralCode } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Weak password" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    let referredBy = null;

    if (referralCode) {
      const referralValidation = await validateReferralCode(
        { body: { referralCode } },
        { json: (data) => data }
      );

      if (referralValidation.valid) {
        referredBy = referralValidation.referrer.id;

        await Referral.create({
          referrerId: referredBy,
          referredUserId: null,
          referralCode: referralCode.toUpperCase(),
          status: "pending",
        });
      }
    }

    user.name = name;
    user.password = hashPassword;
    user.isVerified = true;
    user.referredBy = referredBy;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    if (referredBy) {
      await Referral.findOneAndUpdate(
        { referrerId: referredBy, referralCode: referralCode.toUpperCase() },
        { referredUserId: user._id }
      );

      await User.findByIdAndUpdate(referredBy, {
        $inc: { "referralStats.totalReferrals": 1 },
      });
    }

    const token = await genToken(user._id);

    // Configure cookie based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    user.password = undefined;

    return res.status(201).json(user);

  } catch (error) {
    console.log("Registration error", error);
    return res.status(500).json({ message: "Registration error" });
  }
};

// ========================= LOGIN =========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // ✅ SAVE LOGIN HISTORY
    const deviceInfo = getDeviceInfo(req);

    await LoginHistory.create({
      userId: user._id,
      ip: deviceInfo.ip,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      device: deviceInfo.device,
      location: deviceInfo.location,
    });

    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      $inc: { loginCount: 1 },
    });

    const token = await genToken(user._id);

    // Configure cookie based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    user.password = undefined;

    return res.status(200).json(user);

  } catch (error) {
    console.log("login error", error);
    return res.status(500).json({ message: "Login error" });
  }
};

// ========================= GOOGLE LOGIN =========================
export const googleLogin = async (req, res) => {
  try {
    const { name, email, referralCode } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      let referredBy = null;

      if (referralCode) {
        const referralValidation = await validateReferralCode(
          { body: { referralCode } },
          { json: (data) => data }
        );

        if (referralValidation.valid) {
          referredBy = referralValidation.referrer.id;

          await Referral.create({
            referrerId: referredBy,
            referredUserId: null,
            referralCode: referralCode.toUpperCase(),
            status: "pending",
          });
        }
      }

      user = await User.create({
        name,
        email,
        referredBy,
        isVerified: true,
      });
    }

    // ✅ SAVE LOGIN HISTORY
    const deviceInfo = getDeviceInfo(req);

    await LoginHistory.create({
      userId: user._id,
      ip: deviceInfo.ip,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      device: deviceInfo.device,
      location: deviceInfo.location,
    });

    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      $inc: { loginCount: 1 },
    });

    const token = await genToken(user._id);

    // Configure cookie based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    user.password = undefined;

    return res.status(200).json(user);

  } catch (error) {
    console.log("googleLogin error", error);
    return res.status(500).json({ message: "googleLogin error" });
  }
};

// ========================= LOGOUT =========================
export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("logout error", error);
    return res.status(500).json({ message: "Logout error" });
  }
};

// ========================= ADMIN LOGIN =========================
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = await genToken1(email);

      // Configure cookie based on environment
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'Strict',
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json(token);
    }

    return res.status(400).json({ message: "Invalid credentials" });

  } catch (error) {
    console.log("AdminLogin error", error);
    return res.status(500).json({ message: "AdminLogin error" });
  }
};