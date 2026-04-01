import express from "express";
import {
  sendOtpController,
  verifyOtpAndRegister,
  login,
  logOut,
  googleLogin,
  adminLogin
} from "../controller/authController.js";

import isAuth from "../middleware/isAuth.js";
import LoginHistory from "../model/LoginHistory.js";

const authRoutes = express.Router();

// 🔐 OTP BASED SIGNUP
authRoutes.post("/send-otp", sendOtpController);
authRoutes.post("/verify-otp", verifyOtpAndRegister);

// 🔑 LOGIN / LOGOUT
authRoutes.post("/login", login);
authRoutes.get("/logout", logOut);

// 🌐 GOOGLE LOGIN
authRoutes.post("/googlelogin", googleLogin);

// 👨‍💼 ADMIN LOGIN
authRoutes.post("/adminlogin", adminLogin);

// ========================= LOGIN HISTORY =========================
// 🔍 GET LOGIN HISTORY (SECURE)
authRoutes.get("/login-history", isAuth, async (req, res) => {
  try {
    // ✅ Always use logged-in user ID (SECURE)
    const userId = req.user._id;

    const history = await LoginHistory.find({
      userId: userId,
    }).sort({ loginTime: -1 });

    res.status(200).json(history);
  } catch (error) {
    console.log("Login history error", error);
    res.status(500).json({ message: "Error fetching login history" });
  }
});

export default authRoutes;