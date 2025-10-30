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
            <div className="w-full min-h-screen bg-slate-900 pt-24 flex items-center justify-center">
                <div className="text-white">Loading reviews...</div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-teal-900 text-white overflow-x-hidden relative">
            <Nav/>
            <Sidebar/>
            <div className="w-[82%] h-[100%] flex items-center justify-start overflow-x-hidden absolute right-0 bottom-[5%]">
                <div className="w-[100%] md:w-[90%] h-[100%] mt-[70px] flex flex-col gap-[30px] py-[90px] px-[30px] md:px-[60px]">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-white">Review Management</h1>
                    <div className="flex gap-4">
                        <select
                            value={filter}
                            onChange={(e) => {
                                setFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-white/10 text-white border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                        >
                            <option value="all">All Reviews</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm">Total Reviews</p>
                                <p className="text-white text-2xl font-bold">{reviews.length}</p>
                            </div>
                            <FaStar className="text-yellow-400 text-2xl" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm">Pending Reviews</p>
                                <p className="text-yellow-400 text-2xl font-bold">
                                    {reviews.filter(r => r.status === 'pending').length}
                                </p>
                            </div>
                            <FaEye className="text-yellow-400 text-2xl" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm">Approved Reviews</p>
                                <p className="text-green-400 text-2xl font-bold">
                                    {reviews.filter(r => r.status === 'approved').length}
                                </p>
                            </div>
                            <FaCheck className="text-green-400 text-2xl" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm">Reported Reviews</p>
                                <p className="text-red-400 text-2xl font-bold">
                                    {reviews.filter(r => r.reported).length}
                                </p>
                            </div>
                            <FaFlag className="text-red-400 text-2xl" />
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                            <div className="flex items-start gap-4">
                                {/* User Avatar */}
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold">
                                        {review.userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>

                                {/* Review Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-semibold text-white">{review.userName}</span>
                                        {review.verified && (
                                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                                Verified Purchase
                                            </span>
                                        )}
                                        {review.reported && (
                                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                                Reported
                                            </span>
                                        )}
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(review.status)}`}>
                                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        {renderStars(review.rating)}
                                        <span className="text-gray-300 text-sm ml-2">{review.title}</span>
                                    </div>

                                    <p className="text-gray-300 mb-4 leading-relaxed">{review.comment}</p>

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
                                    <div className="text-sm text-gray-400 mb-4">
                                        Product: <span className="text-blue-400">{review.productId?.name || 'Unknown Product'}</span>
                                    </div>

                                    {/* Admin Response */}
                                    {review.adminResponse && (
                                        <div className="bg-blue-900/50 border-l-4 border-blue-500 p-4 mt-4">
                                            <p className="text-blue-300 text-sm font-semibold mb-1">
                                                Admin Response ({new Date(review.adminResponse.respondedAt).toLocaleDateString()}):
                                            </p>
                                            <p className="text-gray-300 text-sm">{review.adminResponse.comment}</p>
                                        </div>
                                    )}

                                    {/* Review Actions */}
                                    <div className="flex items-center gap-3 mt-4">
                                        {review.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => updateReviewStatus(review._id, 'approved')}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors duration-300"
                                                >
                                                    <FaCheck className="inline mr-1" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => updateReviewStatus(review._id, 'rejected')}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors duration-300"
                                                >
                                                    <FaTimes className="inline mr-1" /> Reject
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => setSelectedReview(selectedReview === review._id ? null : review._id)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors duration-300"
                                        >
                                            <FaReply className="inline mr-1" /> Respond
                                        </button>

                                        <button
                                            onClick={() => deleteReview(review._id)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors duration-300"
                                        >
                                            <FaTrash className="inline mr-1" /> Delete
                                        </button>
                                    </div>

                                    {/* Admin Response Form */}
                                    {selectedReview === review._id && (
                                        <div className="mt-4 p-4 bg-white/10 rounded-lg">
                                            <h4 className="text-white font-semibold mb-2">Add Admin Response</h4>
                                            <textarea
                                                value={adminResponse}
                                                onChange={(e) => setAdminResponse(e.target.value)}
                                                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                                                placeholder="Enter your response to this review..."
                                                rows={3}
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => updateReviewStatus(review._id, review.status)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors duration-300"
                                                >
                                                    Save Response
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedReview(null);
                                                        setAdminResponse('');
                                                    }}
                                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors duration-300"
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
                            className="bg-white/10 hover:bg-white/20 disabled:bg-gray-600 text-white px-3 py-2 rounded transition-colors duration-300"
                        >
                            Previous
                        </button>

                        <span className="text-white">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="bg-white/10 hover:bg-white/20 disabled:bg-gray-600 text-white px-3 py-2 rounded transition-colors duration-300"
                        >
                            Next
                        </button>
                    </div>
                )}

                {reviews.length === 0 && (
                    <div className="text-center py-12">
                        <FaStar className="text-6xl text-gray-500 mx-auto mb-4" />
                        <p className="text-white text-xl mb-2">No reviews found</p>
                        <p className="text-gray-400">Reviews will appear here once users start reviewing products.</p>
                    </div>
                )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reviews;