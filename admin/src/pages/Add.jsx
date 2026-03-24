import React, { useContext, useState, useRef, useEffect } from 'react';
import Nav from '../component/Nav';
import Sidebar from '../component/Sidebar';
import upload from '../assets/upload image.jpg';
import { authDataContext } from '../context/AuthContext';
import { adminDataContext } from '../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../component/Loading';

function Add() {
  let [image1, setImage1] = useState(false);
  let [image2, setImage2] = useState(false);
  let [image3, setImage3] = useState(false);
  let [image4, setImage4] = useState(false);
  const [video, setVideo] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Clothes");
  const [price, setPrice] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [bestseller, setBestSeller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ram, setRam] = useState("");
  const [rom, setRom] = useState("");
  
  // New fields
  const [stock, setStock] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [material, setMaterial] = useState("");
  
  // Image drag state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  let { serverUrl } = useContext(authDataContext);
  let { adminData } = useContext(adminDataContext);

  // Fallback server URL if not provided
  const API_URL = serverUrl || "http://localhost:8000";

  // Categories - try to fetch from backend, fallback to hardcoded
  const [categoriesList, setCategoriesList] = useState([
    { name: 'Clothes', subcategories: ['TopWear', 'BottomWear', 'WinterWear', 'InnerWear', 'Socks'] },
    { name: 'Electronics', subcategories: ['Phones', 'Laptops', 'Tablets', 'Accessories', 'Audio'] },
    { name: 'Home & Kitchen', subcategories: ['Furniture', 'Cookware', 'Storage', 'Decor', 'Bedding'] },
    { name: 'Beauty & Health', subcategories: ['Skincare', 'Haircare', 'Makeup', 'Fragrance', 'Wellness'] },
    { name: 'Sports & Outdoors', subcategories: ['Athletic Wear', 'Camping Gear', 'Fitness Equipment', 'Sports Accessories'] },
    { name: 'Books & Media', subcategories: ['Fiction', 'Non-Fiction', 'Educational', 'Comics', 'Movies & TV'] },
    { name: 'Toys & Games', subcategories: ['Action Figures', 'Board Games', 'Puzzles', 'Educational Toys', 'Outdoor Toys'] }
  ]);
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories from backend
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const result = await axios.get(API_URL + "/api/category/getall");
      if (result.data && result.data.length > 0) {
        setCategoriesList(result.data);
        // Build subcategories object
        const subcatObj = {};
        result.data.forEach(cat => {
          subcatObj[cat.name] = cat.subcategories || [];
        });
        setSubcategoriesMap(subcatObj);
        if (result.data.length > 0) {
          setCategory(result.data[0].name);
        }
      }
    } catch (error) {
      console.error("Error fetching categories, using defaults:", error);
      // Use default subcategories
      const defaultSubcats = {};
      categoriesList.forEach(cat => {
        defaultSubcats[cat.name] = cat.subcategories || [];
      });
      setSubcategoriesMap(defaultSubcats);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleBulkUpload = (files) => {
    const fileArray = Array.from(files);
    const maxFiles = Math.min(fileArray.length, 4);

    // Clear existing images
    setImage1(false);
    setImage2(false);
    setImage3(false);
    setImage4(false);

    // Set new images
    fileArray.slice(0, maxFiles).forEach((file, index) => {
      if (index === 0) setImage1(file);
      else if (index === 1) setImage2(file);
      else if (index === 2) setImage3(file);
      else if (index === 3) setImage4(file);
    });

    toast.success(`Successfully uploaded ${maxFiles} image${maxFiles > 1 ? 's' : ''}!`);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleBulkUpload(files);
    }
  };

  // Remove image
  const removeImage = (imageNumber) => {
    if (imageNumber === 1) setImage1(false);
    else if (imageNumber === 2) setImage2(false);
    else if (imageNumber === 3) setImage3(false);
    else if (imageNumber === 4) setImage4(false);
  };

  // Enhanced category and subcategory mappings - now fetched from backend
  const categoryOptions = categoriesList.map(cat => cat.name);

  const subCat = subcategoriesMap[category] || [];

  // Check if RAM/ROM should be shown
  const shouldShowRamRom = () => {
    return category === 'Electronics' && (subCategory === 'Phones' || subCategory === 'Laptops' || subCategory === 'Tablets');
  }

  // Size options based on category and subcategory
  const getSizeOptions = (category, subCategory) => {
    if (category === 'Clothes') {
      if (subCategory === 'BottomWear') {
        return ['28', '30', '32', '34', '36', '38', '40']
      } else if (subCategory === 'TopWear' || subCategory === 'WinterWear') {
        return ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      } else if (subCategory === 'InnerWear') {
        return ['S', 'M', 'L', 'XL']
      } else if (subCategory === 'Socks') {
        return ['6-7', '8-9', '10-11', '12-13']
      }
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    } else if (category === 'Electronics') {
      return []
    } else if (category === 'Home & Kitchen') {
      return []
    } else if (category === 'Beauty & Health') {
      return []
    } else if (category === 'Sports & Outdoors') {
      return []
    } else if (category === 'Books & Media') {
      return []
    } else if (category === 'Toys & Games') {
      return []
    }
    return []
  }

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value
    setCategory(newCategory)
    setSubCategory('')
    setSizes([])
    setRam('')
    setRom('')
  }

  const handleAddProduct = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      console.log('Starting product addition...');

      // Validate required fields
      if (!name || !description || !price || !category || !subCategory) {
        toast.error("Please fill all required fields");
        setLoading(false);
        return;
      }

      if (!image1) {
        toast.error("Please upload at least the first product image");
        setLoading(false);
        return;
      }

      let formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("discount", discount);
      
      // New fields
      if (stock) formData.append("stock", stock);
      if (brand) formData.append("brand", brand);
      if (color) formData.append("color", color);
      if (material) formData.append("material", material);
      
      if (shouldShowRamRom()) {
        formData.append("ram", ram);
        formData.append("rom", rom);
      }
      formData.append("image1", image1);
      formData.append("image2", image2);
      formData.append("image3", image3);
      formData.append("image4", image4);
      if (video) {
        formData.append("video", video);
      }

      let result = await axios.post(API_URL + "/api/product/addproduct", formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success("Product Added Successfully");
      setLoading(false);

      // Reset form
      setName("");
      setDescription("");
      setImage1(false);
      setImage2(false);
      setImage3(false);
      setImage4(false);
      setVideo(false);
      setPrice("");
      setBestSeller(false);
      setCategory("Clothes");
      setSubCategory("");
      setSizes([]);
      setDiscount(0);
      setRam("");
      setRom("");
      setStock("");
      setBrand("");
      setColor("");
      setMaterial("");

    } catch (error) {
      console.error('Error adding product:', error);
      setLoading(false);

      if (error.response?.status === 401) {
        toast.error("Admin authentication required. Please login again.");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add product. Please try again.");
      }
    }
  };

  if (!adminData) {
    return (
      <div className='w-[100vw] min-h-[100vh] bg-gradient-to-br from-slate-900 via-blue-950 to-teal-900 text-[white] flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold mb-4'>Admin Access Required</h2>
          <p className='text-gray-300'>Please login as admin to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full min-h-[100vh] bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 text-[black] overflow-x-hidden relative'>
      <Nav />
      <Sidebar />
      <div className='w-[82%] h-[calc(100vh-80px)] flex items-start justify-start overflow-y-auto absolute right-0 top-[80px] px-4 py-4'>
        <form action="" onSubmit={handleAddProduct} className='w-[100%] h-full flex flex-col gap-6 py-4 px-4 md:px-8'>
          
          {/* Header */}
          <div className='w-full flex items-center justify-between'>
            <div>
              <h1 className='text-2xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>Add New Product</h1>
              <p className='text-gray-500 mt-1'>Fill in the details below to add a new product to your inventory</p>
            </div>
            <div className='hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md'>
              <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
              <span className='text-sm text-gray-600'>Ready to add</span>
            </div>
          </div>

          {/* Section 1: Media Upload */}
          <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className='text-xl font-semibold text-gray-800'>Product Media</h2>
                <p className='text-sm text-gray-500'>Upload images and videos for your product</p>
              </div>
            </div>
            
            {/* Drag & Drop Zone */}
            <div 
              className={`border-2 border-dashed rounded-xl p-6 mb-4 transition-all duration-300 ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className='flex flex-col items-center justify-center'>
                <div className='w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-3'>
                  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className='text-gray-700 font-medium mb-1'>Drag & drop images here</p>
                <p className='text-gray-500 text-sm mb-3'>or</p>
                <label className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md'>
                  Browse Files
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    hidden 
                    multiple 
                    accept="image/*" 
                    onChange={(e) => handleBulkUpload(e.target.files)} 
                  />
                </label>
                <p className='text-gray-400 text-xs mt-3'>Supports: JPG, PNG, GIF, WebP (Max 4 images)</p>
              </div>
            </div>

            {/* Image Upload Grid */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {[image1, image2, image3, image4].map((img, index) => (
                <div key={index} className='relative group'>
                  <label className={`block w-full aspect-square cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 hover:shadow-lg ${img ? 'border-purple-500' : 'border-gray-300 hover:border-purple-400'}`}>
                    <img src={!img ? upload : URL.createObjectURL(img)} alt="" className='w-full h-full object-cover' />
                    <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <input type="file" hidden accept="image/*" onChange={(e) => {
                      if (index === 0) setImage1(e.target.files[0]);
                      else if (index === 1) setImage2(e.target.files[0]);
                      else if (index === 2) setImage3(e.target.files[0]);
                      else if (index === 3) setImage4(e.target.files[0]);
                    }} />
                  </label>
                  {/* Image number badge */}
                  <div className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ${['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'][index]}`}>
                    {index + 1}
                  </div>
                  {/* Remove button */}
                  {img && (
                    <button
                      type="button"
                      onClick={() => removeImage(index + 1)}
                      className='absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-sm shadow-md hover:bg-red-600 transition-colors'
                    >
                      ×
                    </button>
                  )}
                  {img && (
                    <div className='absolute bottom-2 left-2 right-2 bg-black/60 rounded-lg px-2 py-1'>
                      <p className='text-white text-xs truncate'>{img.name}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Video Upload */}
            <div className='mt-4 pt-4 border-t border-gray-100'>
              <div className='flex items-center justify-between mb-3'>
                <p className='text-gray-700 font-medium'>Product Video (Optional)</p>
                <span className='text-xs text-gray-400'>Max 100MB</span>
              </div>
              <div className='flex items-center gap-4'>
                <label className={`w-32 h-20 cursor-pointer rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${video ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-purple-400'}`}>
                  {video ? (
                    <div className='text-center'>
                      <div className='text-2xl'>🎬</div>
                      <div className='text-xs text-green-600 font-medium'>Added</div>
                    </div>
                  ) : (
                    <div className='text-center'>
                      <div className='text-2xl'>📹</div>
                      <div className='text-xs text-gray-500'>Upload</div>
                    </div>
                  )}
                  <input type="file" hidden accept="video/*" onChange={(e) => setVideo(e.target.files[0])} />
                </label>
                {video && (
                  <div className='flex-1'>
                    <p className='text-sm text-gray-700 font-medium'>{video.name}</p>
                    <p className='text-xs text-gray-500'>{(video.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <button type="button" onClick={() => setVideo(false)} className='text-xs text-red-500 hover:text-red-600 mt-1'>Remove video</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Basic Information */}
          <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className='text-xl font-semibold text-gray-800'>Basic Information</h2>
                <p className='text-sm text-gray-500'>Core product details</p>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-gray-700 font-medium mb-2'>Product Name <span className='text-red-500'>*</span></label>
                <input 
                  type="text" 
                  placeholder='Enter product name' 
                  className='w-full h-12 rounded-xl border-2 border-gray-300 px-4 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:border-gray-400' 
                  onChange={(e) => setName(e.target.value)} 
                  value={name} 
                  required 
                />
              </div>

              <div>
                <label className='block text-gray-700 font-medium mb-2'>Description <span className='text-red-500'>*</span></label>
                <textarea 
                  type="text" 
                  placeholder='Describe your product in detail - features, specifications, usage, etc.' 
                  className='w-full h-32 rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:border-gray-400 resize-none' 
                  onChange={(e) => setDescription(e.target.value)} 
                  value={description} 
                  required 
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-gray-700 font-medium mb-2'>Category <span className='text-red-500'>*</span></label>
                  <select 
                    className='w-full h-12 rounded-xl border-2 border-gray-300 px-4 text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:border-gray-400 bg-white' 
                    onChange={handleCategoryChange} 
                    value={category}
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-gray-700 font-medium mb-2'>Sub-Category <span className='text-red-500'>*</span></label>
                  <select 
                    className='w-full h-12 rounded-xl border-2 border-gray-300 px-4 text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:border-gray-400 bg-white' 
                    onChange={(e) => setSubCategory(e.target.value)} 
                    value={subCategory}
                  >
                    <option value="">Select Sub-Category</option>
                    {category && subcategoriesMap[category]?.map(subcat => (
                      <option key={subcat} value={subcat}>{subcat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Product Details - NEW */}
          <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <h2 className='text-xl font-semibold text-gray-800'>Product Details</h2>
                <p className='text-sm text-gray-500'>Brand, color, material, and specifications</p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-gray-700 font-medium mb-2'>Brand</label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    placeholder='e.g., Nike, Apple, Samsung' 
                    className='w-full h-12 rounded-xl border-2 border-gray-300 pl-10 pr-4 text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all duration-300 hover:border-gray-400' 
                    onChange={(e) => setBrand(e.target.value)} 
                    value={brand} 
                  />
                </div>
              </div>

              <div>
                <label className='block text-gray-700 font-medium mb-2'>Color</label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    placeholder='e.g., Black, Red, Blue' 
                    className='w-full h-12 rounded-xl border-2 border-gray-300 pl-10 pr-4 text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all duration-300 hover:border-gray-400' 
                    onChange={(e) => setColor(e.target.value)} 
                    value={color} 
                  />
                </div>
              </div>

              <div>
                <label className='block text-gray-700 font-medium mb-2'>Material</label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    placeholder='e.g., Cotton, Plastic, Metal' 
                    className='w-full h-12 rounded-xl border-2 border-gray-300 pl-10 pr-4 text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all duration-300 hover:border-gray-400' 
                    onChange={(e) => setMaterial(e.target.value)} 
                    value={material} 
                  />
                </div>
              </div>

              <div>
                <label className='block text-gray-700 font-medium mb-2'>Stock Quantity</label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <input 
                    type="number" 
                    placeholder='Available quantity' 
                    min="0"
                    className='w-full h-12 rounded-xl border-2 border-gray-300 pl-10 pr-4 text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all duration-300 hover:border-gray-400' 
                    onChange={(e) => setStock(e.target.value)} 
                    value={stock} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Pricing */}
          <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className='text-xl font-semibold text-gray-800'>Pricing</h2>
                <p className='text-sm text-gray-500'>Set price and discounts</p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-gray-700 font-medium mb-2'>Price (₹) <span className='text-red-500'>*</span></label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium'>₹</span>
                  <input 
                    type="number" 
                    placeholder='2000' 
                    className='w-full h-12 rounded-xl border-2 border-gray-300 pl-8 pr-4 text-gray-800 placeholder:text-gray-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 hover:border-gray-400' 
                    onChange={(e) => setPrice(e.target.value)} 
                    value={price} 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className='block text-gray-700 font-medium mb-2'>Discount (%)</label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium'>%</span>
                  <input 
                    type="number" 
                    placeholder='0' 
                    min="0" 
                    max="100" 
                    className='w-full h-12 rounded-xl border-2 border-gray-300 pl-8 pr-4 text-gray-800 placeholder:text-gray-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 transition-all duration-300 hover:border-gray-400' 
                    onChange={(e) => setDiscount(e.target.value)} 
                    value={discount} 
                  />
                </div>
                <p className='text-xs text-gray-500 mt-1'>Set 0 for no discount</p>
              </div>
            </div>

            {/* Price Preview */}
            {price && discount > 0 && (
              <div className='mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>Final Price After Discount</p>
                    <p className='text-xs text-gray-500'>Original: ₹{price} | Discount: {discount}%</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-2xl font-bold text-green-600'>₹{Math.round(price - (price * discount / 100))}</p>
                    <p className='text-xs text-green-500'>You save ₹{Math.round(price * discount / 100)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Specifications */}
          <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h2 className='text-xl font-semibold text-gray-800'>Specifications</h2>
                <p className='text-sm text-gray-500'>Size, RAM, ROM and other options</p>
              </div>
            </div>

            {/* RAM/ROM for Electronics */}
            {shouldShowRamRom() && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                <div>
                  <label className='block text-gray-700 font-medium mb-2'>RAM (GB)</label>
                  <input 
                    type="number" 
                    placeholder='8' 
                    className='w-full h-12 rounded-xl border-2 border-gray-300 px-4 text-gray-800 placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-200 transition-all duration-300 hover:border-gray-400' 
                    onChange={(e) => setRam(e.target.value)} 
                    value={ram} 
                  />
                </div>
                <div>
                  <label className='block text-gray-700 font-medium mb-2'>Storage (GB)</label>
                  <input 
                    type="number" 
                    placeholder='128' 
                    className='w-full h-12 rounded-xl border-2 border-gray-300 px-4 text-gray-800 placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-200 transition-all duration-300 hover:border-gray-400' 
                    onChange={(e) => setRom(e.target.value)} 
                    value={rom} 
                  />
                </div>
              </div>
            )}

            {/* Size Options */}
            {getSizeOptions(category, subCategory).length > 0 && (
              <div>
                <label className='block text-gray-700 font-medium mb-3'>Available Sizes</label>
                <div className='flex flex-wrap gap-3'>
                  {getSizeOptions(category, subCategory).map(size => (
                    <button
                      key={size}
                      type="button"
                      className={`px-5 py-2.5 rounded-xl text-base font-medium transition-all duration-300 hover:scale-105 ${
                        sizes.includes(size) 
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500 shadow-lg" 
                          : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                      }`}
                      onClick={() => setSizes(prev => prev.includes(size) ? prev.filter(item => item !== size) : [...prev, size])}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizes.length > 0 && (
                  <p className='text-sm text-green-600 mt-2'>✓ {sizes.length} size{sizes.length > 1 ? 's' : ''} selected</p>
                )}
              </div>
            )}
          </div>

          {/* Section 6: Additional Options */}
          <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h2 className='text-xl font-semibold text-gray-800'>Additional Options</h2>
                <p className='text-sm text-gray-500'>Special product settings</p>
              </div>
            </div>

            <div className='flex items-center gap-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100'>
              <div className='relative'>
                <input 
                  type="checkbox" 
                  id='checkbox' 
                  className='w-6 h-6 cursor-pointer accent-rose-500 rounded-md' 
                  onChange={() => setBestSeller(prev => !prev)} 
                  checked={bestseller}
                />
              </div>
              <label htmlFor="checkbox" className='flex-1 cursor-pointer'>
                <p className='text-gray-800 font-medium'>Mark as Bestseller</p>
                <p className='text-sm text-gray-500'>Featured products appear on the homepage</p>
              </label>
              {bestseller && (
                <span className='px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-medium rounded-full'>
                  ★ Bestseller
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex items-center justify-between gap-4 pt-4 pb-8'>
            <button 
              type="button"
              onClick={() => {
                setName("");
                setDescription("");
                setImage1(false);
                setImage2(false);
                setImage3(false);
                setImage4(false);
                setVideo(false);
                setPrice("");
                setBestSeller(false);
                setCategory("Clothes");
                setSubCategory("");
                setSizes([]);
                setDiscount(0);
                setRam("");
                setRom("");
                setStock("");
                setBrand("");
                setColor("");
                setMaterial("");
                toast.info("Form cleared");
              }}
              className='px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300'
            >
              Clear Form
            </button>
            <button 
              type="submit" 
              className='flex-1 md:flex-none md:px-12 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex items-center justify-center gap-2 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 active:scale-95 font-bold text-lg'
            >
              {loading ? <Loading /> : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Add;
