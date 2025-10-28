import React, { useState } from 'react';
import VisualSearch from '../component/VisualSearch';
import Card from '../component/Card';
import Title from '../component/Title';
import { useNavigate } from 'react-router-dom';

function VisualSearchPage() {
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

    const handleSearchResults = (results) => {
        setSearchResults(results);
        setIsSearching(false);
    };

    const handleSearchStart = () => {
        setIsSearching(true);
        setSearchResults([]);
    };

    return (
        <div className='w-[100vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] flex flex-col items-center py-[20px]'>
            <div className='w-[90%] max-w-[1200px]'>
                {/* Header */}
                <div className='text-center mb-[50px]'>
                    <Title text1={"VISUAL"} text2={"SEARCH"}/>
                    <p className='text-[16px] md:text-[20px] text-blue-100 mt-[10px]'>
                        Upload a photo to find similar products instantly!
                    </p>
                </div>

                {/* Visual Search Component */}
                <div className='flex justify-center mb-[50px]'>
                    <div className='bg-white/10 backdrop-blur-sm rounded-lg p-[30px] border border-white/20'>
                        <VisualSearch onResults={handleSearchResults} onSearchStart={handleSearchStart} />
                    </div>
                </div>

                {/* Search Results */}
                {isSearching && (
                    <div className='text-center py-[50px]'>
                        <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
                        <p className='text-blue-100 mt-[20px]'>Searching for similar products...</p>
                    </div>
                )}

                {searchResults.length > 0 && (
                    <div>
                        <div className='text-center mb-[30px]'>
                            <h3 className='text-[24px] font-bold text-white'>
                                Found {searchResults.length} Similar Products
                            </h3>
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[30px]'>
                            {searchResults.map((product, index) => (
                                <div key={product._id || index} className='transform hover:scale-105 transition-transform duration-300'>
                                    <Card
                                        name={product.name}
                                        image={product.image1}
                                        id={product._id}
                                        price={product.price}
                                        discount={product.discount}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {searchResults.length === 0 && !isSearching && (
                    <div className='text-center py-[50px]'>
                        <div className='text-blue-200 text-[18px]'>
                            <p>👆 Upload an image above to start visual search</p>
                            <p className='text-[14px] mt-[10px] text-blue-300'>
                                Find products by uploading photos of items you like
                            </p>
                        </div>
                    </div>
                )}

                {/* Tips Section */}
                <div className='mt-[50px] bg-white/5 backdrop-blur-sm rounded-lg p-[30px] border border-white/10'>
                    <h4 className='text-[20px] font-semibold text-white mb-[20px] text-center'>
                        💡 Visual Search Tips
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-[20px] text-blue-100'>
                        <div className='flex items-start space-x-[10px]'>
                            <span className='text-blue-400 text-[20px]'>📸</span>
                            <div>
                                <h5 className='font-semibold'>Clear Photos</h5>
                                <p className='text-[14px]'>Upload well-lit, clear images for better results</p>
                            </div>
                        </div>
                        <div className='flex items-start space-x-[10px]'>
                            <span className='text-blue-400 text-[20px]'>🎨</span>
                            <div>
                                <h5 className='font-semibold'>Focus on Details</h5>
                                <p className='text-[14px]'>Capture specific patterns, colors, or styles you want to match</p>
                            </div>
                        </div>
                        <div className='flex items-start space-x-[10px]'>
                            <span className='text-blue-400 text-[20px]'>📱</span>
                            <div>
                                <h5 className='font-semibold'>Supported Formats</h5>
                                <p className='text-[14px]'>JPG, PNG, and other common image formats up to 5MB</p>
                            </div>
                        </div>
                        <div className='flex items-start space-x-[10px]'>
                            <span className='text-blue-400 text-[20px]'>⚡</span>
                            <div>
                                <h5 className='font-semibold'>Instant Results</h5>
                                <p className='text-[14px]'>Get similar product recommendations in seconds</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VisualSearchPage;