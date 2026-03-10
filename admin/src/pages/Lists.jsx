import React, { useContext, useEffect, useState } from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import { authDataContext } from '../context/AuthContext'
import { adminDataContext } from '../context/AdminContext'
import axios from 'axios'
import { FaEdit, FaTrash, FaTimes, FaUpload, FaSearch, FaFilter, FaBox, FaStar, FaTag, FaRupeeSign, FaCheck, FaTimesCircle } from 'react-icons/fa'

function Lists() {
  let [list, setList] = useState([])
  let [filteredList, setFilteredList] = useState([])
  let [showEditModal, setShowEditModal] = useState(false)
  let [editingProduct, setEditingProduct] = useState(null)
  let [loading, setLoading] = useState(false)
  let [searchQuery, setSearchQuery] = useState('')
  let [selectedCategory, setSelectedCategory] = useState('all')
  let [isGridView, setIsGridView] = useState(true)

  // Category and subcategory mappings
  const categories = [
    'Clothes',
    'Electronics',
    'Home & Kitchen',
    'Beauty & Health',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games'
  ]

  const subcategories = {
    'Clothes': ['TopWear', 'BottomWear', 'WinterWear', 'InnerWear', 'Socks'],
    'Electronics': ['Phones', 'Laptops', 'Tablets', 'Accessories', 'Audio'],
    'Home & Kitchen': ['Furniture', 'Cookware', 'Storage', 'Decor', 'Bedding'],
    'Beauty & Health': ['Skincare', 'Haircare', 'Makeup', 'Fragrance', 'Wellness'],
    'Sports & Outdoors': ['Athletic Wear', 'Camping Gear', 'Fitness Equipment', 'Sports Accessories'],
    'Books & Media': ['Fiction', 'Non-Fiction', 'Educational', 'Comics', 'Movies & TV'],
    'Toys & Games': ['Action Figures', 'Board Games', 'Puzzles', 'Educational Toys', 'Outdoor Toys']
  }

  // Size options based on category
  const getSizeOptions = (category) => {
    if (category === 'Clothes') {
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    } else if (category === 'Electronics') {
      return []
    } else if (category === 'Home & Kitchen') {
      return []
    } else if (category === 'Beauty & Health') {
      return []
    } else if (category === 'Sports & Outdoors') {
      return ['S', 'M', 'L', 'XL', 'XXL']
    } else if (category === 'Books & Media') {
      return []
    } else if (category === 'Toys & Games') {
      return []
    }
    return ['S', 'M', 'L', 'XL']
  }

  let [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    sizes: '',
    bestseller: false,
    discount: 0
  })

  let [imageFiles, setImageFiles] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null
  })

  let { serverUrl } = useContext(authDataContext)
  let { adminData } = useContext(adminDataContext)

  const fetchList = async () => {
    try {
      setLoading(true)
      let result = await axios.get(serverUrl + "/api/product/list")
      setList(result.data)
      setFilteredList(result.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  // Filter products based on search and category
  useEffect(() => {
    let filtered = list.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    setFilteredList(filtered)
  }, [searchQuery, selectedCategory, list])

  const removeList = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    
    try {
      let result = await axios.post(`${serverUrl}/api/product/remove/${id}`, {}, { withCredentials: true })
      if (result.data) {
        fetchList()
      } else {
        console.log("Failed to remove Product")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const openEditModal = (product) => {
    const sizeOptions = getSizeOptions(product.category)
    setEditingProduct(product)
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subCategory: product.subCategory,
      sizes: sizeOptions.length > 0 ? JSON.stringify(product.sizes) : JSON.stringify([]),
      bestseller: product.bestseller,
      discount: product.discount || 0
    })
    setImageFiles({
      image1: null,
      image2: null,
      image3: null,
      image4: null
    })
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingProduct(null)
    setEditFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      subCategory: '',
      sizes: JSON.stringify([]),
      bestseller: false,
      discount: 0
    })
    setImageFiles({
      image1: null,
      image2: null,
      image3: null,
      image4: null
    })
  }

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === 'category') {
      setEditFormData(prev => ({
        ...prev,
        category: value,
        subCategory: '',
        sizes: getSizeOptions(value).length > 0 ? JSON.stringify(getSizeOptions(value)) : prev.sizes
      }))
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleImageChange = (e, imageKey) => {
    const file = e.target.files[0]
    setImageFiles(prev => ({
      ...prev,
      [imageKey]: file
    }))
  }

  const updateProduct = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', editFormData.name)
      formData.append('description', editFormData.description)
      formData.append('price', editFormData.price)
      formData.append('category', editFormData.category)
      formData.append('subCategory', editFormData.subCategory)
      formData.append('sizes', editFormData.sizes)
      formData.append('bestseller', editFormData.bestseller)
      formData.append('discount', editFormData.discount)

      if (imageFiles.image1) formData.append('image1', imageFiles.image1)
      if (imageFiles.image2) formData.append('image2', imageFiles.image2)
      if (imageFiles.image3) formData.append('image3', imageFiles.image3)
      if (imageFiles.image4) formData.append('image4', imageFiles.image4)

      const result = await axios.put(`${serverUrl}/api/product/update/${editingProduct._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      })

      if (result.data) {
        fetchList()
        closeEditModal()
        alert('Product updated successfully!')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert(`Failed to update product: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (adminData) {
      fetchList()
    }
  }, [adminData])

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

  // Calculate discount price
  const getDiscountedPrice = (price, discount) => {
    return Math.round(price * (1 - discount / 100))
  }

  return (
    <div className='w-full min-h-[100vh] bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 text-[black] overflow-x-hidden relative'>
      <Nav />
      <Sidebar />
      
      <div className='w-[82%] h-[calc(100vh-80px)] flex items-start justify-start overflow-y-auto absolute right-0 top-[80px] px-4 py-4'>
        <div className='w-[100%] h-full flex flex-col overflow-y-auto'>
          
          {/* Header Section */}
          <div className='flex-shrink-0'>
            <div>
              <h1 className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                All Listed Products
              </h1>
              <p className='text-gray-500 mt-1 text-sm md:text-base'>
                Manage your product inventory
              </p>
            </div>
            <div className='flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md'>
              <span className='text-sm text-gray-500 font-medium'>
                {filteredList.length} {filteredList.length === 1 ? 'product' : 'products'}
              </span>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className='flex-shrink-0 bg-white rounded-2xl shadow-lg p-4 border border-gray-100'>
            <div className='flex flex-col md:flex-row gap-4'>
              {/* Search Input */}
              <div className='flex-1 relative'>
                <FaSearch className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search products by name or category...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 bg-gray-50 focus:bg-white'
                />
              </div>
              
              {/* Category Filter */}
              <div className='relative md:w-64'>
                <FaFilter className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className='w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer'
                >
                  <option value='all'>All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* View Toggle */}
              <div className='flex bg-gray-100 rounded-xl p-1'>
                <button
                  onClick={() => setIsGridView(true)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${isGridView ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${!isGridView ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {loading ? (
            <div className='flex items-center justify-center py-20'>
              <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600'></div>
            </div>
          ) : filteredList.length > 0 ? (
            isGridView ? (
              // Grid View
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {filteredList.map((item, index) => (
                  <div 
                    className='bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group animate-fade-in-up' 
                    key={index}
                    style={{animationDelay: `${index * 0.03}s`}}
                  >
                    {/* Image */}
                    <div className='relative h-48 bg-gray-100 overflow-hidden'>
                      <img 
                        src={item.image1} 
                        className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' 
                        alt={item.name} 
                      />
                      {/* Badges */}
                      <div className='absolute top-3 left-3 flex flex-col gap-1'>
                        {item.bestseller && (
                          <span className='bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1'>
                            <FaStar className='text-[10px]' /> Bestseller
                          </span>
                        )}
                        {item.discount > 0 && (
                          <span className='bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full'>
                            {item.discount}% OFF
                          </span>
                        )}
                      </div>
                      {/* Action Buttons */}
                      <div className='absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        <button
                          onClick={() => openEditModal(item)}
                          className='w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 text-indigo-600 hover:text-indigo-700'
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => removeList(item._id)}
                          className='w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 text-red-500 hover:text-red-600'
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className='p-4'>
                      <div className='flex items-start justify-between gap-2 mb-2'>
                        <h3 className='font-semibold text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors'>
                          {item.name}
                        </h3>
                      </div>
                      
                      <div className='flex items-center gap-2 mb-3'>
                        <span className='text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg'>
                          {item.category}
                        </span>
                        {item.subCategory && (
                          <span className='text-xs text-gray-500'>
                            {item.subCategory}
                          </span>
                        )}
                      </div>
                      
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <span className='text-lg font-bold text-gray-900'>
                            ₹{getDiscountedPrice(item.price, item.discount)}
                          </span>
                          {item.discount > 0 && (
                            <span className='text-sm text-gray-400 line-through'>
                              ₹{item.price}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {item.sizes && item.sizes.length > 0 && (
                        <div className='mt-3 flex flex-wrap gap-1'>
                          {item.sizes.map((size, idx) => (
                            <span key={idx} className='text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded'>
                              {size}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className='space-y-4'>
                {filteredList.map((item, index) => (
                  <div 
                    className='bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4 flex flex-col md:flex-row items-center gap-4 border border-gray-100 group animate-fade-in-up'
                    key={index}
                    style={{animationDelay: `${index * 0.03}s`}}
                  >
                    {/* Image */}
                    <div className='w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100'>
                      <img 
                        src={item.image1} 
                        className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' 
                        alt={item.name} 
                      />
                    </div>
                    
                    {/* Content */}
                    <div className='flex-1 w-full'>
                      <div className='flex flex-col md:flex-row md:items-center justify-between gap-2'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-1'>
                            <h3 className='font-semibold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors'>
                              {item.name}
                            </h3>
                            {item.bestseller && (
                              <span className='bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1'>
                                <FaStar className='text-[8px]' /> Bestseller
                              </span>
                            )}
                          </div>
                          <div className='flex items-center gap-2 text-sm text-gray-500'>
                            <span className='font-medium px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg'>
                              {item.category}
                            </span>
                            {item.subCategory && <span>/ {item.subCategory}</span>}
                            {item.sizes && item.sizes.length > 0 && (
                              <span className='text-gray-400'>| Sizes: {item.sizes.join(', ')}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className='flex items-center gap-4'>
                          <div className='text-right'>
                            <div className='flex items-center gap-2 justify-end'>
                              <span className='text-xl font-bold text-gray-900'>
                                ₹{getDiscountedPrice(item.price, item.discount)}
                              </span>
                              {item.discount > 0 && (
                                <span className='text-sm text-gray-400 line-through'>
                                  ₹{item.price}
                                </span>
                              )}
                            </div>
                            {item.discount > 0 && (
                              <span className='text-xs text-red-500 font-medium'>
                                Save {item.discount}% 
                              </span>
                            )}
                          </div>
                          
                          <div className='flex gap-2'>
                            <button
                              onClick={() => openEditModal(item)}
                              className='w-10 h-10 bg-indigo-50 hover:bg-indigo-100 rounded-xl flex items-center justify-center transition-all duration-200 text-indigo-600 hover:text-indigo-700 hover:shadow-md'
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => removeList(item._id)}
                              className='w-10 h-10 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-all duration-200 text-red-500 hover:text-red-600 hover:shadow-md'
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Empty State */
            <div className='flex flex-col items-center justify-center py-20 animate-fade-in'>
              <div className='w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6'>
                <FaBox className='text-5xl text-indigo-400' />
              </div>
              <h3 className='text-2xl font-bold text-gray-800 mb-2'>
                {searchQuery || selectedCategory !== 'all' ? 'No products found' : 'No products yet'}
              </h3>
              <p className='text-gray-500 text-center max-w-md mb-6'>
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start adding products to your inventory to see them here'}
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className='px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors duration-200'
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-full md:max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
            <div className='p-6 md:p-8'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h2 className='text-2xl md:text-3xl font-bold text-white'>Edit Product</h2>
                  <p className='text-gray-400 text-sm mt-1'>Update product details below</p>
                </div>
                <button
                  onClick={closeEditModal}
                  className='w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200'
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={updateProduct} className='space-y-6'>
                {/* Basic Information */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
                  <div>
                    <label className='block text-gray-300 mb-2 font-medium'>Product Name</label>
                    <input
                      type='text'
                      name='name'
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                      className='w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-500 border border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all duration-200'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-gray-300 mb-2 font-medium'>Price (₹)</label>
                    <input
                      type='number'
                      name='price'
                      value={editFormData.price}
                      onChange={handleEditFormChange}
                      className='w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-500 border border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all duration-200'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-gray-300 mb-2 font-medium'>Discount (%)</label>
                    <input
                      type='number'
                      name='discount'
                      value={editFormData.discount}
                      onChange={handleEditFormChange}
                      min='0'
                      max='100'
                      className='w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-500 border border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all duration-200'
                    />
                  </div>

                  <div>
                    <label className='block text-gray-300 mb-2 font-medium'>Category</label>
                    <select
                      name='category'
                      value={editFormData.category}
                      onChange={handleEditFormChange}
                      className='w-full p-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all duration-200 cursor-pointer'
                      required
                    >
                      <option value='' className='text-gray-900'>Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category} className='text-gray-900'>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-gray-300 mb-2 font-medium'>Sub Category</label>
                    <select
                      name='subCategory'
                      value={editFormData.subCategory}
                      onChange={handleEditFormChange}
                      className='w-full p-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all duration-200 cursor-pointer'
                      required
                    >
                      <option value='' className='text-gray-900'>Select Sub Category</option>
                      {editFormData.category && subcategories[editFormData.category]?.map(subcategory => (
                        <option key={subcategory} value={subcategory} className='text-gray-900'>{subcategory}</option>
                      ))}
                    </select>
                  </div>

                  {getSizeOptions(editFormData.category).length > 0 && (
                    <div>
                      <label className='block text-gray-300 mb-2 font-medium'>Sizes</label>
                      <div className='flex flex-wrap gap-2'>
                        {getSizeOptions(editFormData.category).map(size => (
                          <label 
                            key={size} 
                            className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              JSON.parse(editFormData.sizes || '[]').includes(size)
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                          >
                            <input
                              type='checkbox'
                              value={size}
                              onChange={(e) => {
                                const currentSizes = JSON.parse(editFormData.sizes || '[]')
                                let newSizes
                                if (e.target.checked) {
                                  newSizes = [...currentSizes, size]
                                } else {
                                  newSizes = currentSizes.filter(s => s !== size)
                                }
                                setEditFormData(prev => ({
                                  ...prev,
                                  sizes: JSON.stringify(newSizes)
                                }))
                              }}
                              checked={JSON.parse(editFormData.sizes || '[]').includes(size)}
                              className='hidden'
                            />
                            <span className='text-sm font-medium'>{size}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className='flex items-center gap-3'>
                    <label className='flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        name='bestseller'
                        checked={editFormData.bestseller}
                        onChange={handleEditFormChange}
                        className='w-5 h-5 rounded border-gray-500 text-indigo-600 focus:ring-indigo-500 bg-white/10'
                      />
                      <span className='ml-3 text-white font-medium'>Mark as Bestseller</span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className='block text-gray-300 mb-2 font-medium'>Description</label>
                  <textarea
                    name='description'
                    value={editFormData.description}
                    onChange={handleEditFormChange}
                    rows='4'
                    className='w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-500 border border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all duration-200 resize-none'
                    required
                  />
                </div>

                {/* Image Uploads */}
                <div>
                  <label className='block text-gray-300 mb-4 font-medium'>
                    Product Images 
                    <span className='text-gray-500 text-sm font-normal ml-2'>(Leave empty to keep current images)</span>
                  </label>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} className='text-center'>
                        <div className='w-full h-28 bg-white/5 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center mb-2 overflow-hidden'>
                          {imageFiles[`image${num}`] ? (
                            <img
                              src={URL.createObjectURL(imageFiles[`image${num}`])}
                              alt={`Preview ${num}`}
                              className='w-full h-full object-cover'
                            />
                          ) : editingProduct[`image${num}`] ? (
                            <img
                              src={editingProduct[`image${num}`]}
                              alt={`Current ${num}`}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='text-center p-4'>
                              <FaUpload className='text-2xl text-gray-500 mx-auto mb-1' />
                              <p className='text-xs text-gray-500'>Image {num}</p>
                            </div>
                          )}
                        </div>
                        <input
                          type='file'
                          accept='image/*'
                          onChange={(e) => handleImageChange(e, `image${num}`)}
                          className='w-full text-xs text-gray-400 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer'
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col md:flex-row gap-3 md:pt-4'>
                  <button
                    type='submit'
                    disabled={loading}
                    className='flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                  >
                    {loading ? (
                      <>
                        <div className='animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent'></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaCheck /> Update Product
                      </>
                    )}
                  </button>
                  <button
                    type='button'
                    onClick={closeEditModal}
                    className='flex-1 bg-white/10 hover:bg-white/20 text-white py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2'
                  >
                    <FaTimesCircle /> Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Lists
