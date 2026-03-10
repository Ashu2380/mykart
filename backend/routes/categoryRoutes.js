import express from 'express';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  removeSubcategory
} from "../controller/categoryController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Public route - for frontend to get categories
router.get("/getall", getAllCategories);

// Admin routes
router.post("/create", adminAuth, createCategory);
router.put("/update/:id", adminAuth, updateCategory);
router.delete("/delete/:id", adminAuth, deleteCategory);
router.post("/addsubcategory/:id", adminAuth, addSubcategory);
router.post("/removesubcategory/:id", adminAuth, removeSubcategory);

export default router;
