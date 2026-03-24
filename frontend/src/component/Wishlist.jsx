import React, { useContext, useState } from 'react';
import { shopDataContext } from '../context/ShopContext';
import { FaHeart, FaTrash } from 'react-icons/fa';
import Title from './Title';
import { toast } from 'react-toastify';

const Wishlist = () => {
    const { wishlist, removeFromWishlist } = useContext(shopDataContext);
    const [loading, setLoading] = useState(false);

    const handleRemoveFromWishlist = async (productId) => {
        setLoading(true);
        await removeFromWishlist(productId);
        setLoading(false);
    };

    if (!wishlist || wishlist.length === 0) {
        return (
            <div className="flex flex-col sm:flex-row border-t pt-16">
                <div className="w-full sm:w-1/2 flex items-center justify-center py-16">
                    <div className="text-center bg-white rounded-2xl p-10 shadow-lg border border-gray-100">
                        <FaHeart className="text-7xl text-gray-300 mx-auto mb-6" />
                        <Title text1="Your Wishlist" text2="is Empty" />
                        <p className="text-gray-500 mt-4 mb-6">Add items you love to your wishlist!</p>
                        <a href="/collection" className="bg-orange-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors inline-block">
                            Browse Products
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="border-t pt-20 bg-gray-50 pb-24 md:pb-8">
            <div className="mb-6">
                <Title text1="Your" text2="Wishlist" />
                <p className="text-gray-500 text-sm mt-1">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in your wishlist</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {wishlist.map((item) => (
                    <div key={item._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                            <img
                                src={item.product?.image1 || '/placeholder-image.jpg'}
                                alt={item.product?.name}
                                className="w-full h-40 object-cover"
                            />
                            <button
                                onClick={() => handleRemoveFromWishlist(item.productId)}
                                disabled={loading}
                                className="absolute top-2 right-2 bg-white/90 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all shadow"
                            >
                                <FaTrash size={12} />
                            </button>
                            {item.product?.discount > 0 && (
                                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    {item.product.discount}% OFF
                                </span>
                            )}
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 truncate">{item.product?.name}</h3>
                            <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.product?.description?.substring(0, 60)}...</p>

                            <div className="flex items-center gap-2 mt-3">
                                <span className="text-lg font-bold text-gray-900">
                                    ₹{item.product?.price - (item.product?.price * item.product?.discount / 100)}
                                </span>
                                {item.product?.discount > 0 && (
                                    <>
                                        <span className="text-sm text-gray-400 line-through">₹{item.product?.price}</span>
                                    </>
                                )}
                            </div>

                            <p className="text-xs text-gray-400 mt-2">Added {new Date(item.addedAt).toLocaleDateString()}</p>

                        </div>
                    </div>
                ))}
            </div>

            {/* Summary - Removed */}
        </div>
    );
};

export default Wishlist;
