import React, { useContext, useState } from 'react';
import { shopDataContext } from '../context/ShopContext';
import { FaHeart, FaTrash, FaBell, FaBellSlash } from 'react-icons/fa';
import Title from './Title';
import { toast } from 'react-toastify';

const Wishlist = () => {
    const { wishlist, removeFromWishlist, updateWishlistItem } = useContext(shopDataContext);
    const [loading, setLoading] = useState(false);

    const handleRemoveFromWishlist = async (productId) => {
        setLoading(true);
        await removeFromWishlist(productId);
        setLoading(false);
    };

    const togglePriceAlert = async (productId, currentEnabled) => {
        setLoading(true);
        await updateWishlistItem(productId, { priceAlert: { enabled: !currentEnabled } });
        setLoading(false);
    };

    const setTargetPrice = async (productId, targetPrice) => {
        try {
            console.log('setTargetPrice called with:', productId, targetPrice);
            setLoading(true);
            const price = parseFloat(targetPrice);
            console.log('Parsed price:', price);

            if (isNaN(price) || price <= 0) {
                console.log('Invalid price detected');
                toast.error('Please enter a valid price greater than 0');
                setLoading(false);
                return;
            }

            console.log('Calling updateWishlistItem...');
            const result = await updateWishlistItem(productId, { priceAlert: { targetPrice: price } });
            console.log('updateWishlistItem result:', result);

            toast.success('Target price updated successfully!');
            setLoading(false);
        } catch (error) {
            console.error('Error in setTargetPrice:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error message:', error.message);

            // More specific error messages
            if (error.response?.status === 404) {
                toast.error('Product not found in wishlist');
            } else if (error.response?.status === 401) {
                toast.error('Please login to update wishlist');
            } else {
                toast.error('Failed to update target price. Please try again.');
            }
            setLoading(false);
        }
    };

    if (!wishlist || wishlist.length === 0) {
        return (
            <div className="flex flex-col sm:flex-row border-t pt-16">
                <div className="w-full sm:w-1/2 flex items-center justify-center py-12">
                    <div className="text-center">
                        <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
                        <Title text1="Your Wishlist" text2="is Empty" />
                        <p className="text-gray-500 mt-4">Add items you love to your wishlist and get notified about price drops!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="border-t pt-16 bg-blue-50">
            <div className="text-2xl mb-3">
                <Title text1="Your" text2="Wishlist" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                    <div key={item._id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative">
                            <img
                                src={item.product?.image1 || '/placeholder-image.jpg'}
                                alt={item.product?.name}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                            <button
                                onClick={() => handleRemoveFromWishlist(item.productId)}
                                disabled={loading}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">{item.product?.name}</h3>
                            <p className="text-gray-600 text-sm">{item.product?.description?.substring(0, 100)}...</p>

                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-green-600">
                                    ₹{item.product?.price}
                                </span>
                                <span className="text-sm text-gray-500">
                                    Added {new Date(item.addedAt).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Price Alert Section */}
                            <div className="border-t pt-3 mt-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Price Alert</span>
                                    <button
                                        onClick={() => togglePriceAlert(item._id, item.priceAlert?.enabled)}
                                        disabled={loading}
                                        className={`p-2 rounded-full transition-colors ${
                                            item.priceAlert?.enabled
                                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                        }`}
                                    >
                                        {item.priceAlert?.enabled ? <FaBell size={14} /> : <FaBellSlash size={14} />}
                                    </button>
                                </div>

                                {item.priceAlert?.enabled && (
                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            placeholder="Target price (optional)"
                                            defaultValue={item.priceAlert?.targetPrice || ''}
                                            onBlur={async (e) => {
                                                const value = e.target.value.trim();
                                                console.log('Input blur triggered with value:', value);
                                                console.log('Item data:', item);
                                                console.log('ProductId:', item.productId);
                                                console.log('ProductId type:', typeof item.productId);

                                                // Use the wishlist item ID for updating
                                                const itemId = item._id;
                                                console.log('Using itemId:', itemId);

                                                if (value) {
                                                    console.log('Calling setTargetPrice with:', itemId, value);
                                                    await setTargetPrice(itemId, value);
                                                } else {
                                                    console.log('Empty value, skipping update');
                                                }
                                            }}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    console.log('Enter key pressed, triggering blur');
                                                    e.target.blur();
                                                }
                                            }}
                                            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                            step="0.01"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Get notified when price drops below this amount (leave empty for any drop)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Wishlist Summary</h3>
                <p className="text-sm text-gray-600">
                    You have {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in your wishlist.
                    Price alerts are {wishlist.some(item => item.priceAlert?.enabled) ? 'active' : 'inactive'} for some items.
                </p>
            </div>
        </div>
    );
};

export default Wishlist;
