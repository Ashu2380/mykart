import React, { useContext, useEffect, useState } from 'react';
import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import { useLocation, useSearchParams } from 'react-router-dom';
import Title from '../component/Title';
import { shopDataContext } from '../context/ShopContext';
import Card from '../component/Card';

function Collections() {
    let [showFilter, setShowFilter] = useState(false);
    let { products, search, showSearch } = useContext(shopDataContext);
    let [filterProduct, setFilterProduct] = useState([]);
    let [category, setCategory] = useState([]);
    let [subCategory, setSubCategory] = useState([]);
    let [sortType, setSortType] = useState("relevant");
    let [searchParams] = useSearchParams();
    let location = useLocation();

    // Handle URL category parameter
    useEffect(() => {
        const urlCategory = searchParams.get('category');
        if (urlCategory) {
            setCategory([urlCategory]);
        } else {
            setCategory([]);
        }
    }, [searchParams]);

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

        if (showSearch && search) {
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

    const sortProducts = (e) => {
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
        <div className='w-[99vw] min-h-[100vh] bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] flex items-start flex-col md:flex-row justify-start overflow-x-hidden z-[2] pb-[110px] pt-20 md:pt-16 lg:pt-20'>
            <div className={`md:w-[30vw] lg:w-[20vw] w-[100vw] md:min-h-[100vh] ${showFilter ? "h-[45vh]" : "h-[8vh]"} p-4 md:p-5 lg:p-[20px] border-r-[1px] border-gray-400 text-[#aaf5fa] lg:fixed`}>
                <p className='text-[25px] font-semibold flex gap-[5px] items-center justify-start cursor-pointer' onClick={() => setShowFilter(prev => !prev)}>FILTERS
                    {!showFilter && <FaChevronRight className='text-[18px] md:hidden' />}
                    {showFilter && <FaChevronDown className='text-[18px] md:hidden' />}
                </p>

                <div className={`border-[2px] border-purple-400/50 pl-6 py-4 mt-6 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md ${showFilter ? "" : "hidden"} md:block`}>
                    <div className='flex justify-between items-center mb-3'>
                        <p className='text-[20px] font-medium text-white'>CATEGORIES</p>
                        {(category.length > 0 || subCategory.length > 0) && (
                            <button
                                onClick={clearFilters}
                                className='text-[12px] text-red-400 hover:text-red-300 underline'
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                    <div className='w-[300px] max-h-[250px] overflow-y-auto flex items-start justify-center gap-[12px] flex-col'>
                        <p className='flex items-center justify-center gap-[12px] text-[17px] font-normal hover:text-white transition-colors'>
                            <input type="checkbox" value={'Clothes'} className='w-4 h-4' onChange={toggleCategory} checked={category.includes('Clothes')} /> Clothes
                        </p>
                        <p className='flex items-center justify-center gap-[12px] text-[17px] font-normal hover:text-white transition-colors'>
                            <input type="checkbox" value={'Electronics'} className='w-4 h-4' onChange={toggleCategory} checked={category.includes('Electronics')} /> Electronics
                        </p>
                        <p className='flex items-center justify-center gap-[12px] text-[17px] font-normal hover:text-white transition-colors'>
                            <input type="checkbox" value={'Home & Kitchen'} className='w-4 h-4' onChange={toggleCategory} checked={category.includes('Home & Kitchen')} /> Home & Kitchen
                        </p>
                        <p className='flex items-center justify-center gap-[12px] text-[17px] font-normal hover:text-white transition-colors'>
                            <input type="checkbox" value={'Beauty & Health'} className='w-4 h-4' onChange={toggleCategory} checked={category.includes('Beauty & Health')} /> Beauty & Health
                        </p>
                        <p className='flex items-center justify-center gap-[12px] text-[17px] font-normal hover:text-white transition-colors'>
                            <input type="checkbox" value={'Sports & Outdoors'} className='w-4 h-4' onChange={toggleCategory} checked={category.includes('Sports & Outdoors')} /> Sports & Outdoors
                        </p>
                        <p className='flex items-center justify-center gap-[12px] text-[17px] font-normal hover:text-white transition-colors'>
                            <input type="checkbox" value={'Books & Media'} className='w-4 h-4' onChange={toggleCategory} checked={category.includes('Books & Media')} /> Books & Media
                        </p>
                        <p className='flex items-center justify-center gap-[12px] text-[17px] font-normal hover:text-white transition-colors'>
                            <input type="checkbox" value={'Toys & Games'} className='w-4 h-4' onChange={toggleCategory} checked={category.includes('Toys & Games')} /> Toys & Games
                        </p>
                    </div>
                </div>
                <div className={`border-[2px] border-pink-400/50 pl-5 py-3 mt-6 rounded-md bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm ${showFilter ? "" : "hidden"} md:block`}>
                    <p className='text-[18px] text-white'>SUB-CATEGORIES</p>
                    <div className='w-[230px] max-h-[200px] overflow-y-auto flex items-start justify-center gap-[10px] flex-col'>
                        {/* Clothes Subcategories */}
                        {category.includes('Clothes') && (
                            <>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'TopWear'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('TopWear')} /> TopWear
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'BottomWear'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('BottomWear')} /> BottomWear
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'WinterWear'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('WinterWear')} /> WinterWear
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'InnerWear'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('InnerWear')} /> InnerWear
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Socks'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Socks')} /> Socks
                                </p>
                            </>
                        )}

                        {/* Electronics Subcategories */}
                        {category.includes('Electronics') && (
                            <>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Phones'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Phones')} /> Phones
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Laptops'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Laptops')} /> Laptops
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Tablets'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Tablets')} /> Tablets
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Accessories'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Accessories')} /> Accessories
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Audio'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Audio')} /> Audio
                                </p>
                            </>
                        )}

                        {/* Home & Kitchen Subcategories */}
                        {category.includes('Home & Kitchen') && (
                            <>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Furniture'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Furniture')} /> Furniture
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Cookware'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Cookware')} /> Cookware
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Storage'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Storage')} /> Storage
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Decor'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Decor')} /> Decor
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Bedding'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Bedding')} /> Bedding
                                </p>
                            </>
                        )}

                        {/* Beauty & Health Subcategories */}
                        {category.includes('Beauty & Health') && (
                            <>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Skincare'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Skincare')} /> Skincare
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Haircare'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Haircare')} /> Haircare
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Makeup'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Makeup')} /> Makeup
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Fragrance'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Fragrance')} /> Fragrance
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Wellness'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Wellness')} /> Wellness
                                </p>
                            </>
                        )}

                        {/* Sports & Outdoors Subcategories */}
                        {category.includes('Sports & Outdoors') && (
                            <>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Athletic Wear'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Athletic Wear')} /> Athletic Wear
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Camping Gear'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Camping Gear')} /> Camping Gear
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Fitness Equipment'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Fitness Equipment')} /> Fitness Equipment
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Sports Accessories'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Sports Accessories')} /> Sports Accessories
                                </p>
                            </>
                        )}

                        {/* Books & Media Subcategories */}
                        {category.includes('Books & Media') && (
                            <>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Fiction'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Fiction')} /> Fiction
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Non-Fiction'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Non-Fiction')} /> Non-Fiction
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Educational'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Educational')} /> Educational
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Comics'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Comics')} /> Comics
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Movies & TV'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Movies & TV')} /> Movies & TV
                                </p>
                            </>
                        )}

                        {/* Toys & Games Subcategories */}
                        {category.includes('Toys & Games') && (
                            <>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Action Figures'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Action Figures')} /> Action Figures
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Board Games'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Board Games')} /> Board Games
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Puzzles'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Puzzles')} /> Puzzles
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Educational Toys'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Educational Toys')} /> Educational Toys
                                </p>
                                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'>
                                    <input type="checkbox" value={'Outdoor Toys'} className='w-3' onChange={toggleSubCategory} checked={subCategory.includes('Outdoor Toys')} /> Outdoor Toys
                                </p>
                            </>
                        )}
                        
                        
                        
                        {/* Show message when no category is selected */}
                        {category.length === 0 && (
                            <p className='text-[14px] text-gray-300 italic'>Select a category to see subcategories</p>
                        )}
                    </div>
                </div>
            </div>
            <div className='lg:pl-[20%] md:py-[10px] '>
                <div className='md:w-[80vw] w-[100vw] flex justify-between flex-col lg:flex-row lg:px-[50px] '>
                    <Title text1={"ALL"} text2={"COLLECTIONS"}/>

                    <select name="" id="" className='bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm w-[60%] md:w-[200px] h-[50px] px-[10px] text-[white] rounded-lg hover:border-purple-400 border-[2px] border-purple-400/50 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300' onChange={(e) => setSortType(e.target.value)}>
                        <option value="relevant" className='w-[100%] h-[100%]'>Sort By: Relevant</option>
                        <option value="low-high" className='w-[100%] h-[100%]'>Sort By: Low to High</option>
                        <option value="high-low" className='w-[100%] h-[100%]'>Sort By: High to Low</option>
                    </select>
                </div>
                <div className='lg:w-[80vw] md:w-[60vw] w-[100vw] min-h-[70vh] flex items-center justify-center flex-wrap gap-[30px]'>
                    {
                        filterProduct.map((item, index) => (
                            <Card key={index} id={item._id} name={item.name} price={item.price} image={item.image1} discount={item.discount || 0}/>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

export default Collections;
