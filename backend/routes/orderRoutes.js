import express from 'express'
import isAuth from '../middleware/isAuth.js'
import { allOrders, placeOrder, placeOrderRazorpay, updateStatus, userOrders, verifyRazorpay, updatePaymentStatus, generateInvoice } from '../controller/orderController.js'
import { createEthPayment, createAdaPayment, verifyEthPayment, verifyAdaPayment, checkCryptoPaymentStatus, getCryptoPrices } from '../controller/blockchainController.js'
import adminAuth from '../middleware/adminAuth.js'

const orderRoutes = express.Router()

//for User
orderRoutes.post("/placeorder",isAuth,placeOrder)
orderRoutes.post("/razorpay",isAuth,placeOrderRazorpay)
orderRoutes.post("/userorder",isAuth,userOrders)
orderRoutes.post("/verifyrazorpay",isAuth,verifyRazorpay)
orderRoutes.post("/invoice",isAuth,generateInvoice)
 
//for Admin
orderRoutes.post("/list",adminAuth,allOrders)
orderRoutes.post("/status",adminAuth,updateStatus)
orderRoutes.post("/payment-status",adminAuth,updatePaymentStatus)

// Blockchain Payment Routes
orderRoutes.post("/crypto/eth/create", isAuth, createEthPayment)
orderRoutes.post("/crypto/ada/create", isAuth, createAdaPayment)
orderRoutes.post("/crypto/eth/verify", isAuth, verifyEthPayment)
orderRoutes.post("/crypto/ada/verify", isAuth, verifyAdaPayment)
orderRoutes.post("/crypto/status", isAuth, checkCryptoPaymentStatus)
orderRoutes.get("/crypto/prices", getCryptoPrices)

export default orderRoutes