import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') })

import express from 'express'
import connectDb from './config/db.js'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes.js'
import cors from "cors"
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import referralRoutes from './routes/referralRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import couponRoutes from './routes/couponRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import newsletterRoutes from './routes/newsletterRoutes.js'
import returnRoutes from './routes/returnRoutes.js'

let port = process.env.PORT || 8000

let app = express()

// Environment check for production
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json())
app.use(cookieParser())

// CORS configuration - allow localhost and production domains
const corsOptions = {
  origin: isProduction 
    ? process.env.FRONTEND_URL || true  // Allow production URL or all in production
    : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180"],
  credentials: true
};
app.use(cors(corsOptions));

// Add headers to handle Cross-Origin-Opener-Policy for Firebase Auth popups
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.use("/api/auth",authRoutes)
app.use("/api/user",userRoutes)
app.use("/api/product",productRoutes)
app.use("/api/cart",cartRoutes)
app.use("/api/order",orderRoutes)
app.use("/api/wishlist",wishlistRoutes)
app.use("/api/referral",referralRoutes)
app.use("/api/review",reviewRoutes)
app.use("/api/coupon",couponRoutes)
app.use("/api/category",categoryRoutes)
app.use("/api/newsletter",newsletterRoutes)
app.use("/api/returns",returnRoutes)




app.listen(port,()=>{
    console.log("Hello From Server")
    connectDb()
})


