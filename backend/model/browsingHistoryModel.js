import mongoose from "mongoose";

const browsingHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    action: {
        type: String,
        enum: ['view', 'click', 'add_to_cart', 'purchase', 'search', 'recommendation_click'],
        required: true
    },
    metadata: {
        searchQuery: String,
        category: String,
        source: {
            type: String,
            enum: ['direct', 'search', 'recommendation', 'category_page', 'visual_search', 'chatbot', 'voice_command'],
            default: 'direct'
        },
        timeSpent: {
            type: Number, // in seconds
            default: 0
        },
        scrollDepth: {
            type: Number, // percentage
            min: 0,
            max: 100
        },
        deviceType: {
            type: String,
            enum: ['desktop', 'mobile', 'tablet'],
            default: 'desktop'
        },
        userAgent: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Indexes for performance
browsingHistorySchema.index({ userId: 1, timestamp: -1 });
browsingHistorySchema.index({ sessionId: 1 });
browsingHistorySchema.index({ productId: 1 });
browsingHistorySchema.index({ 'metadata.source': 1 });

const BrowsingHistory = mongoose.model("BrowsingHistory", browsingHistorySchema);

export default BrowsingHistory;
