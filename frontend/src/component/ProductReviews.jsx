import React, { useState, useEffect, useContext } from 'react';
import { FaStar, FaThumbsUp, FaFlag, FaUser, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { userDataContext } from '../context/UserContext';
import { authDataContext } from '../context/authContext';
import axios from 'axios';
import { toast } from 'react-toastify';

function ProductReviews({ productId }) {
    const { userData } = useContext(userDataContext);
    const { serverUrl } = useContext(authDataContext);

    const [reviews, setReviews] = useState([]);
    const [ratingDistribution, setRatingDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        title: '',
        comment: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadReviews();
    }, [productId, sortBy]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${serverUrl}/api/review/product`, {
                productId,
                sortBy,
                page: 1,
                limit: 10
            });

            if (response.data.success) {
                setReviews(response.data.reviews);
                setRatingDistribution(response.data.ratingDistribution);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!userData) {
            toast.error('Please login to submit a review');
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post(`${serverUrl}/api/review/add`, {
                productId,
                ...reviewForm
            }, { withCredentials: true });

            if (response.data.success) {
                toast.success('Review submitted successfully!');
                setReviewForm({ rating: 5, title: '', comment: '' });
                setShowReviewForm(false);
                loadReviews(); // Reload reviews
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleHelpful = async (reviewId) => {
        if (!userData) {
            toast.error('Please login to mark review as helpful');
            return;
        }

        try {
            const response = await axios.post(`${serverUrl}/api/review/helpful`, {
                reviewId
            }, { withCredentials: true });

            if (response.data.success) {
                // Update the review in the list
                setReviews(reviews.map(review =>
                    review._id === reviewId
                        ? { ...review, helpful: review.helpful + 1 }
                        : review
                ));
                toast.success('Marked as helpful!');
            }
        } catch (error) {
            console.error('Error marking helpful:', error);
            toast.error('Failed to mark as helpful');
        }
    };

    const handleReport = async (reviewId) => {
        if (!userData) {
            toast.error('Please login to report review');
            return;
        }

        try {
            const response = await axios.post(`${serverUrl}/api/review/report`, {
                reviewId,
                reason: 'Inappropriate content'
            }, { withCredentials: true });

            if (response.data.success) {
                toast.success('Review reported successfully');
            }
        } catch (error) {
            console.error('Error reporting review:', error);
            toast.error('Failed to report review');
        }
    };

    const renderStars = (rating, interactive = false, onRatingChange = null) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        className={`text-lg ${
                            star <= rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
                        onClick={interactive ? () => onRatingChange && onRatingChange(star) : undefined}
                    />
                ))}
            </div>
        );
    };

    const getAverageRating = () => {
        const total = Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0);
        if (total === 0) return 0;

        const weightedSum = Object.entries(ratingDistribution).reduce(
            (sum, [rating, count]) => sum + (parseInt(rating) * count), 0
        );
        return (weightedSum / total).toFixed(1);
    };

    const getRatingPercentage = (rating) => {
        const total = Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0);
        return total > 0 ? ((ratingDistribution[rating] / total) * 100).toFixed(1) : 0;
    };

    if (loading) {
        return (
            <div className="w-full py-8">
                <div className="text-center text-gray-800">Loading reviews...</div>
            </div>
        );
    }

    return (
        <div className="w-full bg-blue-50 text-gray-800 px-2 sm:px-4 md:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold">Customer Reviews</h2>
                {userData && (
                    <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                    >
                        Write a Review
                    </button>
                )}
            </div>

            {/* Rating Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-8">
                {/* Average Rating */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-yellow-400 mb-2">
                            {getAverageRating()}
                        </div>
                        {renderStars(Math.round(getAverageRating()))}
                        <p className="text-gray-600 mt-2">
                            Based on {Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0)} reviews
                        </p>
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Rating Breakdown</h3>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center gap-3">
                                <span className="w-8 text-sm">{rating}★</span>
                                <div className="flex-1 bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full"
                                        style={{ width: `${getRatingPercentage(rating)}%` }}
                                    ></div>
                                </div>
                                <span className="w-8 text-sm text-right">{ratingDistribution[rating]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Review Form */}
            {showReviewForm && userData && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Write Your Review</h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Rating</label>
                            {renderStars(reviewForm.rating, true, (rating) =>
                                setReviewForm(prev => ({ ...prev, rating }))
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Review Title</label>
                            <input
                                type="text"
                                value={reviewForm.title}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full p-3 rounded-lg bg-white/20 text-gray-800 placeholder-gray-500 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="Summarize your experience"
                                required
                                maxLength={100}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Your Review</label>
                            <textarea
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                className="w-full p-3 rounded-lg bg-white/20 text-gray-800 placeholder-gray-500 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                                placeholder="Share your experience with this product"
                                rows={4}
                                required
                                maxLength={1000}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors duration-300"
                            >
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowReviewForm(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                    Reviews ({Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0)})
                </h3>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white/20 text-gray-800 border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                    <option value="helpful">Most Helpful</option>
                </select>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review._id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6">
                            <div className="flex items-start gap-4">
                                {/* User Avatar */}
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <FaUser className="text-white text-lg" />
                                </div>

                                {/* Review Content */}
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                        <span className="font-semibold text-gray-800">{review.userName}</span>
                                        {review.verified && (
                                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                                Verified Purchase
                                            </span>
                                        )}
                                        <span className="text-gray-500 text-sm">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-3">
                                        {renderStars(review.rating)}
                                        <span className="text-gray-700 text-sm ml-2">{review.title}</span>
                                    </div>

                                    <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                                    {/* Review Images */}
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 mb-4">
                                            {review.images.map((image, index) => (
                                                <img
                                                    key={index}
                                                    src={image}
                                                    alt={`Review image ${index + 1}`}
                                                    className="w-20 h-20 object-cover rounded-lg border border-gray-600"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Admin Response */}
                                    {review.adminResponse && (
                                        <div className="bg-blue-900/50 border-l-4 border-blue-500 p-4 mt-4">
                                            <p className="text-blue-300 text-sm font-semibold mb-1">
                                                Response from Mykart Support
                                            </p>
                                            <p className="text-gray-700 text-sm">{review.adminResponse.comment}</p>
                                        </div>
                                    )}

                                    {/* Review Actions */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-4">
                                        <button
                                            onClick={() => handleHelpful(review._id)}
                                            className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors duration-300"
                                        >
                                            <FaThumbsUp />
                                            <span>Helpful ({review.helpful})</span>
                                        </button>

                                        <button
                                            onClick={() => handleReport(review._id)}
                                            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors duration-300"
                                        >
                                            <FaFlag />
                                            <span>Report</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <FaStar className="text-6xl text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-800 text-xl mb-2">No reviews yet</p>
                        <p className="text-gray-600">Be the first to review this product!</p>
                    </div>
                )}
            </div>

            {/* Load More Button */}
            {pagination.hasNext && (
                <div className="text-center mt-8">
                    <button
                        onClick={() => {
                            // Load next page - simplified for now
                            loadReviews();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300"
                    >
                        Load More Reviews
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProductReviews;