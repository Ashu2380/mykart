import express from "express"
import isAuth from "../middleware/isAuth.js"
import {
    getAdmin,
    getCurrentUser,
    getAllUsers,
    updateProfile,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    changePassword,
    getAnalytics,
    getNotifications,
    markNotificationAsRead,
    deleteNotification,
    createTestNotification,
    submitContact,
    getPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod
} from "../controller/userController.js"
import adminAuth from "../middleware/adminAuth.js"

let userRoutes = express.Router()

userRoutes.get("/getcurrentuser",isAuth,getCurrentUser)
userRoutes.get("/getadmin",adminAuth,getAdmin)
userRoutes.get("/all",adminAuth, getAllUsers)
userRoutes.get("/analytics",adminAuth, getAnalytics)

// Profile routes
userRoutes.put("/profile", isAuth, updateProfile)
userRoutes.put("/change-password", isAuth, changePassword)

// Address routes
userRoutes.get("/addresses", isAuth, getAddresses)
userRoutes.post("/addresses", isAuth, addAddress)
userRoutes.put("/addresses/:addressId", isAuth, updateAddress)
userRoutes.delete("/addresses/:addressId", isAuth, deleteAddress)
userRoutes.put("/addresses/:addressId/default", isAuth, setDefaultAddress)

// Notification routes
userRoutes.get("/notifications", isAuth, getNotifications)
userRoutes.put("/notifications/:notificationId/read", isAuth, markNotificationAsRead)
userRoutes.delete("/notifications/:notificationId", isAuth, deleteNotification)
// Test notification route - for testing only
userRoutes.post("/notifications/test", isAuth, createTestNotification)
userRoutes.put("/addresses/:addressId/default", isAuth, setDefaultAddress)

// Contact form route (public - no auth required)
userRoutes.post("/contact", submitContact)

// Payment Methods routes
userRoutes.get("/payment-methods", isAuth, getPaymentMethods)
userRoutes.post("/payment-methods", isAuth, addPaymentMethod)
userRoutes.put("/payment-methods/:methodId", isAuth, updatePaymentMethod)
userRoutes.delete("/payment-methods/:methodId", isAuth, deletePaymentMethod)
userRoutes.put("/payment-methods/:methodId/default", isAuth, setDefaultPaymentMethod)

export default userRoutes