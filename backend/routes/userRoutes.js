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
    getAnalytics
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

export default userRoutes