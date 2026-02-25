import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000
    },
    images: [{
        type: String, // URLs to review images
        trim: true
    }],
    verified: {
        type: Boolean,
        default: false // True if user has purchased the product
    },
    helpful: {
        type: Number,
        default: 0
    },
    reported: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved' // Auto-approve for now
    },
    adminResponse: {
        comment: String,
        respondedAt: Date,
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
}, { timestamps: true });

// Compound index for efficient queries
reviewSchema.index({ productId: 1, status: 1 });
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true }); // One review per user per product

// Virtual for formatted date
reviewSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Method to check if user can review
reviewSchema.statics.canUserReview = async function(userId, productId) {
    // Check if user has purchased the product
    const Order = mongoose.model('Order');
    const hasPurchased = await Order.findOne({
        userId: userId,
        'items._id': productId,
        payment: true
    });

    return !!hasPurchased;
};

const Review = mongoose.model("Review", reviewSchema);

export default Review;