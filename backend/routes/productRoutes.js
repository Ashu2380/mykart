import express from 'express'
import { addProduct, listProduct, removeProduct, updateProduct, getAIRecommendations, visualSearch, checkPriceDrops } from '../controller/productController.js'
import upload from '../middleware/multer.js'
import adminAuth from "../middleware/adminAuth.js"


let productRoutes = express.Router()

productRoutes.post("/addproduct",adminAuth,upload.fields([
    {name:"image1",maxCount:1},
    {name:"image2",maxCount:1},
    {name:"image3",maxCount:1},
    {name:"image4",maxCount:1}]),addProduct)

productRoutes.get("/list", listProduct)
productRoutes.post("/ai-recommendations", getAIRecommendations)
productRoutes.post("/visual-search", upload.single('image'), visualSearch)
productRoutes.post("/remove/:id",adminAuth,removeProduct)
productRoutes.put("/update/:id",adminAuth,upload.fields([
    {name:"image1",maxCount:1},
    {name:"image2",maxCount:1},
    {name:"image3",maxCount:1},
    {name:"image4",maxCount:1}]),updateProduct)

productRoutes.post("/check-price-drops", adminAuth, checkPriceDrops)

export default productRoutes
