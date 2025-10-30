import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image1:{
        type:String,
        required:true
    },
    image2:{
        type:String
    },
    image3:{
        type:String
    },
    image4:{
        type:String
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    subCategory:{
        type:String,
        required:true
    },
    sizes:{
        type:Array,
        required:true
    },
    date:{
        type:Number,
        required:true
    },
    bestseller:{
        type:Boolean
    },
    discount:{
        type:Number,
        default:0,
        min:0,
        max:100
    },
    isManual:{
        type:Boolean,
        default:true
    },
    // Review and rating system
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    ratingDistribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 }
    }

},{timestamps:true})

const Product = mongoose.model("Product" , productSchema)

export default Product