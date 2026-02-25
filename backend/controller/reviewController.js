import Review from '../model/reviewModel.js';
import Product from '../model/productModel.js';
import User from '../model/userModel.js';
import Order from '../model/orderModel.js';

// Add a new review
const addReview = async (req, res) => {
    try {
        const { productId, rating, title, comment, images } = req.body;
        const userId = req.userId;

        // Check if user has purchased the product
        const hasPurchased = await Order.findOne({
            userId: userId,
            'items._id': productId,
            payment: true
        });

        if (!hasPurchased) {
            return res.json({ success: false, message: "You can only review products you've purchased" });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ userId, productId });
        if (existingReview) {
            return res.json({ success: false, message: "You have already reviewed this product" });
        }

        // Get user details
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Create review
        const review = new Review({
            productId,
            userId,
            userName: user.name,
            rating: parseInt(rating),
            title,
            comment,
            images: images || [],
            verified: true
        });

        await review.save();

        // Update product rating statistics
        await updateProductRating(productId);

        res.json({ success: true, message: "Review added successfully", review });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding review" });
    }
};

// Get reviews for a product
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.body;
        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const sortBy = req.body.sortBy || 'newest'; // newest, oldest, highest, lowest, helpful

        let sortOption = { createdAt: -1 }; // default: newest first

        switch (sortBy) {
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            case 'highest':
                sortOption = { rating: -1, createdAt: -1 };
                break;
            case 'lowest':
                sortOption = { rating: 1, createdAt: -1 };
                break;
            case 'helpful':
                sortOption = { helpful: -1, createdAt: -1 };
                break;
        }

        const reviews = await Review.find({ productId, status: 'approved' })
            .sort(sortOption)
            .limit(limit)
            .skip((page - 1) * limit)
            .populate('userId', 'name')
            .select('-__v');

        const totalReviews = await Review.countDocuments({ productId, status: 'approved' });

        // Get rating distribution
        const ratingStats = await Review.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'approved' } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            }
        ]);

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingStats.forEach(stat => {
            distribution[stat._id] = stat.count;
        });

        res.json({
            success: true,
            reviews,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalReviews / limit),
                totalReviews,
                hasNext: page * limit < totalReviews,
                hasPrev: page > 1
            },
            ratingDistribution: distribution
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching reviews" });
    }
};

// Update product rating statistics
const updateProductRating = async (productId) => {
    try {
        const reviews = await Review.find({ productId, status: 'approved' });

        if (reviews.length === 0) {
            await Product.findByIdAndUpdate(productId, {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            });
            return;
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
            distribution[review.rating]++;
        });

        await Product.findByIdAndUpdate(productId, {
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            totalReviews: reviews.length,
            ratingDistribution: distribution
        });

    } catch (error) {
        console.log('Error updating product rating:', error);
    }
};

// Mark review as helpful
const markHelpful = async (req, res) => {
    try {
        const { reviewId } = req.body;
        const userId = req.userId;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        // Check if user already marked this review as helpful
        // For simplicity, we'll allow multiple helpful marks (can be improved with a separate collection)

        review.helpful += 1;
        await review.save();

        res.json({ success: true, message: "Review marked as helpful" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error marking review as helpful" });
    }
};

// Report a review
const reportReview = async (req, res) => {
    try {
        const { reviewId, reason } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        review.reported = true;
        await review.save();

        res.json({ success: true, message: "Review reported successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error reporting review" });
    }
};

// Get user's reviews
const getUserReviews = async (req, res) => {
    try {
        const userId = req.userId;

        const reviews = await Review.find({ userId })
            .populate('productId', 'name image1')
            .sort({ createdAt: -1 });

        res.json({ success: true, reviews });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching user reviews" });
    }
};

// Admin: Get all reviews
const getAllReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status || 'all'; // all, pending, approved, rejected

        let filter = {};
        if (status !== 'all') {
            filter.status = status;
        }

        const reviews = await Review.find(filter)
            .populate('productId', 'name')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        const totalReviews = await Review.countDocuments(filter);

        // If this is a count request, return just the count
        if (req.route.path === '/count') {
            return res.json({
                success: true,
                total: totalReviews
            });
        }

        res.json({
            success: true,
            reviews,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalReviews / limit),
                totalReviews
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching reviews" });
    }
};

// Admin: Update review status
const updateReviewStatus = async (req, res) => {
    try {
        const { reviewId, status, adminResponse } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        review.status = status;

        if (adminResponse && adminResponse.comment) {
            review.adminResponse = {
                comment: adminResponse.comment,
                respondedAt: new Date(),
                respondedBy: req.userId
            };
        }

        await review.save();

        // Update product rating if status changed
        if (status === 'approved' || status === 'rejected') {
            await updateProductRating(review.productId);
        }

        res.json({ success: true, message: "Review status updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating review status" });
    }
};

// Admin: Delete review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        await Review.findByIdAndDelete(reviewId);

        // Update product rating
        await updateProductRating(review.productId);

        res.json({ success: true, message: "Review deleted successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting review" });
    }
};

export {
    addReview,
    getProductReviews,
    markHelpful,
    reportReview,
    getUserReviews,
    getAllReviews,
    updateReviewStatus,
    deleteReview,
    updateProductRating
};