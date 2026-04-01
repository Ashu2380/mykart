import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  ip: {
    type: String,
    default: "Unknown",
  },
  browser: {
    type: String,
    default: "Unknown",
  },
  os: {
    type: String,
    default: "Unknown",
  },
  device: {
    type: String,
    default: "desktop",
  },
  location: {
    type: String,
    default: "Unknown",
  },
  loginTime: {
    type: Date,
    default: Date.now,
  },
});

const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema);

export default LoginHistory;