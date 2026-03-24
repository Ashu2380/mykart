import express from 'express';
import Newsletter from '../model/newsletterModel.js';

const router = express.Router();

// Subscribe to newsletter
const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid email address' 
            });
        }

        // Check if already subscribed
        const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });
        
        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'This email is already subscribed to our newsletter!' 
                });
            } else {
                // Reactivate subscription
                existingSubscriber.isActive = true;
                await existingSubscriber.save();
                return res.status(200).json({ 
                    success: true, 
                    message: 'Welcome back! You have been resubscribed to our newsletter.' 
                });
            }
        }

        // Create new subscription
        const newSubscriber = new Newsletter({ email: email.toLowerCase() });
        await newSubscriber.save();

        res.status(201).json({ 
            success: true, 
            message: 'Thank you for subscribing to our newsletter!' 
        });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Something went wrong. Please try again later.' 
        });
    }
};

// Unsubscribe from newsletter
const unsubscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
        
        if (!subscriber) {
            return res.status(404).json({ 
                success: false, 
                message: 'Email not found in our subscribers list' 
            });
        }

        subscriber.isActive = false;
        await subscriber.save();

        res.status(200).json({ 
            success: true, 
            message: 'You have been unsubscribed from our newsletter.' 
        });

    } catch (error) {
        console.error('Newsletter unsubscription error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Something went wrong. Please try again later.' 
        });
    }
};

// Get all subscribers (admin only)
const getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await Newsletter.find({ isActive: true })
            .sort({ subscribedAt: -1 });
        
        res.status(200).json({
            success: true,
            count: subscribers.length,
            subscribers
        });

    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Something went wrong.' 
        });
    }
};

export {
    subscribeNewsletter,
    unsubscribeNewsletter,
    getAllSubscribers
};
