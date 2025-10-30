import Referral from '../model/referralModel.js';
import User from '../model/userModel.js';
import crypto from 'crypto';

// Generate unique referral code
const generateReferralCode = () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Create referral code for user
const createReferralCode = async (req, res) => {
    try {
        const userId = req.body.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.referralCode) {
            return res.json({ success: true, referralCode: user.referralCode });
        }

        let referralCode;
        let isUnique = false;

        // Ensure unique referral code
        while (!isUnique) {
            referralCode = generateReferralCode();
            const existingUser = await User.findOne({ referralCode });
            const existingReferral = await Referral.findOne({ referralCode });
            if (!existingUser && !existingReferral) {
                isUnique = true;
            }
        }

        user.referralCode = referralCode;
        await user.save();

        res.json({ success: true, referralCode });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error creating referral code" });
    }
};

// Get referral stats for user
const getReferralStats = async (req, res) => {
    try {
        const userId = req.body.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Get all referrals made by this user
        const referrals = await Referral.find({ referrerId: userId })
            .populate('referredUserId', 'name email')
            .sort({ createdAt: -1 });

        const stats = {
            referralCode: user.referralCode,
            totalReferrals: user.referralStats.totalReferrals,
            successfulReferrals: user.referralStats.successfulReferrals,
            totalEarned: user.referralStats.totalEarned,
            pendingRewards: user.referralStats.pendingRewards,
            referrals: referrals.map(ref => ({
                id: ref._id,
                referredUser: ref.referredUserId ? {
                    name: ref.referredUserId.name,
                    email: ref.referredUserId.email
                } : null,
                status: ref.status,
                rewardAmount: ref.rewardAmount,
                createdAt: ref.createdAt,
                completedAt: ref.completedAt
            }))
        };

        res.json({ success: true, stats });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching referral stats" });
    }
};

// Validate and use referral code during registration
const validateReferralCode = async (req, res) => {
    try {
        const { referralCode } = req.body;

        if (!referralCode) {
            return res.json({ success: true, valid: false, message: "No referral code provided" });
        }

        const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
        if (!referrer) {
            return res.json({ success: true, valid: false, message: "Invalid referral code" });
        }

        res.json({
            success: true,
            valid: true,
            referrer: {
                id: referrer._id,
                name: referrer.name
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error validating referral code" });
    }
};

// Process referral when new user completes first purchase
const processReferralReward = async (userId, orderAmount) => {
    try {
        const user = await User.findById(userId);
        if (!user || !user.referredBy) {
            return;
        }

        // Find the referral record
        const referral = await Referral.findOne({
            referrerId: user.referredBy,
            referredUserId: userId,
            status: 'pending'
        });

        if (!referral) {
            return;
        }

        // Calculate rewards (example: 10% of order amount for referrer, ₹50 for new user)
        const referrerReward = Math.floor(orderAmount * 0.1);
        const referredReward = 50;

        // Update referral record
        referral.status = 'completed';
        referral.rewardAmount = referrerReward + referredReward;
        referral.referrerReward = referrerReward;
        referral.referredReward = referredReward;
        referral.completedAt = new Date();
        await referral.save();

        // Update referrer stats
        const referrer = await User.findById(user.referredBy);
        if (referrer) {
            referrer.referralStats.successfulReferrals += 1;
            referrer.referralStats.totalEarned += referrerReward;
            referrer.referralStats.pendingRewards += referrerReward;

            referrer.referralRewards.push({
                referralId: referral._id,
                amount: referrerReward,
                type: 'referral_earning',
                description: `Referral reward for ${user.name}'s first purchase`
            });

            await referrer.save();
        }

        // Update referred user rewards
        user.referralRewards.push({
            referralId: referral._id,
            amount: referredReward,
            type: 'signup_bonus',
            description: 'Welcome bonus for using referral code'
        });

        await user.save();

        console.log(`Referral processed: ${referrer.name} earned ₹${referrerReward}, ${user.name} got ₹${referredReward}`);

    } catch (error) {
        console.log('Error processing referral reward:', error);
    }
};

// Get referral rewards for user
const getReferralRewards = async (req, res) => {
    try {
        const userId = req.body.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const rewards = user.referralRewards.map(reward => ({
            id: reward._id,
            amount: reward.amount,
            type: reward.type,
            status: reward.status,
            description: reward.description,
            creditedAt: reward.creditedAt
        }));

        res.json({ success: true, rewards });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching referral rewards" });
    }
};

// Admin: Get all referrals
const getAllReferrals = async (req, res) => {
    try {
        const referrals = await Referral.find({})
            .populate('referrerId', 'name email')
            .populate('referredUserId', 'name email')
            .sort({ createdAt: -1 });

        const stats = {
            totalReferrals: referrals.length,
            completedReferrals: referrals.filter(r => r.status === 'completed').length,
            pendingReferrals: referrals.filter(r => r.status === 'pending').length,
            totalRewards: referrals.reduce((sum, r) => sum + r.rewardAmount, 0)
        };

        res.json({ success: true, referrals, stats });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching referrals" });
    }
};

export {
    createReferralCode,
    getReferralStats,
    validateReferralCode,
    processReferralReward,
    getReferralRewards,
    getAllReferrals
};