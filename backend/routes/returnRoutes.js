import express from 'express'
import isAuth from '../middleware/isAuth.js'
import adminAuth from '../middleware/adminAuth.js'
import { 
  requestReturn, 
  getUserReturns, 
  getUserReturnById, 
  generateReturnLabel,
  getAllReturns,
  updateReturnStatus,
  deleteReturn
} from '../controller/returnController.js'

const returnRoutes = express.Router()

// User routes
returnRoutes.post("/request", isAuth, requestReturn) // Submit return request
returnRoutes.get("/user", isAuth, getUserReturns) // Get user's returns
returnRoutes.get("/user/:id", isAuth, getUserReturnById) // Get specific return
returnRoutes.get("/:id/label", isAuth, generateReturnLabel) // Generate return label

// Admin routes
returnRoutes.get("/admin/all", adminAuth, getAllReturns) // Get all returns
returnRoutes.put("/admin/:id/status", adminAuth, updateReturnStatus) // Update return status
returnRoutes.delete("/admin/:id", adminAuth, deleteReturn) // Delete return

export default returnRoutes