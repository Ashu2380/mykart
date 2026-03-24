import React, { useContext, useEffect, useState } from 'react';
import { FaSearch, FaThLarge, FaList, FaChevronLeft, FaChevronRight, FaFilter, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useSearchParams } from 'react-router-dom';
import { shopDataContext } from '../context/ShopContext';
import Card from '../component/Card';
import ListCard from '../component/ListCard';

function Collections() {
    let { products, search, setSearch, setShowSearch, showSearch } = useContext(shopDataContext);
    let [filterProduct, setFilterProduct] = useState([]);
    let [category, setCategory] = useState([]);
    let [subCategory, setSubCategory] = useState([]);
    let [sortType, setSortType] = useState("relevant");
    let [searchParams] = useSearchParams();
    let [minPrice, setMinPrice] = useState("");
    let [maxPrice, setMaxPrice] = useState("");
    let [selectedPriceRange, setSelectedPriceRange] = useState("");
    let [isGridView, setIsGridView] = useState(true);
    let [localSearch, setLocalSearch] = useState("");
    let [showFilters, setShowFilters] = useState(false);
    
    // Collapsible sections state
    let [categoryOpen, setCategoryOpen] = useState(true);
    let [priceOpen, setPriceOpen] = useState(true);
    let [ratingOpen, setRatingOpen] = useState(true);
    
    // Rating filter
    let [selectedRating, setSelectedRating] = useState("");
    
    // Pagination
    let [currentPage, setCurrentPage] = useState(1);
    let [itemsPerPage] = useState(12);
    
    let indexOfLastItem = currentPage * itemsPerPage;
    let indexOfFirstItem = indexOfLastItem - itemsPerPage;
    let currentProducts = filterProduct.slice(indexOfFirstItem, indexOfLastItem);
    let totalPages = Math.ceil(filterProduct.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [category, subCategory, search, localSearch, minPrice, maxPrice, selectedPriceRange, selectedRating]);

    useEffect(() => {
        const urlCategory = searchParams.get('category');
        const urlSearch = searchParams.get('search');
        if (urlCategory) setCategory([urlCategory]);
        else setCategory([]);
        if (urlSearch) {
            setSearch(urlSearch);
            setShowSearch(true);
        }
    }, [searchParams]);

    const clearFilters = () => {
        setCategory([]);
        setSubCategory([]);
        setMinPrice("");
        setMaxPrice("");
        setSelectedPriceRange("");
        setLocalSearch("");
        setSelectedRating("");
    };

    const toggleCategory = (cat) => {
        if (category.includes(cat)) {
            setCategory(prev => prev.filter(item => item !== cat));
        } else {
            setCategory(prev => [...prev, cat]);
        }
    };

    const applyFilter = () => {
        // Don't filter if products array is empty
        if (!products || products.length === 0) {
            setFilterProduct([]);
            return;
        }
        
        let productCopy = products.slice();
        
        // Apply global search from Nav (highest priority)
        const searchTerm = (search || localSearch || "").toLowerCase().trim();
        if (searchTerm) {
            productCopy = productCopy.filter(item => 
                (item.name && item.name.toLowerCase().includes(searchTerm)) ||
                (item.category && item.category.toLowerCase().includes(searchTerm)) ||
                (item.description && item.description.toLowerCase().includes(searchTerm)) ||
                (item.subCategory && item.subCategory.toLowerCase().includes(searchTerm))
            );
        }
        
        // Apply category filter
        if (category.length > 0) {
            productCopy = productCopy.filter(item => 
                item.category && category.includes(item.category)
            );
        }
        
        // Apply subcategory filter
        if (subCategory.length > 0) {
            productCopy = productCopy.filter(item => 
                item.subCategory && subCategory.includes(item.subCategory)
            );
        }
        
        // Apply price range filter (preset)
        if (selectedPriceRange) {
            let ranges = {
                'under500': [0, 500],
                '500to1000': [500, 1000],
                '1000to2000': [1000, 2000],
                '2000to5000': [2000, 5000],
                'above5000': [5000, Infinity]
            };
            let [min, max] = ranges[selectedPriceRange] || [0, Infinity];
            productCopy = productCopy.filter(item => {
                let price = item.price || 0;
                return price >= min && price <= max;
            });
        }
        
        // Apply custom price filter
        if (minPrice || maxPrice) {
            const min = minPrice ? parseFloat(minPrice) : 0;
            const max = maxPrice ? parseFloat(maxPrice) : Infinity;
            productCopy = productCopy.filter(item => {
                let price = item.price || 0;
                return price >= min && price <= max;
            });
        }
        
        // Apply rating filter
        if (selectedRating) {
            const minRating = parseInt(selectedRating);
            productCopy = productCopy.filter(item => (item.rating || 0) >= minRating);
        }
        
        setFilterProduct(productCopy);
    };

    const sortProducts = () => {
        let fbCopy = filterProduct.slice();
        switch (sortType) {
            case 'low-high':
                setFilterProduct(fbCopy.sort((a, b) => a.price - b.price));
                break;
            case 'high-low':
                setFilterProduct(fbCopy.sort((a, b) => b.price - a.price));
                break;
            default:
                applyFilter();
                break;
        }
    };

    useEffect(() => {
        // Sync local search with global search from Nav
        if (search) {
            setLocalSearch(search);
        }
    }, [search]);
    
    useEffect(() => sortProducts(), [sortType]);
    useEffect(() => {
        if (products && products.length > 0) {
            setFilterProduct(products);
        }
    }, [products]);
    useEffect(() => {
        applyFilter();
    }, [category, subCategory, localSearch, search, minPrice, maxPrice, selectedPriceRange, selectedRating]);

    const categories = ['Clothes', 'Electronics', 'Home & Kitchen', 'Beauty & Health', 'Sports & Outdoors', 'Books & Media', 'Toys & Games'];
    const priceRanges = [
        {label: 'Under ₹500', value: 'under500'},
        {label: '₹500 - ₹1000', value: '500to1000'},
        {label: '₹1000 - ₹2000', value: '1000to2000'},
        {label: '₹2000 - ₹5000', value: '2000to5000'},
        {label: 'Above ₹5000', value: 'above5000'}
    ];
    const ratings = [
        {label: '4★ & above', value: '4'},
        {label: '3★ & above', value: '3'},
        {label: '2★ & above', value: '2'},
        {label: '1★ & above', value: '1'}
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-10">
            {/* Header */}
            <div className="bg-white shadow-sm py-4 px-4 md:px-8 mb-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">All Collections</h1>
                    <p className="text-gray-500 text-sm mt-1">{filterProduct.length} products found</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                {/* Mobile Filter Toggle & Search Bar */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
                        >
                            <FaFilter /> Filters
                        </button>

                        <div className="relative flex-1 w-full">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products by name, category..."
                                value={localSearch}
                                onChange={(e) => {
                                    setLocalSearch(e.target.value);
                                    // Clear global search when typing in local search
                                    if (search) {
                                        setSearch("");
                                    }
                                }}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </div>

                        <select 
                            value={sortType} 
                            onChange={(e) => setSortType(e.target.value)}
                            className="px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none bg-white"
                        >
                            <option value="relevant">Sort: Relevant</option>
                            <option value="low-high">Price: Low to High</option>
                            <option value="high-low">Price: High to Low</option>
                        </select>

                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setIsGridView(true)}
                                className={`px-3 py-2 rounded-md transition ${isGridView ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                            >
                                <FaThLarge />
                            </button>
                            <button
                                onClick={() => setIsGridView(false)}
                                className={`px-3 py-2 rounded-md transition ${!isGridView ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                            >
                                <FaList />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Sidebar Filters - Desktop */}
                    <div className="hidden md:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                                {(category.length > 0 || selectedPriceRange || selectedRating) && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-red-500 hover:text-red-600"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Category Filter */}
                            <div className="border-b border-gray-100 pb-4 mb-4">
                                <button 
                                    onClick={() => setCategoryOpen(!categoryOpen)}
                                    className="flex items-center justify-between w-full text-left"
                                >
                                    <span className="font-medium text-gray-700">Category</span>
                                    {categoryOpen ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                                </button>
                                {categoryOpen && (
                                    <div className="mt-3 space-y-2">
                                        {categories.map(cat => (
                                            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={category.includes(cat)}
                                                    onChange={() => toggleCategory(cat)}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-600 group-hover:text-blue-600">{cat}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Price Filter */}
                            <div className="border-b border-gray-100 pb-4 mb-4">
                                <button 
                                    onClick={() => setPriceOpen(!priceOpen)}
                                    className="flex items-center justify-between w-full text-left"
                                >
                                    <span className="font-medium text-gray-700">Price Range</span>
                                    {priceOpen ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                                </button>
                                {priceOpen && (
                                    <div className="mt-3 space-y-2">
                                        {priceRanges.map(range => (
                                            <label key={range.value} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="priceRange"
                                                    checked={selectedPriceRange === range.value}
                                                    onChange={() => {
                                                        setSelectedPriceRange(range.value);
                                                        setMinPrice('');
                                                        setMaxPrice('');
                                                    }}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-600 group-hover:text-blue-600">{range.label}</span>
                                            </label>
                                        ))}
                                        <div className="flex gap-2 mt-3">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={minPrice}
                                                onChange={(e) => {
                                                    setMinPrice(e.target.value);
                                                    setSelectedPriceRange('');
                                                }}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={maxPrice}
                                                onChange={(e) => {
                                                    setMaxPrice(e.target.value);
                                                    setSelectedPriceRange('');
                                                }}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Rating Filter */}
                            <div className="pb-2">
                                <button 
                                    onClick={() => setRatingOpen(!ratingOpen)}
                                    className="flex items-center justify-between w-full text-left"
                                >
                                    <span className="font-medium text-gray-700">Rating</span>
                                    {ratingOpen ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                                </button>
                                {ratingOpen && (
                                    <div className="mt-3 space-y-2">
                                        {ratings.map(rat => (
                                            <label key={rat.value} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="rating"
                                                    checked={selectedRating === rat.value}
                                                    onChange={() => setSelectedRating(selectedRating === rat.value ? '' : rat.value)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-600 group-hover:text-blue-600">{rat.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filters Modal */}
                    {showFilters && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
                            <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto">
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold">Filters</h2>
                                        <button onClick={() => setShowFilters(false)} className="p-2">
                                            <FaTimes />
                                        </button>
                                    </div>

                                    {/* Mobile Category */}
                                    <div className="border-b border-gray-100 pb-4 mb-4">
                                        <h3 className="font-medium text-gray-700 mb-3">Category</h3>
                                        <div className="space-y-2">
                                            {categories.map(cat => (
                                                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={category.includes(cat)}
                                                        onChange={() => toggleCategory(cat)}
                                                        className="w-4 h-4 text-blue-600 rounded"
                                                    />
                                                    <span className="text-sm text-gray-600">{cat}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mobile Price */}
                                    <div className="border-b border-gray-100 pb-4 mb-4">
                                        <h3 className="font-medium text-gray-700 mb-3">Price</h3>
                                        <div className="space-y-2">
                                            {priceRanges.map(range => (
                                                <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="mobilePrice"
                                                        checked={selectedPriceRange === range.value}
                                                        onChange={() => setSelectedPriceRange(range.value)}
                                                        className="w-4 h-4 text-blue-600 rounded"
                                                    />
                                                    <span className="text-sm text-gray-600">{range.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={clearFilters}
                                        className="w-full py-2 text-red-500 border border-red-500 rounded-lg mb-2"
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="w-full py-2 bg-blue-600 text-white rounded-lg"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Products Grid */}
                    <div className="flex-1">
                        {currentProducts.length > 0 ? (
                            isGridView ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-5">
                                    {currentProducts.map((item, index) => (
                                        <Card 
                                            key={index} 
                                            id={item._id} 
                                            name={item.name} 
                                            price={item.price} 
                                            image={item.image1} 
                                            discount={item.discount || 0}
                                            category={item.category}
                                            bestseller={item.bestseller}
                                            sizes={item.sizes}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {currentProducts.map((item, index) => (
                                        <ListCard 
                                            key={index} 
                                            id={item._id} 
                                            name={item.name} 
                                            price={item.price} 
                                            image={item.image1} 
                                            discount={item.discount || 0}
                                            category={item.category}
                                            subCategory={item.subCategory}
                                            bestseller={item.bestseller}
                                            sizes={item.sizes}
                                        />
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl">
                                <p className="text-xl text-gray-600">No products found</p>
                                <p className="text-gray-500 mt-2">Try adjusting your filters</p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {filterProduct.length > itemsPerPage && (
                            <div className="flex justify-center items-center gap-2 mt-10">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-200 text-gray-400' : 'bg-white text-gray-700 hover:bg-blue-600 hover:text-white'} shadow-sm border`}
                                >
                                    <FaChevronLeft />
                                </button>
                                
                                {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 rounded-lg ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'} shadow-sm border`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-white text-gray-700 hover:bg-blue-600 hover:text-white'} shadow-sm border`}
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        )}

                        {filterProduct.length > 0 && (
                            <p className="text-center text-gray-500 text-sm mt-4">
                                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filterProduct.length)} of {filterProduct.length} products
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Collections;
