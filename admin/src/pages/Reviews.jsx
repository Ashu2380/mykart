import React, { useState, useEffect, useContext } from 'react';
import { FaStar, FaEye, FaCheck, FaTimes, FaTrash, FaReply, FaFlag } from 'react-icons/fa';
import { authDataContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Nav from '../component/Nav';
import Sidebar from '../component/Sidebar';

function Reviews() {
    const { serverUrl } = useContext(authDataContext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState(null);
    const [adminResponse, setAdminResponse] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadReviews();
    }, [filter, currentPage]);

    // Add loading state management to prevent reload flicker
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        if (isInitialLoad) {
            setIsInitialLoad(false);
        }
    }, []);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${serverUrl}/api/review/all`, {
                params: { status: filter, page: currentPage, limit: 20 },
                withCredentials: true
            });

            if (response.data.success) {
                setReviews(response.data.reviews);
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const updateReviewStatus = async (reviewId, status) => {
        try {
            const response = await axios.post(`${serverUrl}/api/review/status`, {
                reviewId,
                status,
                adminResponse: adminResponse || undefined
            }, { withCredentials: true });

            if (response.data.success) {
                toast.success(`Review ${status} successfully`);
                setSelectedReview(null);
                setAdminResponse('');
                loadReviews();
            }
        } catch (error) {
            console.error('Error updating review status:', error);
            toast.error('Failed to update review status');
        }
    };

    const deleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            const response = await axios.post(`${serverUrl}/api/review/delete`, {
                reviewId
            }, { withCredentials: true });

            if (response.data.success) {
                toast.success('Review deleted successfully');
                loadReviews();
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        className={`text-sm ${
                            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-400 bg-green-900/20';
            case 'pending': return 'text-yellow-400 bg-yellow-900/20';
            case 'rejected': return 'text-red-400 bg-red-900/20';
            default: return 'text-gray-400 bg-gray-900/20';
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-800 font-medium">Loading reviews...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-black overflow-x-hidden relative">
            <Nav/>
            <Sidebar/>
            <div className="w-[82%] h-[100%] flex items-center justify-start overflow-x-hidden absolute right-0 bottom-[5%]">
                <div className="w-full md:w-[90%] h-full mt-0 md:mt-[70px] flex flex-col gap-[20px] md:gap-[30px] py-[20px] md:py-[90px] px-[15px] md:px-[60px] animate-fade-in">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6 animate-slide-up">
                    <h1 className="text-3xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-300">Review Management</h1>
                    <div className="flex gap-4">
                        <select
                            value={filter}
                            onChange={(e) => {
                                setFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-white text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 hover:shadow-lg hover:border-blue-400"
                        >
                            <option value="all">All Reviews</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up-delayed">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-white group cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">Total Reviews</p>
                                <p className="text-gray-800 text-2xl font-bold group-hover:text-blue-600 transition-colors duration-300">{reviews.length}</p>
                            </div>
                            <FaStar className="text-yellow-500 text-2xl group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-white group cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">Pending Reviews</p>
                                <p className="text-yellow-600 text-2xl font-bold group-hover:text-yellow-700 transition-colors duration-300">
                                    {reviews.filter(r => r.status === 'pending').length}
                                </p>
                            </div>
                            <FaEye className="text-yellow-500 text-2xl group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-white group cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">Approved Reviews</p>
                                <p className="text-green-600 text-2xl font-bold group-hover:text-green-700 transition-colors duration-300">
                                    {reviews.filter(r => r.status === 'approved').length}
                                </p>
                            </div>
                            <FaCheck className="text-green-500 text-2xl group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-white group cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">Reported Reviews</p>
                                <p className="text-red-600 text-2xl font-bold group-hover:text-red-700 transition-colors duration-300">
                                    {reviews.filter(r => r.reported).length}
                                </p>
                            </div>
                            <FaFlag className="text-red-500 text-2xl group-hover:scale-110 transition-transform duration-300" />
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6 animate-fade-in-up">
                    {reviews.map((review, index) => (
                        <div key={review._id} className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-white group cursor-pointer" style={{animationDelay: `${index * 0.1}s`}}>
                            <div className="flex items-start gap-4">
                                {/* User Avatar */}
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-white font-bold">
                                        {review.userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>

                                {/* Review Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{review.userName}</span>
                                        {review.verified && (
                                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full group-hover:scale-105 transition-transform duration-300">
                                                Verified Purchase
                                            </span>
                                        )}
                                        {review.reported && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full group-hover:scale-105 transition-transform duration-300">
                                                Reported
                                            </span>
                                        )}
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(review.status)} group-hover:scale-105 transition-transform duration-300`}>
                                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        {renderStars(review.rating)}
                                        <span className="text-gray-600 text-sm ml-2 group-hover:text-gray-700 transition-colors duration-300">{review.title}</span>
                                    </div>

                                    <p className="text-gray-700 mb-4 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">{review.comment}</p>

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

                                    {/* Product Info */}
                                    <div className="text-sm text-gray-600 mb-4">
                                        Product: <span className="text-blue-600 font-medium">{review.productId?.name || 'Unknown Product'}</span>
                                    </div>

                                    {/* Admin Response */}
                                    {review.adminResponse && (
                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4 rounded-r-lg">
                                            <p className="text-blue-700 text-sm font-semibold mb-1">
                                                Admin Response ({new Date(review.adminResponse.respondedAt).toLocaleDateString()}):
                                            </p>
                                            <p className="text-gray-700 text-sm">{review.adminResponse.comment}</p>
                                        </div>
                                    )}

                                    {/* Review Actions */}
                                    <div className="flex items-center gap-3 mt-4">
                                        {review.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => updateReviewStatus(review._id, 'approved')}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                                                >
                                                    <FaCheck className="inline mr-1" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => updateReviewStatus(review._id, 'rejected')}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                                                >
                                                    <FaTimes className="inline mr-1" /> Reject
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => setSelectedReview(selectedReview === review._id ? null : review._id)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                                        >
                                            <FaReply className="inline mr-1" /> Respond
                                        </button>

                                        <button
                                            onClick={() => deleteReview(review._id)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                                        >
                                            <FaTrash className="inline mr-1" /> Delete
                                        </button>
                                    </div>

                                    {/* Admin Response Form */}
                                    {selectedReview === review._id && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <h4 className="text-gray-800 font-semibold mb-2">Add Admin Response</h4>
                                            <textarea
                                                value={adminResponse}
                                                onChange={(e) => setAdminResponse(e.target.value)}
                                                className="w-full p-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none transition-all duration-200"
                                                placeholder="Enter your response to this review..."
                                                rows={3}
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => updateReviewStatus(review._id, review.status)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                                >
                                                    Save Response
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedReview(null);
                                                        setAdminResponse('');
                                                    }}
                                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-800 disabled:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none transition-all duration-300"
                        >
                            Previous
                        </button>

                        <span className="text-gray-800 font-medium px-4 py-2">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-800 disabled:text-gray-400 px-4 py-2 rounded-lg border border-gray-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none transition-all duration-300"
                        >
                            Next
                        </button>
                    </div>
                )}

                {reviews.length === 0 && (
                    <div className="text-center py-12 animate-fade-in">
                        <FaStar className="text-6xl text-gray-400 mx-auto mb-4 animate-pulse" />
                        <p className="text-gray-800 text-xl mb-2 font-semibold">No reviews found</p>
                        <p className="text-gray-500">Reviews will appear here once users start reviewing products.</p>
                    </div>
                )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reviews;