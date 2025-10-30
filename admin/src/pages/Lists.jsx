import React, { useContext, useEffect, useState } from 'react'
import Nav from '../component/Nav'
import Sidebar from '../component/Sidebar'
import { authDataContext } from '../context/AuthContext'
import { adminDataContext } from '../context/AdminContext'
import axios from 'axios'
import { FaEdit, FaTrash, FaTimes, FaUpload } from 'react-icons/fa'

function Lists() {
  let [list ,setList] = useState([])
  let [showEditModal, setShowEditModal] = useState(false)
  let [editingProduct, setEditingProduct] = useState(null)
  let [loading, setLoading] = useState(false)

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
      return [] // No sizes for electronics
    } else if (category === 'Home & Kitchen') {
      return [] // No sizes for home items
    } else if (category === 'Beauty & Health') {
      return [] // No sizes for beauty products
    } else if (category === 'Sports & Outdoors') {
      return ['S', 'M', 'L', 'XL', 'XXL']
    } else if (category === 'Books & Media') {
      return [] // No sizes for books
    } else if (category === 'Toys & Games') {
      return [] // No sizes for toys
    }
    return ['S', 'M', 'L', 'XL'] // Default sizes
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
  let {serverUrl} = useContext(authDataContext)
  let {adminData} = useContext(adminDataContext)


  const fetchList = async () => {
    try {
      let result = await axios.get(serverUrl + "/api/product/list" )
      setList(result.data)
      console.log(result.data)
    } catch (error) {
      console.log(error)
    }
    
  }

  const removeList = async (id) => {

    try {
      let result = await axios.post(`${serverUrl}/api/product/remove/${id}`,{},{withCredentials:true})

      if(result.data){
        fetchList()
      }
      else{
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
      // Reset subcategory when category changes
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
      console.log('Updating product:', editingProduct._id)
      console.log('Form data:', editFormData)

      const formData = new FormData()
      formData.append('name', editFormData.name)
      formData.append('description', editFormData.description)
      formData.append('price', editFormData.price)
      formData.append('category', editFormData.category)
      formData.append('subCategory', editFormData.subCategory)
      formData.append('sizes', editFormData.sizes)
      formData.append('bestseller', editFormData.bestseller)
      formData.append('discount', editFormData.discount)

      // Add image files if selected
      if (imageFiles.image1) formData.append('image1', imageFiles.image1)
      if (imageFiles.image2) formData.append('image2', imageFiles.image2)
      if (imageFiles.image3) formData.append('image3', imageFiles.image3)
      if (imageFiles.image4) formData.append('image4', imageFiles.image4)

      console.log('Sending request to:', `${serverUrl}/api/product/update/${editingProduct._id}`)

      const result = await axios.put(`${serverUrl}/api/product/update/${editingProduct._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      })

      console.log('Update result:', result.data)

      if (result.data) {
        fetchList()
        closeEditModal()
        alert('Product updated successfully!')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      console.error('Error response:', error.response?.data)
      alert(`Failed to update product: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    console.log('Admin data:', adminData)
    if (adminData) {
      fetchList()
    }
  },[adminData])
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
    <div className='w-[100vw] min-h-[100vh] bg-gradient-to-br from-slate-900 via-blue-950 to-teal-900 text-[white] overflow-x-hidden relative'>
      <Nav />
      <Sidebar />
      <div className='w-[82%] h-[100%] flex items-center justify-start overflow-x-hidden absolute right-0 bottom-[5%]'>
        <div className='w-[100%] md:w-[90%] h-[100%] mt-[70px] flex flex-col gap-[30px] py-[90px] px-[30px] md:px-[60px]'>
          <div className='w-[400px] h-[50px] text-[28px] md:text-[40px] mb-[20px] text-white'>All Listed Products</div>


          {
            list?.length > 0 ? (
              list.map((item,index)=>(
                <div className='w-[90%] md:h-[120px] h-auto min-h-[90px] bg-slate-600 rounded-xl flex items-center justify-start gap-[5px] md:gap-[30px] p-[10px] md:px-[30px]' key={index}>
                  <img src={item.image1} className='w-[30%] md:w-[120px] h-[90%] rounded-lg' alt="" />
                  <div className='w-[90%] h-[80%] flex flex-col items-start justify-center gap-[2px]'>

                    <div className='w-[100%] md:text-[20px] text-[15px] text-[#bef0f3]'>{item.name}</div>
                       <div className='md:text-[17px] text-[15px] text-[#bef3da]'>{item.category}</div>
                    <div className='md:text-[17px] text-[15px] text-[#bef3da]'>
                      ₹{item.price}
                      {item.discount > 0 && (
                        <span className='ml-2 text-green-400'>
                          → ₹{Math.round(item.price * (1 - item.discount / 100))}
                          <span className='text-xs text-yellow-400 ml-1'>({item.discount}% off)</span>
                        </span>
                      )}
                    </div>

                  </div>
                  <div className='w-[15%] h-[100%] bg-transparent flex items-center justify-center gap-2'>
                    <button
                      className='w-[35px] h-[30%] flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                      onClick={() => openEditModal(item)}
                      title="Edit Product"
                    >
                      <FaEdit className='text-sm' />
                    </button>
                    <button
                      className='w-[35px] h-[30%] flex items-center justify-center rounded-md md:hover:bg-red-300 md:hover:text-black cursor-pointer'
                      onClick={() => removeList(item._id)}
                      title="Delete Product"
                    >
                      <FaTrash className='text-sm' />
                    </button>
                  </div>
                 

                </div>
              ))
            )

            : (
              <div className='text-white text-lg'>No products available.</div>
            )
          }
        </div>

      </div>

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-white'>Edit Product</h2>
                <button
                  onClick={closeEditModal}
                  className='text-gray-400 hover:text-white text-2xl'
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={updateProduct} className='space-y-6'>
                {/* Basic Information */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-white mb-2'>Product Name</label>
                    <input
                      type='text'
                      name='name'
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                      className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-white mb-2'>Price (₹)</label>
                    <input
                      type='number'
                      name='price'
                      value={editFormData.price}
                      onChange={handleEditFormChange}
                      className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-white mb-2'>Discount (%)</label>
                    <input
                      type='number'
                      name='discount'
                      value={editFormData.discount}
                      onChange={handleEditFormChange}
                      min='0'
                      max='100'
                      className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                    />
                  </div>

                  <div>
                    <label className='block text-white mb-2'>Category</label>
                    <select
                      name='category'
                      value={editFormData.category}
                      onChange={handleEditFormChange}
                      className='w-full p-3 rounded-lg bg-white/20 text-white border border-gray-600 focus:border-blue-500 focus:outline-none'
                      required
                    >
                      <option value='' className='text-black'>Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category} className='text-black'>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-white mb-2'>Sub Category</label>
                    <select
                      name='subCategory'
                      value={editFormData.subCategory}
                      onChange={handleEditFormChange}
                      className='w-full p-3 rounded-lg bg-white/20 text-white border border-gray-600 focus:border-blue-500 focus:outline-none'
                      required
                    >
                      <option value='' className='text-black'>Select Sub Category</option>
                      {editFormData.category && subcategories[editFormData.category]?.map(subcategory => (
                        <option key={subcategory} value={subcategory} className='text-black'>{subcategory}</option>
                      ))}
                    </select>
                  </div>

                  {getSizeOptions(editFormData.category).length > 0 && (
                    <div>
                      <label className='block text-white mb-2'>Sizes</label>
                      <div className='flex flex-wrap gap-2'>
                        {getSizeOptions(editFormData.category).map(size => (
                          <label key={size} className='flex items-center'>
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
                              className='mr-2'
                            />
                            <span className='text-white text-sm'>{size}</span>
                          </label>
                        ))}
                      </div>
                      <p className='text-xs text-gray-400 mt-1'>
                        Selected: {JSON.parse(editFormData.sizes || '[]').join(', ') || 'None'}
                      </p>
                    </div>
                  )}

                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      name='bestseller'
                      checked={editFormData.bestseller}
                      onChange={handleEditFormChange}
                      className='mr-3'
                    />
                    <label className='text-white'>Mark as Bestseller</label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className='block text-white mb-2'>Description</label>
                  <textarea
                    name='description'
                    value={editFormData.description}
                    onChange={handleEditFormChange}
                    rows='4'
                    className='w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-gray-600 focus:border-blue-500 focus:outline-none'
                    required
                  />
                </div>

                {/* Image Uploads */}
                <div>
                  <label className='block text-white mb-4'>Product Images (Optional - leave empty to keep current images)</label>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} className='text-center'>
                        <div className='w-full h-24 bg-white/10 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center mb-2'>
                          {imageFiles[`image${num}`] ? (
                            <img
                              src={URL.createObjectURL(imageFiles[`image${num}`])}
                              alt={`Preview ${num}`}
                              className='w-full h-full object-cover rounded-lg'
                            />
                          ) : (
                            <div className='text-center'>
                              <FaUpload className='text-2xl text-gray-400 mx-auto mb-1' />
                              <p className='text-xs text-gray-400'>Image {num}</p>
                            </div>
                          )}
                        </div>
                        <input
                          type='file'
                          accept='image/*'
                          onChange={(e) => handleImageChange(e, `image${num}`)}
                          className='w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700'
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-4 pt-4'>
                  <button
                    type='submit'
                    disabled={loading}
                    className='flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {loading ? 'Updating...' : 'Update Product'}
                  </button>
                  <button
                    type='button'
                    onClick={closeEditModal}
                    className='flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors duration-300'
                  >
                    Cancel
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
