import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String
    },
    phone:{
        type:String
    },
    dateOfBirth:{
        type:Date
    },
    gender:{
        type:String
    },
    alternateEmail:{
        type:String
    },
    addresses:[{
        type:{
            type:String,
            enum:['home', 'office', 'other'],
            default:'home'
        },
        firstName:{
            type:String,
            required:true
        },
        lastName:{
            type:String,
            required:true
        },
        street:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        pinCode:{
            type:String,
            required:true
        },
        country:{
            type:String,
            default:'India'
        },
        phone:{
            type:String,
            required:true
        },
        landmark:{
            type:String
        },
        isDefault:{
            type:Boolean,
            default:false
        }
    }],
    cartData:{
        type:Object,
        default:{}
    },
    // AI Shopping Assistant enhancements
    browsingHistory: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        viewedAt: {
            type: Date,
            default: Date.now
        },
        timeSpent: {
            type: Number, // in seconds
            default: 0
        },
        source: {
            type: String,
            enum: ['search', 'recommendation', 'category', 'visual_search', 'chatbot'],
            default: 'category'
        }
    }],
    purchaseHistory: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        purchasedAt: {
            type: Date,
            default: Date.now
        },
        quantity: {
            type: Number,
            default: 1
        },
        price: {
            type: Number,
            required: true
        },
        orderId: {
            type: String
        }
    }],
    userPreferences: {
        favoriteCategories: [{
            category: String,
            weight: {
                type: Number,
                default: 1,
                min: 0,
                max: 5
            }
        }],
        priceRange: {
            min: {
                type: Number,
                default: 0
            },
            max: {
                type: Number,
                default: 10000
            }
        },
        preferredBrands: [String],
        dislikedProducts: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            reason: String
        }]
    },
    aiSettings: {
        enablePersonalizedRecommendations: {
            type: Boolean,
            default: true
        },
        enableVoiceFeatures: {
            type: Boolean,
            default: true
        },
        enableNotifications: {
            type: Boolean,
            default: true
        },
        dataCollectionConsent: {
            type: Boolean,
            default: false
        }
    },
    wishlist: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        },
        priceAlert: {
            enabled: {
                type: Boolean,
                default: true
            },
            targetPrice: {
                type: Number,
                default: null
            },
            lastNotifiedPrice: {
                type: Number,
                default: null
            }
        }
    }],
    notifications: [{
        type: {
            type: String,
            enum: ['price_alert', 'restock', 'deal', 'recommendation', 'order_update'],
            required: true
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        message: {
            type: String,
            required: true
        },
        isRead: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
},{timestamps:true , minimize:false})

const User = mongoose.model("User",userSchema)

export default User