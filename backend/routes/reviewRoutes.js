import express from 'express';
import {
    addReview,
    getProductReviews,
    markHelpful,
    reportReview,
    getUserReviews,
    getAllReviews,
    updateReviewStatus,
    deleteReview
} from '../controller/reviewController.js';
import isAuth from '../middleware/isAuth.js';
import adminAuth from '../middleware/adminAuth.js';

const reviewRouter = express.Router();

// User routes
reviewRouter.post('/add', isAuth, addReview);
reviewRouter.post('/product', getProductReviews);
reviewRouter.post('/helpful', isAuth, markHelpful);
reviewRouter.post('/report', isAuth, reportReview);
reviewRouter.post('/user', isAuth, getUserReviews);

// Admin routes
reviewRouter.get('/all', adminAuth, getAllReviews);
reviewRouter.post('/status', adminAuth, updateReviewStatus);
reviewRouter.post('/delete', adminAuth, deleteReview);

export default reviewRouter;