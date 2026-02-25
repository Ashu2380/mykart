import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
    referrerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referredUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referralCode: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'expired'],
        default: 'pending'
    },
    rewardAmount: {
        type: Number,
        default: 0
    },
    referrerReward: {
        type: Number,
        default: 0
    },
    referredReward: {
        type: Number,
        default: 0
    },
    completedAt: {
        type: Date
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
}, { timestamps: true });

// Index for efficient queries
referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ expiresAt: 1 });

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;