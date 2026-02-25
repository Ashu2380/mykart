import Order from "../model/orderModel.js";
import User from "../model/userModel.js";
import Notification from "../model/notificationModel.js";
import { processReferralReward } from "./referralController.js";
import razorpay from 'razorpay'
import dotenv from 'dotenv'
dotenv.config()
const currency = 'inr'
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// for User
export const placeOrder = async (req,res) => {

     try {
         const {items , amount , address, splitPayment, deliverySlot} = req.body;
         const userId = req.userId;

         // Validate split payment if provided
         if (splitPayment && splitPayment.payer1 && splitPayment.payer2) {
             const totalSplit = splitPayment.payer1.amount + splitPayment.payer2.amount;
             if (Math.abs(totalSplit - amount) > 1) { // Allow small rounding differences
                 return res.status(400).json({message:'Split payment amounts do not match total order amount'});
             }
         }

         const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod:'COD',
            payment:false,
            date: Date.now(),
            splitPayment: splitPayment || null,
            deliverySlot: deliverySlot || null
         }

         const newOrder = new Order(orderData)
         await newOrder.save()

         await User.findByIdAndUpdate(userId,{cartData:{}})

         // Process referral rewards for first purchase
         try {
             await processReferralReward(userId, amount);
         } catch (referralError) {
             console.log('Referral processing error:', referralError);
             // Don't fail order if referral processing fails
         }

         // Create order confirmation notification
         try {
             const notification = new Notification({
                 userId: userId,
                 type: 'order_update',
                 title: 'Order Placed Successfully! 🎉',
                 message: `Your order #${newOrder._id.toString().slice(-8)} has been placed successfully. Track your order for updates.`,
                 orderId: newOrder._id,
                 metadata: {
                     orderId: newOrder._id,
                     orderStatus: 'placed',
                     amount: amount,
                     itemsCount: items.length
                 }
             });
             await notification.save();
         } catch (notificationError) {
             console.log("Order notification error:", notificationError);
             // Don't fail the order if notification fails
         }

         return res.status(201).json({message:'Order Placed Successfully'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:'Order Place error'})
    }

}


export const placeOrderRazorpay = async (req,res) => {
    try {

         const {items , amount , address} = req.body;
         const userId = req.userId;
         const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod:'Razorpay',
            payment:false,
            date: Date.now()
         }

         const newOrder = new Order(orderData)
         await newOrder.save()

         const options = {
            amount:amount * 100,
            currency: currency.toUpperCase(),
            receipt : newOrder._id.toString()
         }
         await razorpayInstance.orders.create(options, (error,order)=>{
            if(error) {
                console.log(error)
                return res.status(500).json(error)
            }
            res.status(200).json(order)
         })
    } catch (error) {
        console.log(error)
        res.status(500).json({message:error.message
            })
    }
}


export const verifyRazorpay = async (req,res) =>{
    try {
        const userId = req.userId
        const {razorpay_order_id} = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        if(orderInfo.status === 'paid'){
            await Order.findByIdAndUpdate(orderInfo.receipt,{payment:true});
            await User.findByIdAndUpdate(userId , {cartData:{}})

            // Process referral rewards for first purchase
            try {
                const order = await Order.findById(orderInfo.receipt);
                if (order) {
                    await processReferralReward(userId, order.amount);
                }
            } catch (referralError) {
                console.log('Referral processing error:', referralError);
                // Don't fail payment if referral processing fails
            }

            res.status(200).json({message:'Payment Successful'
            })
        }
        else{
            res.json({message:'Payment Failed'
            })
        }
    } catch (error) {
        console.log(error)
         res.status(500).json({message:error.message
            })
    }
}






export const userOrders = async (req,res) => {
      try {
        const userId = req.userId;
        const orders = await Order.find({userId})
        return res.status(200).json(orders)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"userOrders error"})
    }
    
}




//for Admin



    
export const allOrders = async (req,res) => {
    try {
        const orders = await Order.find({})
        res.status(200).json(orders)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"adminAllOrders error"})
        
    }
    
}
    
export const updateStatus = async (req,res) => {

 try {
     const {orderId , status} = req.body

     const updatedOrder = await Order.findByIdAndUpdate(orderId , { status }, { new: true }).populate('userId', 'name email')

     // Create status update notification for user
     if (updatedOrder && updatedOrder.userId) {
         try {
             const statusMessages = {
                 'Shipped': 'Your order has been shipped and is on its way! 🚚',
                 'Out for Delivery': 'Your order is out for delivery. Please be available to receive it. 📦',
                 'Delivered': 'Your order has been delivered successfully! Thank you for shopping with us. ✅',
                 'Cancelled': 'Your order has been cancelled. If you have any questions, please contact support.',
                 'Processing': 'Your order is being processed and will be shipped soon.',
                 'Confirmed': 'Your order has been confirmed and is being prepared for shipment.'
             };

             const notification = new Notification({
                 userId: updatedOrder.userId._id || updatedOrder.userId,
                 type: 'order_update',
                 title: `Order ${status}!`,
                 message: statusMessages[status] || `Your order status has been updated to: ${status}`,
                 orderId: updatedOrder._id,
                 metadata: {
                     orderId: updatedOrder._id,
                     orderStatus: status,
                     previousStatus: updatedOrder.status,
                     updateTime: new Date()
                 }
             });
             await notification.save();
         } catch (notificationError) {
             console.log("Status update notification error:", notificationError);
             // Don't fail the status update if notification fails
         }
     }

     return res.status(201).json({message:'Status Updated'})
 } catch (error) {
      return res.status(500).json({message:error.message
             })
 }
}

export const updatePaymentStatus = async (req,res) => {
    try {
        const {orderId, payment} = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(orderId, { payment }, { new: true }).populate('userId', 'name email');

        // Create payment status update notification for user
        if (updatedOrder && updatedOrder.userId) {
            try {
                const paymentMessage = payment ? 'Your payment has been confirmed! 🎉' : 'Payment status updated.';

                const notification = new Notification({
                    userId: updatedOrder.userId._id || updatedOrder.userId,
                    type: 'payment_update',
                    title: 'Payment Status Updated',
                    message: paymentMessage,
                    orderId: updatedOrder._id,
                    metadata: {
                        orderId: updatedOrder._id,
                        paymentStatus: payment,
                        updateTime: new Date()
                    }
                });
                await notification.save();
            } catch (notificationError) {
                console.log("Payment status update notification error:", notificationError);
                // Don't fail the payment update if notification fails
            }
        }

        return res.status(201).json({message:'Payment Status Updated'});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}
