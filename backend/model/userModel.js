import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:false
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

    // ================= ADDRESS =================
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

    // ================= AI FEATURES =================
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
            type: Number,
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
            min: { type: Number, default: 0 },
            max: { type: Number, default: 10000 }
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
        enablePersonalizedRecommendations: { type: Boolean, default: true },
        enableVoiceFeatures: { type: Boolean, default: true },
        enableNotifications: { type: Boolean, default: true },
        dataCollectionConsent: { type: Boolean, default: false }
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
            enabled: { type: Boolean, default: true },
            targetPrice: { type: Number, default: null },
            lastNotifiedPrice: { type: Number, default: null }
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
    }],

    // ================= REFERRAL =================
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    referralStats: {
        totalReferrals: { type: Number, default: 0 },
        successfulReferrals: { type: Number, default: 0 },
        totalEarned: { type: Number, default: 0 },
        pendingRewards: { type: Number, default: 0 }
    },

    referralRewards: [{
        referralId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Referral'
        },
        amount: { type: Number, required: true },
        type: {
            type: String,
            enum: ['signup_bonus', 'purchase_bonus', 'referral_earning'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'credited', 'expired'],
            default: 'pending'
        },
        creditedAt: Date,
        description: { type: String, required: true }
    }],

    // ================= LOGIN TRACKING =================
    lastLogin: {
        type: Date
    },
    loginCount: {
        type: Number,
        default: 0
    },

    // ================= OTP SYSTEM =================
    otp: {
        type: String
    },
    otpExpiry: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },

    // ================= PAYMENT METHODS =================
    paymentMethods: [{
        type: {
            type: String,
            enum: ['card', 'upi', 'netbanking', 'wallet'],
            required: true
        },
        nickname: {
            type: String,
            default: ''
        },
        // Card specific
        cardNumber: {
            type: String,
            default: ''
        },
        cardHolderName: {
            type: String,
            default: ''
        },
        expiryMonth: {
            type: String,
            default: ''
        },
        expiryYear: {
            type: String,
            default: ''
        },
        // UPI specific
        upiId: {
            type: String,
            default: ''
        },
        // Netbanking specific
        bankName: {
            type: String,
            default: ''
        },
        accountNumber: {
            type: String,
            default: ''
        },
        ifscCode: {
            type: String,
            default: ''
        },
        // Wallet specific
        walletType: {
            type: String,
            enum: ['paytm', 'phonepe', 'googlepay', 'amazonpay', 'other', 'ethereum', 'cardano', 'bitcoin'],
            default: 'paytm'
        },
        walletNumber: {
            type: String,
            default: ''
        },
        isDefault: {
            type: Boolean,
            default: false
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]

},{ timestamps:true , minimize:false });

const User = mongoose.model("User", userSchema);

export default User;