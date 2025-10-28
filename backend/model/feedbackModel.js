import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['product_recommendation', 'search_result', 'visual_search', 'chatbot_response', 'product_comparison', 'general'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'targetModel'
    },
    targetModel: {
        type: String,
        enum: ['Product', 'User'],
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    feedback: {
        type: String,
        maxlength: 500
    },
    categories: [{
        type: String,
        enum: ['accuracy', 'relevance', 'usefulness', 'diversity', 'presentation', 'speed', 'ease_of_use']
    }],
    metadata: {
        sessionId: String,
        source: {
            type: String,
            enum: ['recommendation', 'search', 'visual_search', 'chatbot', 'comparison', 'direct']
        },
        context: {
            searchQuery: String,
            category: String,
            priceRange: {
                min: Number,
                max: Number
            }
        },
        userAgent: String,
        deviceType: {
            type: String,
            enum: ['desktop', 'mobile', 'tablet']
        }
    },
    isProcessed: {
        type: Boolean,
        default: false
    },
    processedAt: Date,
    improvementSuggestions: [{
        type: String
    }]
}, { timestamps: true });

// Indexes
feedbackSchema.index({ userId: 1, type: 1, createdAt: -1 });
feedbackSchema.index({ type: 1, rating: 1 });
feedbackSchema.index({ targetId: 1, targetModel: 1 });
feedbackSchema.index({ isProcessed: 1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
