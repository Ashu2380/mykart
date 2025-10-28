import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['price_alert', 'restock', 'deal', 'recommendation', 'order_update', 'system'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    orderId: {
        type: String
    },
    metadata: {
        oldPrice: Number,
        newPrice: Number,
        discount: Number,
        dealType: String,
        orderStatus: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    scheduledFor: {
        type: Date
    },
    expiresAt: {
        type: Date
    },
    deliveryChannels: [{
        type: String,
        enum: ['in_app', 'email', 'push', 'sms'],
        default: ['in_app']
    }],
    deliveryStatus: {
        in_app: {
            sent: { type: Boolean, default: false },
            sentAt: Date
        },
        email: {
            sent: { type: Boolean, default: false },
            sentAt: Date
        },
        push: {
            sent: { type: Boolean, default: false },
            sentAt: Date
        },
        sms: {
            sent: { type: Boolean, default: false },
            sentAt: Date
        }
    }
}, { timestamps: true });

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
