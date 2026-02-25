import React, { useContext, useEffect, useState } from 'react';
import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import { useSearchParams } from 'react-router-dom';
import Title from '../component/Title';
import { shopDataContext } from '../context/ShopContext';
import Card from '../component/Card';

function Collections() {
    let [showFilter, setShowFilter] = useState(false);
    let { products, search, showSearch, setSearch, setShowSearch } = useContext(shopDataContext);
    // let { userData } = useContext(userDataContext);
    let [filterProduct, setFilterProduct] = useState([]);
    let [category, setCategory] = useState([]);
    let [subCategory, setSubCategory] = useState([]);
    let [sortType, setSortType] = useState("relevant");
    let [searchParams] = useSearchParams();
    // let location = useLocation();

    // Handle URL category parameter and search parameter
    useEffect(() => {
        const urlCategory = searchParams.get('category');
        const urlSearch = searchParams.get('search');

        if (urlCategory) {
            setCategory([urlCategory]);
        } else {
            setCategory([]);
        }

        // If there's a search parameter from visual search, set it in context
        if (urlSearch) {
            setSearch(urlSearch);
            setShowSearch(true);
        }
    }, [searchParams, setSearch, setShowSearch]);

    const clearFilters = () => {
        setCategory([]);
        setSubCategory([]);
        window.history.pushState({}, '', '/collection');
    };

    const toggleCategory = (e) => {
        if (category.includes(e.target.value)) {
            setCategory(prev => prev.filter(item => item !== e.target.value));
        } else {
            setCategory(prev => [...prev, e.target.value]);
        }
    }

    const toggleSubCategory = (e) => {
        if (subCategory.includes(e.target.value)) {
            setSubCategory(prev => prev.filter(item => item !== e.target.value));
        } else {
            setSubCategory(prev => [...prev, e.target.value]);
        }
    }

    const applyFilter = () => {
        let productCopy = products.slice();

        if (search) {
            productCopy = productCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
        }
        if (category.length > 0) {
            productCopy = productCopy.filter(item => category.includes(item.category));
        }
        if (subCategory.length > 0) {
            productCopy = productCopy.filter(item => subCategory.includes(item.subCategory));
        }
        setFilterProduct(productCopy);
    }

    const sortProducts = () => {
        let fbCopy = filterProduct.slice();

        switch (sortType) {
            case 'low-high':
                setFilterProduct(fbCopy.sort((a, b) => (a.price - b.price)));
                break;
            case 'high-low':
                setFilterProduct(fbCopy.sort((a, b) => (b.price - a.price)));
                break;
            default:
                applyFilter();
                break;
        }
    }

    useEffect(() => {
        sortProducts();
    }, [sortType]);

    useEffect(() => {
        setFilterProduct(products);
    }, [products]);

    useEffect(() => {
        applyFilter();
    }, [category, subCategory, search, showSearch]);



    return (
        <div className='w-full min-h-[100vh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-start flex-col md:flex-row justify-start overflow-x-hidden z-[2] pb-[110px] pt-20 md:pt-16 lg:pt-20'>
            <div className={`md:w-[25vw] lg:w-[18vw] w-[100vw] md:min-h-[100vh] ${showFilter ? "h-[50vh]" : "h-[8vh]"} p-4 md:p-5 lg:p-[20px] border-r-[1px] border-gray-300 text-gray-700 lg:fixed bg-white/90 backdrop-blur-sm shadow-lg`}>
                <p className='text-[24px] font-bold flex gap-[8px] items-center justify-start cursor-pointer text-gray-800 hover:text-blue-600 transition-colors duration-300' onClick={() => setShowFilter(prev => !prev)}>
                    FILTERS
                    {!showFilter && <FaChevronRight className='text-[16px] md:hidden' />}
                    {showFilter && <FaChevronDown className='text-[16px] md:hidden' />}
                </p>

                <div className={`border-[2px] border-gray-200 pl-6 py-4 mt-6 rounded-xl bg-white/80 backdrop-blur-md shadow-sm ${showFilter ? "" : "hidden"} md:block transition-all duration-300`}>
                    <div className='flex justify-between items-center mb-4'>
                        <p className='text-[18px] font-semibold text-gray-800'>CATEGORIES</p>
                        {(category.length > 0 || subCategory.length > 0) && (
                            <button
                                onClick={clearFilters}
                                className='text-[12px] text-red-500 hover:text-red-400 underline font-medium transition-colors duration-200'
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                    <div className='w-[280px] max-h-[200px] overflow-y-auto flex items-start justify-start gap-[12px] flex-col scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
                        <label className='flex items-center gap-[12px] text-[16px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                            <input type="checkbox" value={'Clothes'} className='w-4 h-4 accent-blue-500' onChange={toggleCategory} checked={category.includes('Clothes')} />
                            <span className='group-hover:font-semibold'>Clothes</span>
                        </label>
                        <label className='flex items-center gap-[12px] text-[16px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                            <input type="checkbox" value={'Electronics'} className='w-4 h-4 accent-blue-500' onChange={toggleCategory} checked={category.includes('Electronics')} />
                            <span className='group-hover:font-semibold'>Electronics</span>
                        </label>
                        <label className='flex items-center gap-[12px] text-[16px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                            <input type="checkbox" value={'Home & Kitchen'} className='w-4 h-4 accent-blue-500' onChange={toggleCategory} checked={category.includes('Home & Kitchen')} />
                            <span className='group-hover:font-semibold'>Home & Kitchen</span>
                        </label>
                        <label className='flex items-center gap-[12px] text-[16px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                            <input type="checkbox" value={'Beauty & Health'} className='w-4 h-4 accent-blue-500' onChange={toggleCategory} checked={category.includes('Beauty & Health')} />
                            <span className='group-hover:font-semibold'>Beauty & Health</span>
                        </label>
                        <label className='flex items-center gap-[12px] text-[16px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                            <input type="checkbox" value={'Sports & Outdoors'} className='w-4 h-4 accent-blue-500' onChange={toggleCategory} checked={category.includes('Sports & Outdoors')} />
                            <span className='group-hover:font-semibold'>Sports & Outdoors</span>
                        </label>
                        <label className='flex items-center gap-[12px] text-[16px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                            <input type="checkbox" value={'Books & Media'} className='w-4 h-4 accent-blue-500' onChange={toggleCategory} checked={category.includes('Books & Media')} />
                            <span className='group-hover:font-semibold'>Books & Media</span>
                        </label>
                        <label className='flex items-center gap-[12px] text-[16px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                            <input type="checkbox" value={'Toys & Games'} className='w-4 h-4 accent-blue-500' onChange={toggleCategory} checked={category.includes('Toys & Games')} />
                            <span className='group-hover:font-semibold'>Toys & Games</span>
                        </label>
                    </div>
                </div>
                <div className={`border-[2px] border-gray-200 pl-5 py-4 mt-6 rounded-xl bg-white/80 backdrop-blur-md shadow-sm ${showFilter ? "" : "hidden"} md:block transition-all duration-300`}>
                    <p className='text-[17px] font-semibold text-gray-800 mb-3'>SUB-CATEGORIES</p>
                    <div className='w-[250px] max-h-[180px] overflow-y-auto flex items-start justify-start gap-[8px] flex-col scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
                        {/* Clothes Subcategories */}
                        {category.includes('Clothes') && (
                            <>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'TopWear'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('TopWear')} />
                                    <span className='group-hover:font-semibold'>TopWear</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'BottomWear'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('BottomWear')} />
                                    <span className='group-hover:font-semibold'>BottomWear</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'WinterWear'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('WinterWear')} />
                                    <span className='group-hover:font-semibold'>WinterWear</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'InnerWear'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('InnerWear')} />
                                    <span className='group-hover:font-semibold'>InnerWear</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Socks'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Socks')} />
                                    <span className='group-hover:font-semibold'>Socks</span>
                                </label>
                            </>
                        )}

                        {/* Electronics Subcategories */}
                        {category.includes('Electronics') && (
                            <>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Phones'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Phones')} />
                                    <span className='group-hover:font-semibold'>Phones</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Laptops'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Laptops')} />
                                    <span className='group-hover:font-semibold'>Laptops</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Tablets'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Tablets')} />
                                    <span className='group-hover:font-semibold'>Tablets</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Accessories'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Accessories')} />
                                    <span className='group-hover:font-semibold'>Accessories</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Audio'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Audio')} />
                                    <span className='group-hover:font-semibold'>Audio</span>
                                </label>
                            </>
                        )}

                        {/* Home & Kitchen Subcategories */}
                        {category.includes('Home & Kitchen') && (
                            <>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Furniture'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Furniture')} />
                                    <span className='group-hover:font-semibold'>Furniture</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Cookware'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Cookware')} />
                                    <span className='group-hover:font-semibold'>Cookware</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Storage'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Storage')} />
                                    <span className='group-hover:font-semibold'>Storage</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Decor'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Decor')} />
                                    <span className='group-hover:font-semibold'>Decor</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Bedding'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Bedding')} />
                                    <span className='group-hover:font-semibold'>Bedding</span>
                                </label>
                            </>
                        )}

                        {/* Beauty & Health Subcategories */}
                        {category.includes('Beauty & Health') && (
                            <>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Skincare'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Skincare')} />
                                    <span className='group-hover:font-semibold'>Skincare</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Haircare'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Haircare')} />
                                    <span className='group-hover:font-semibold'>Haircare</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Makeup'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Makeup')} />
                                    <span className='group-hover:font-semibold'>Makeup</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Fragrance'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Fragrance')} />
                                    <span className='group-hover:font-semibold'>Fragrance</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Wellness'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Wellness')} />
                                    <span className='group-hover:font-semibold'>Wellness</span>
                                </label>
                            </>
                        )}

                        {/* Sports & Outdoors Subcategories */}
                        {category.includes('Sports & Outdoors') && (
                            <>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Athletic Wear'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Athletic Wear')} />
                                    <span className='group-hover:font-semibold'>Athletic Wear</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Camping Gear'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Camping Gear')} />
                                    <span className='group-hover:font-semibold'>Camping Gear</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Fitness Equipment'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Fitness Equipment')} />
                                    <span className='group-hover:font-semibold'>Fitness Equipment</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Sports Accessories'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Sports Accessories')} />
                                    <span className='group-hover:font-semibold'>Sports Accessories</span>
                                </label>
                            </>
                        )}

                        {/* Books & Media Subcategories */}
                        {category.includes('Books & Media') && (
                            <>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Fiction'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Fiction')} />
                                    <span className='group-hover:font-semibold'>Fiction</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Non-Fiction'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Non-Fiction')} />
                                    <span className='group-hover:font-semibold'>Non-Fiction</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Educational'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Educational')} />
                                    <span className='group-hover:font-semibold'>Educational</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Comics'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Comics')} />
                                    <span className='group-hover:font-semibold'>Comics</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Movies & TV'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Movies & TV')} />
                                    <span className='group-hover:font-semibold'>Movies & TV</span>
                                </label>
                            </>
                        )}

                        {/* Toys & Games Subcategories */}
                        {category.includes('Toys & Games') && (
                            <>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Action Figures'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Action Figures')} />
                                    <span className='group-hover:font-semibold'>Action Figures</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Board Games'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Board Games')} />
                                    <span className='group-hover:font-semibold'>Board Games</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Puzzles'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Puzzles')} />
                                    <span className='group-hover:font-semibold'>Puzzles</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Educational Toys'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Educational Toys')} />
                                    <span className='group-hover:font-semibold'>Educational Toys</span>
                                </label>
                                <label className='flex items-center gap-[8px] text-[14px] font-medium hover:text-blue-600 transition-colors cursor-pointer group'>
                                    <input type="checkbox" value={'Outdoor Toys'} className='w-3 h-3 accent-blue-500' onChange={toggleSubCategory} checked={subCategory.includes('Outdoor Toys')} />
                                    <span className='group-hover:font-semibold'>Outdoor Toys</span>
                                </label>
                            </>
                        )}
                        
                        
                        
                        {/* Show message when no category is selected */}
                        {category.length === 0 && (
                            <p className='text-[14px] text-gray-500 italic bg-gray-50 p-2 rounded'></p>
                        )}
                    </div>
                </div>
            </div>
            <div className='lg:ml-[18vw] md:py-[10px] w-full'>
                <div className='w-full flex justify-between flex-col lg:flex-row lg:px-[50px] mb-6'>
                    <Title text1={"ALL"} text2={"COLLECTIONS"}/>

                    <select name="" id="" className='bg-white/90 backdrop-blur-sm w-[60%] md:w-[220px] h-[50px] px-[15px] text-gray-800 rounded-xl hover:border-blue-400 border-[2px] border-gray-300 hover:bg-white hover:shadow-lg transition-all duration-300 shadow-sm' onChange={(e) => setSortType(e.target.value)}>
                        <option value="relevant" className='text-gray-700'>Sort By: Relevant</option>
                        <option value="low-high" className='text-gray-700'>Sort By: Low to High</option>
                        <option value="high-low" className='text-gray-700'>Sort By: High to Low</option>
                    </select>
                </div>
                <div className='w-full min-h-[70vh] flex items-center justify-center flex-wrap gap-[25px] px-4'>
                    {filterProduct.length > 0 ? (
                        filterProduct.map((item, index) => (
                            <div key={index} className='transform hover:scale-105 transition-transform duration-300'>
                                <Card id={item._id} name={item.name} price={item.price} image={item.image1} discount={item.discount || 0}/>
                            </div>
                        ))
                    ) : (
                        <div className='text-center text-gray-800 bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg max-w-md'>
                            <div className='text-6xl mb-4'>🔍</div>
                            <p className='text-2xl font-semibold mb-4 text-gray-700'>No products found</p>
                            <p className='text-lg text-gray-600'>Try adjusting your filters or check back later for new products.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Collections;
