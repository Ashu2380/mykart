import express from 'express';
import { subscribeNewsletter, unsubscribeNewsletter, getAllSubscribers } from '../controller/newsletterController.js';
import isAuth from '../middleware/isAuth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes - anyone can subscribe
router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

// Admin only - view subscribers
router.get('/subscribers', isAuth, adminAuth, getAllSubscribers);

export default router;
