import React, { useContext, useEffect, useState } from 'react';
import { FaCopy, FaShare, FaGift, FaUsers, FaRupeeSign, FaTrophy, FaClock } from 'react-icons/fa';
import { userDataContext } from '../context/UserContext';
import { authDataContext } from '../context/authContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Title from './Title';

function ReferralDashboard() {
    const { userData } = useContext(userDataContext);
    const { serverUrl } = useContext(authDataContext);
    const [referralStats, setReferralStats] = useState(null);
    const [referralRewards, setReferralRewards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReferralData();
    }, []);

    const loadReferralData = async () => {
        try {
            setLoading(true);

            // Get referral stats
            const statsResponse = await axios.post(`${serverUrl}/api/referral/stats`, {
                userId: userData._id
            }, { withCredentials: true });

            if (statsResponse.data.success) {
                setReferralStats(statsResponse.data.stats);
            }

            // Get referral rewards
            const rewardsResponse = await axios.post(`${serverUrl}/api/referral/rewards`, {
                userId: userData._id
            }, { withCredentials: true });

            if (rewardsResponse.data.success) {
                setReferralRewards(rewardsResponse.data.rewards);
            }

        } catch (error) {
            console.error('Error loading referral data:', error);
            toast.error('Failed to load referral data');
        } finally {
            setLoading(false);
        }
    };

    const createReferralCode = async () => {
        try {
            const response = await axios.post(`${serverUrl}/api/referral/create-code`, {
                userId: userData._id
            }, { withCredentials: true });

            if (response.data.success) {
                setReferralStats(prev => ({
                    ...prev,
                    referralCode: response.data.referralCode
                }));
                toast.success('Referral code created successfully!');
            }
        } catch (error) {
            console.error('Error creating referral code:', error);
            toast.error('Failed to create referral code');
        }
    };

    const copyReferralCode = () => {
        if (referralStats?.referralCode) {
            navigator.clipboard.writeText(referralStats.referralCode);
            toast.success('Referral code copied to clipboard!');
        }
    };

    const shareReferralLink = () => {
        if (referralStats?.referralCode) {
            const referralUrl = `${window.location.origin}/register?ref=${referralStats.referralCode}`;
            if (navigator.share) {
                navigator.share({
                    title: 'Join Mykart with my referral!',
                    text: 'Get ₹50 bonus on signup and help me earn rewards too!',
                    url: referralUrl
                });
            } else {
                navigator.clipboard.writeText(referralUrl);
                toast.success('Referral link copied to clipboard!');
            }
        }
    };

    const getRewardStatusColor = (status) => {
        switch (status) {
            case 'credited': return 'text-green-600';
            case 'pending': return 'text-yellow-600';
            case 'expired': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getRewardStatusText = (status) => {
        switch (status) {
            case 'credited': return 'Credited';
            case 'pending': return 'Pending';
            case 'expired': return 'Expired';
            default: return 'Unknown';
        }
    };

    if (loading) {
        return (
            <div className='w-full min-h-screen bg-blue-50 pt-24 flex items-center justify-center'>
                <div className='text-gray-800'>Loading referral dashboard...</div>
            </div>
        );
    }

    return (
        <div className='w-full min-h-screen bg-blue-50 pt-24 pb-20'>
            <div className='max-w-6xl mx-auto px-4 md:px-6 lg:px-8'>
                <Title text1={'REFERRAL'} text2={'PROGRAM'} />

                {/* Stats Cards */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                    <div className='bg-white rounded-lg p-6 border border-gray-200 shadow-sm'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-gray-600 text-sm'>Total Referrals</p>
                                <p className='text-2xl font-bold text-gray-800'>{referralStats?.totalReferrals || 0}</p>
                            </div>
                            <FaUsers className='text-3xl text-blue-600' />
                        </div>
                    </div>

                    <div className='bg-white rounded-lg p-6 border border-gray-200 shadow-sm'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-gray-600 text-sm'>Successful Referrals</p>
                                <p className='text-2xl font-bold text-gray-800'>{referralStats?.successfulReferrals || 0}</p>
                            </div>
                            <FaTrophy className='text-3xl text-green-600' />
                        </div>
                    </div>

                    <div className='bg-white rounded-lg p-6 border border-gray-200 shadow-sm'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-gray-600 text-sm'>Total Earned</p>
                                <p className='text-2xl font-bold text-gray-800'>₹{referralStats?.totalEarned || 0}</p>
                            </div>
                            <FaRupeeSign className='text-3xl text-purple-600' />
                        </div>
                    </div>

                    <div className='bg-white rounded-lg p-6 border border-gray-200 shadow-sm'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-gray-600 text-sm'>Pending Rewards</p>
                                <p className='text-2xl font-bold text-gray-800'>₹{referralStats?.pendingRewards || 0}</p>
                            </div>
                            <FaClock className='text-3xl text-orange-600' />
                        </div>
                    </div>
                </div>

                {/* Referral Code Section */}
                <div className='bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-200 shadow-sm'>
                    <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Your Referral Code</h2>

                    {!referralStats?.referralCode ? (
                        <div className='text-center'>
                            <p className='text-gray-600 mb-4'>Create your referral code to start earning rewards!</p>
                            <button
                                onClick={createReferralCode}
                                className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300'
                            >
                                Create Referral Code
                            </button>
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-gray-600 text-sm'>Your Code</p>
                                        <p className='text-gray-800 text-xl font-mono font-bold'>{referralStats.referralCode}</p>
                                    </div>
                                    <div className='flex gap-2'>
                                        <button
                                            onClick={copyReferralCode}
                                            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300'
                                        >
                                            <FaCopy /> Copy
                                        </button>
                                        <button
                                            onClick={shareReferralLink}
                                            className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300'
                                        >
                                            <FaShare /> Share
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className='text-center'>
                                <p className='text-gray-600 mb-2'>Share this link with friends:</p>
                                <p className='text-blue-600 break-all bg-gray-50 p-2 rounded border border-gray-200'>
                                    {`${window.location.origin}/register?ref=${referralStats.referralCode}`}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* How it Works */}
                <div className='bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-200 shadow-sm'>
                    <h2 className='text-2xl font-semibold text-gray-800 mb-4'>How It Works</h2>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div className='text-center'>
                            <div className='bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3'>
                                <span className='text-white font-bold text-lg'>1</span>
                            </div>
                            <h3 className='text-gray-800 font-semibold mb-2'>Share Your Code</h3>
                            <p className='text-gray-600 text-sm'>Share your referral code with friends and family</p>
                        </div>
                        <div className='text-center'>
                            <div className='bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3'>
                                <span className='text-white font-bold text-lg'>2</span>
                            </div>
                            <h3 className='text-gray-800 font-semibold mb-2'>They Sign Up</h3>
                            <p className='text-gray-600 text-sm'>Friends sign up using your code and get ₹50 bonus</p>
                        </div>
                        <div className='text-center'>
                            <div className='bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3'>
                                <span className='text-white font-bold text-lg'>3</span>
                            </div>
                            <h3 className='text-gray-800 font-semibold mb-2'>You Earn</h3>
                            <p className='text-gray-600 text-sm'>Earn 10% of their first order amount</p>
                        </div>
                    </div>
                </div>

                {/* Referral History */}
                <div className='bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-200 shadow-sm'>
                    <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Your Referrals</h2>

                    {referralStats?.referrals?.length > 0 ? (
                        <div className='space-y-4'>
                            {referralStats.referrals.map((referral, index) => (
                                <div key={index} className='bg-white/10 rounded-lg p-4'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <p className='text-gray-800 font-semibold'>
                                                {referral.referredUser ? referral.referredUser.name : 'Unknown User'}
                                            </p>
                                            <p className='text-gray-600 text-sm'>
                                                {referral.referredUser ? referral.referredUser.email : 'N/A'}
                                            </p>
                                            <p className='text-gray-500 text-xs'>
                                                Referred on: {new Date(referral.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className='text-right'>
                                            <p className={`font-semibold ${
                                                referral.status === 'completed' ? 'text-green-400' :
                                                referral.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                                {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                                            </p>
                                            {referral.rewardAmount > 0 && (
                                                <p className='text-gray-800 font-bold'>₹{referral.rewardAmount}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='text-center py-8'>
                            <FaUsers className='text-4xl text-gray-500 mx-auto mb-4' />
                            <p className='text-gray-600'>No referrals yet. Start sharing your code!</p>
                        </div>
                    )}
                </div>

                {/* Rewards History */}
                <div className='bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-sm'>
                    <h2 className='text-2xl font-semibold text-gray-800 mb-4'>Rewards History</h2>

                    {referralRewards.length > 0 ? (
                        <div className='space-y-4'>
                            {referralRewards.map((reward, index) => (
                                <div key={index} className='bg-white/10 rounded-lg p-4'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <p className='text-gray-800 font-semibold'>{reward.description}</p>
                                            <p className='text-gray-600 text-sm'>
                                                {new Date(reward.createdAt || Date.now()).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className='text-right'>
                                            <p className='text-gray-800 font-bold text-lg'>₹{reward.amount}</p>
                                            <p className={`text-sm font-semibold ${getRewardStatusColor(reward.status)}`}>
                                                {getRewardStatusText(reward.status)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='text-center py-8'>
                            <FaGift className='text-4xl text-gray-500 mx-auto mb-4' />
                            <p className='text-gray-600'>No rewards yet. Start referring friends!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReferralDashboard;