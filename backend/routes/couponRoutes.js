import express from 'express';
import { 
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon
} from "../controller/couponController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Public route - validate coupon (for customers)
router.post("/validate", validateCoupon);

// Admin routes
router.post("/create", adminAuth, createCoupon);
router.get("/getallcoupons", adminAuth, getAllCoupons);
router.get("/getcoupon/:id", adminAuth, getCouponById);
router.put("/updatecoupon/:id", adminAuth, updateCoupon);
router.delete("/deletecoupon/:id", adminAuth, deleteCoupon);

export default router;
