import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
    userId: {
        type:String,
        required: true
    },
    items: {
          type:Array,
        required: true
    },
    amount: {
        type:Number,
        required: true
    },
    address: {
        type:Object,
        required: true
    },
    status: {
        type:String,
        required: true,
        default:'Order Placed'
    },
    paymentMethod: {
        type:String,
        required: true
    },
    payment: {
        type:Boolean,
        required: true,
        default:false
    },
    splitPayment: {
        type: Object,
        default: null
    },
    deliverySlot: {
        date: String,
        time: String,
        ecoMode: {
            type: Boolean,
            default: false
        }
    },
    date: {
        type: Number,
        required:true
    },
    cryptoTxHash: {
        type: String,
        default: null
    },
    cryptoNetwork: {
        type: String,
        enum: ['ethereum', 'cardano'],
        default: null
    }
},{timestamps:true}) 

const Order = mongoose.model('Order' , orderSchema)

export default Order