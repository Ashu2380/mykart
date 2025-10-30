import express from 'express';
import {
    createReferralCode,
    getReferralStats,
    validateReferralCode,
    getReferralRewards,
    getAllReferrals
} from '../controller/referralController.js';
import isAuth from '../middleware/isAuth.js';
import adminAuth from '../middleware/adminAuth.js';

const referralRouter = express.Router();

// User routes
referralRouter.post('/create-code', isAuth, createReferralCode);
referralRouter.post('/stats', isAuth, getReferralStats);
referralRouter.post('/validate-code', validateReferralCode);
referralRouter.post('/rewards', isAuth, getReferralRewards);

// Admin routes
referralRouter.get('/all', adminAuth, getAllReferrals);

export default referralRouter;