import React, { useContext, useState } from 'react';
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
  let { serverUrl } = useContext(authDataContext);
  let { adminData } = useContext(adminDataContext);

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


  // Enhanced category and subcategory mappings with requirements
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

  // Check if RAM/ROM should be shown
  const shouldShowRamRom = () => {
    return category === 'Electronics' && (subCategory === 'Phones' || subCategory === 'Laptops' || subCategory === 'Tablets');
  }

  // Product requirements based on category
  const getProductRequirements = (category, subCategory) => {
    const requirements = {
      'Clothes': {
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        mandatory: ['sizes'],
        optional: ['video']
      },
      'Electronics': {
        sizes: [],
        mandatory: [],
        optional: ['video']
      },
      'Home & Kitchen': {
        sizes: [],
        mandatory: [],
        optional: ['video']
      },
      'Beauty & Health': {
        sizes: [],
        mandatory: [],
        optional: ['video']
      },
      'Sports & Outdoors': {
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        mandatory: [],
        optional: ['sizes', 'video']
      },
      'Books & Media': {
        sizes: [],
        mandatory: [],
        optional: ['video']
      },
      'Toys & Games': {
        sizes: [],
        mandatory: [],
        optional: ['video']
      }
    }
    return requirements[category] || { sizes: [], mandatory: [], optional: [] };
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
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL'] // Default for clothes
    } else if (category === 'Electronics') {
      return [] // No sizes for electronics
    } else if (category === 'Home & Kitchen') {
      return [] // No sizes for home items
    } else if (category === 'Beauty & Health') {
      return [] // No sizes for beauty products
    } else if (category === 'Sports & Outdoors') {
      return ['S', 'M', 'L', 'XL', 'XXL'] // Sizes for sports & outdoors
    } else if (category === 'Books & Media') {
      return [] // No sizes for books
    } else if (category === 'Toys & Games') {
      return [] // No sizes for toys
    }
    return ['S', 'M', 'L', 'XL'] // Default sizes
  }

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value
    setCategory(newCategory)
    setSubCategory('') // Reset subcategory when category changes
    setSizes([]) // Reset sizes when category changes
    setRam('') // Reset RAM when category changes
    setRom('') // Reset ROM when category changes
  }

  const handleAddProduct = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      console.log('Starting product addition...');
      console.log('Form data:', { name, description, price, category, subCategory, bestseller, sizes, ram, rom });

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

      console.log('Sending request to:', serverUrl + "/api/product/addproduct");

      let result = await axios.post(serverUrl + "/api/product/addproduct", formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Response:', result.data);
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

    } catch (error) {
      console.error('Error adding product:', error);
      console.error('Error response:', error.response?.data);
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
    <div className='w-full min-h-[100vh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-[black] overflow-x-hidden relative'>
      <Nav />
      <Sidebar />
      <div className='w-[82%] h-[100%] flex items-center justify-start overflow-x-hidden absolute right-0 bottom-[5%]'>
        <form action="" onSubmit={handleAddProduct} className='w-[100%] md:w-[90%] h-[100%] mt-[70px] flex flex-col gap-[20px] md:gap-[30px] py-[20px] md:py-[90px] px-[20px] md:px-[60px]'>
          <div className='w-full md:w-auto text-[20px] md:text-[40px] text-gray-800 font-bold animate-fade-in'>Add New Product</div>
          <div className='w-full h-auto min-h-[200px] flex items-start justify-center flex-col mt-[20px] gap-[15px] animate-slide-up bg-white/60 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-gray-200'>
            <div className='flex items-center justify-between w-full'>
              <p className='text-[20px] md:text-[25px] font-semibold text-gray-800'> Upload Product Images</p>
              <label htmlFor="bulkUpload" className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg'>
                Bulk Upload
                <input type="file" id='bulkUpload' hidden multiple accept="image/*" onChange={(e) => handleBulkUpload(e.target.files)} />
              </label>
            </div>
            <p className='text-gray-600 text-sm'>Upload up to 4 images (optional). You can select multiple files at once or upload individually.</p>
            <div className='w-[100%] flex items-center justify-start gap-2 sm:gap-3 md:gap-4 flex-wrap max-w-full overflow-hidden'>
              <label htmlFor="image1" className='w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-lg group relative shrink-0'>
                <img src={!image1 ? upload : URL.createObjectURL(image1)} alt="" className='w-full h-full rounded-lg shadow-md border-2 border-gray-300 group-hover:border-blue-500 transition-all duration-300 object-cover' />
                <div className='absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg'></div>
                <div className='absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-[8px] sm:text-[10px] md:text-xs font-bold'>1</div>
                <input type="file" id='image1' hidden accept="image/*" onChange={(e) => setImage1(e.target.files[0])} />
              </label>
              <label htmlFor="image2" className='w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-green-500 transition-all duration-300 hover:scale-105 hover:shadow-lg group relative shrink-0'>
                <img src={!image2 ? upload : URL.createObjectURL(image2)} alt="" className='w-full h-full rounded-lg shadow-md border-2 border-gray-300 group-hover:border-green-500 transition-all duration-300 object-cover' />
                <div className='absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg'></div>
                <div className='absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-[8px] sm:text-[10px] md:text-xs font-bold'>2</div>
                <input type="file" id='image2' hidden accept="image/*" onChange={(e) => setImage2(e.target.files[0])} />
              </label>
              <label htmlFor="image3" className='w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-lg group relative shrink-0'>
                <img src={!image3 ? upload : URL.createObjectURL(image3)} alt="" className='w-full h-full rounded-lg shadow-md border-2 border-gray-300 group-hover:border-purple-500 transition-all duration-300 object-cover' />
                <div className='absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg'></div>
                <div className='absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-[8px] sm:text-[10px] md:text-xs font-bold'>3</div>
                <input type="file" id='image3' hidden accept="image/*" onChange={(e) => setImage3(e.target.files[0])} />
              </label>
              <label htmlFor="image4" className='w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-orange-500 transition-all duration-300 hover:scale-105 hover:shadow-lg group relative shrink-0'>
                <img src={!image4 ? upload : URL.createObjectURL(image4)} alt="" className='w-full h-full rounded-lg shadow-md border-2 border-gray-300 group-hover:border-orange-500 transition-all duration-300 object-cover' />
                <div className='absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg'></div>
                <div className='absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-[8px] sm:text-[10px] md:text-xs font-bold'>4</div>
                <input type="file" id='image4' hidden accept="image/*" onChange={(e) => setImage4(e.target.files[0])} />
              </label>
            </div>
           
          </div>

          <div className='w-full h-auto min-h-[120px] flex items-start justify-center flex-col mt-[20px] gap-[10px] animate-slide-up bg-white/60 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-gray-200'>
            <p className='text-[20px] md:text-[25px] font-semibold text-gray-800'>Upload Product Video (Optional)</p>
            <div className='w-[100%] flex items-center justify-center gap-4'>
              <label htmlFor="videoUpload" className='w-[120px] h-[80px] cursor-pointer hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-lg group relative bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center justify-center'>
                {!video ? (
                  <div className='text-center'>
                    <div className='text-2xl text-gray-500 mb-1'></div>
                    <div className='text-xs text-gray-500'>Upload Video</div>
                  </div>
                ) : (
                  <div className='text-center'>
                    <div className='text-2xl text-green-500 mb-1'>✅</div>
                    <div className='text-xs text-gray-700 font-medium'>Video Added</div>
                  </div>
                )}
                <div className='absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg'></div>
                <input type="file" id='videoUpload' hidden accept="video/*" onChange={(e) => setVideo(e.target.files[0])} />
              </label>
              {video && (
                <div className='flex flex-col gap-2'>
                  <p className='text-sm text-gray-700 font-medium'>Selected: {video.name}</p>
                  <p className='text-xs text-gray-500'>Size: {(video.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              )}
            </div>
            <div className='text-center text-sm text-gray-500 mt-2'>
              💡 Supported formats: MP4, MOV, AVI (Max 100MB)
            </div>
          </div>
          <div className='w-full h-auto flex items-start justify-center flex-col gap-[10px]'>
            <p className='text-[20px] md:text-[25px] font-semibold text-gray-800'> Product Name</p>
            <input type="text" placeholder='Enter product name' className='w-full h-[50px] rounded-xl hover:border-blue-500 border-2 border-gray-300 cursor-pointer bg-white px-[20px] text-[18px] text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:shadow-lg font-medium' onChange={(e) => setName(e.target.value)} value={name} required />
          </div>
          <div className='w-full flex items-start justify-start flex-col gap-[10px]'>
            <p className='text-[20px] md:text-[25px] font-semibold text-gray-800'> Product Description</p>
            <textarea type="text" placeholder='Describe your product in detail' className='w-full h-[120px] rounded-xl hover:border-blue-500 border-2 border-gray-300 cursor-pointer bg-white px-[20px] py-[15px] text-[18px] text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 resize-none hover:shadow-lg font-medium' onChange={(e) => setDescription(e.target.value)} value={description} required />
          </div>
          <div className='w-full flex items-center gap-[10px] flex-wrap'>
            <div className='md:w-[30%] w-[100%] flex items-start sm:justify-center flex-col gap-[10px]'>
              <p className='text-[20px] md:text-[25px] font-semibold w-[100%] text-gray-800'> Product Category</p>
              <select name="" id="" className='bg-white w-full px-[15px] py-[12px] rounded-xl hover:border-blue-500 border-2 border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:shadow-lg font-medium text-lg' onChange={handleCategoryChange} value={category}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className='md:w-[30%] w-[100%] flex items-start sm:justify-center flex-col gap-[10px]'>
              <p className='text-[20px] md:text-[25px] font-semibold w-[100%] text-gray-800'> Sub-Category</p>
              <select name="" id="" className='bg-white w-full px-[15px] py-[12px] rounded-xl hover:border-blue-500 border-2 border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:shadow-lg font-medium text-lg' onChange={(e) => setSubCategory(e.target.value)} value={subCategory}>
                <option value="">Select Sub-Category</option>
                {category && subcategories[category]?.map(subcat => (
                  <option key={subcat} value={subcat}>{subcat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className='w-full flex items-center gap-[10px] flex-wrap'>
            <div className='md:w-[30%] w-[100%] flex items-start justify-center flex-col gap-[10px]'>
              <p className='text-[20px] md:text-[25px] font-semibold text-gray-800'> Product Price</p>
              <input type="number" placeholder='₹ 2000' className='w-[100%] h-[50px] rounded-xl hover:border-blue-500 border-2 border-gray-300 cursor-pointer bg-white px-[20px] text-[18px] text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:shadow-lg font-medium' onChange={(e) => setPrice(e.target.value)} value={price} required />
            </div>
            <div className='md:w-[30%] w-[100%] flex items-start justify-center flex-col gap-[10px]'>
              <p className='text-[20px] md:text-[25px] font-semibold text-gray-800'> Discount (%)</p>
              <input type="number" placeholder='0' min="0" max="100" className='w-[100%] h-[50px] rounded-xl hover:border-blue-500 border-2 border-gray-300 cursor-pointer bg-white px-[20px] text-[18px] text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:shadow-lg font-medium' onChange={(e) => setDiscount(e.target.value)} value={discount} />
            </div>
          </div>
          {shouldShowRamRom() && (
            <div className='w-full flex items-center gap-[10px] flex-wrap'>
              <div className='md:w-[30%] w-[100%] flex items-start justify-center flex-col gap-[10px]'>
                <p className='text-[20px] md:text-[25px] font-semibold text-gray-800'> RAM (GB)</p>
                <input type="number" placeholder='8' className='w-[100%] h-[50px] rounded-xl hover:border-blue-500 border-2 border-gray-300 cursor-pointer bg-white px-[20px] text-[18px] text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:shadow-lg font-medium' onChange={(e) => setRam(e.target.value)} value={ram} />
              </div>
              <div className='md:w-[30%] w-[100%] flex items-start justify-center flex-col gap-[10px]'>
                <p className='text-[20px] md:text-[25px] font-semibold text-gray-800'> ROM (GB)</p>
                <input type="number" placeholder='128' className='w-[100%] h-[50px] rounded-xl hover:border-blue-500 border-2 border-gray-300 cursor-pointer bg-white px-[20px] text-[18px] text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 hover:shadow-lg font-medium' onChange={(e) => setRom(e.target.value)} value={rom} />
              </div>
            </div>
          )}
          {getSizeOptions(category, subCategory).length > 0 && (
            <div className='w-full h-auto min-h-[100px] flex items-start justify-center flex-col gap-[10px] py-[10px] md:py-[0px]'>
              <p className='text-[20px] md:text-[25px] font-semibold text-gray-800'> Product Sizes</p>
              <div className='flex items-center justify-start gap-[15px] flex-wrap'>
                {getSizeOptions(category, subCategory).map(size => (
                  <div
                    key={size}
                    className={`px-[25px] py-[12px] rounded-xl bg-white text-[18px] hover:border-blue-500 border-2 border-gray-300 cursor-pointer text-gray-800 hover:bg-blue-50 transition-all duration-300 hover:scale-110 hover:shadow-lg font-bold ${sizes.includes(size) ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500 scale-110 shadow-lg" : ""}`}
                    onClick={() => setSizes(prev => prev.includes(size) ? prev.filter(item => item !== size) : [...prev, size])}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='w-full flex items-center justify-start gap-[10px] mt-[20px]'>
            <input type="checkbox" id='checkbox' className='w-[25px] h-[25px] cursor-pointer accent-blue-500 hover:scale-110 transition-transform duration-200 rounded-md' onChange={() => setBestSeller(prev => !prev)} />
            <label htmlFor="checkbox" className='text-[18px] md:text-[22px] font-semibold text-gray-800'> Add to BestSeller</label>
          </div>
          <button className='w-full md:w-[180px] px-[20px] md:px-[30px] py-[15px] md:py-[20px] rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex items-center justify-center gap-[10px] text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 active:scale-95 font-bold text-lg'>{loading ? <Loading /> : "Add Product"}</button>
        </form>
      </div>
    </div>
  );
}

export default Add;
