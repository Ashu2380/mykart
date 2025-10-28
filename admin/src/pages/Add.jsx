import React, { useContext, useState, useEffect } from 'react';
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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Clothes");
  const [price, setPrice] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [bestseller, setBestSeller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  let { serverUrl } = useContext(authDataContext);
  let { adminData } = useContext(adminDataContext);

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

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value
    setCategory(newCategory)
    setSubCategory('') // Reset subcategory when category changes
    setSizes([]) // Reset sizes when category changes
  }

  const handleAddProduct = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      console.log('Starting product addition...');
      console.log('Form data:', { name, description, price, category, subCategory, bestseller, sizes });

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
      formData.append("image1", image1);
      formData.append("image2", image2);
      formData.append("image3", image3);
      formData.append("image4", image4);

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
      setPrice("");
      setBestSeller(false);
      setCategory("Clothes");
      setSubCategory("");
      setSizes([]);

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
    <div className='w-[100vw] min-h-[100vh] bg-gradient-to-br from-slate-900 via-blue-950 to-teal-900 text-[white] overflow-x-hidden relative'>
      <Nav />
      <Sidebar />
      <div className='w-[82%] h-[100%] flex items-center justify-start overflow-x-hidden absolute right-0 bottom-[5%]'>
        <form action="" onSubmit={handleAddProduct} className='w-[100%] md:w-[90%] h-[100%] mt-[70px] flex flex-col gap-[30px] py-[90px] px-[30px] md:px-[60px]'>
          <div className='w-[400px] h-[50px] text-[25px] md:text-[40px] text-white'>Add Product Page</div>
          <div className='w-[80%] h-[130px] flex items-start justify-center flex-col mt-[20px] gap-[10px]'>
            <p className='text-[20px] md:text-[25px] font-semibold'>Upload Images</p>
            <div className='w-[100%] h-[100%] flex items-center justify-start'>
              <label htmlFor="image1" className='w-[65px] h-[65px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-[#46d1f7]'>
                <img src={!image1 ? upload : URL.createObjectURL(image1)} alt="" className='w-[80%] h-[80%] rounded-lg shadow-2xl hover:border-[#1d1d1d] border-[2px]' />
                <input type="file" id='image1' hidden onChange={(e) => setImage1(e.target.files[0])} />
              </label>
              <label htmlFor="image2" className='w-[65px] h-[65px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-[#46d1f7]'>
                <img src={!image2 ? upload : URL.createObjectURL(image2)} alt="" className='w-[80%] h-[80%] rounded-lg shadow-2xl hover:border-[#1d1d1d] border-[2px]' />
                <input type="file" id='image2' hidden onChange={(e) => setImage2(e.target.files[0])} />
              </label>
              <label htmlFor="image3" className='w-[65px] h-[65px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-[#46d1f7]'>
                <img src={!image3 ? upload : URL.createObjectURL(image3)} alt="" className='w-[80%] h-[80%] rounded-lg shadow-2xl hover:border-[#1d1d1d] border-[2px]' />
                <input type="file" id='image3' hidden onChange={(e) => setImage3(e.target.files[0])} />
              </label>
              <label htmlFor="image4" className='w-[65px] h-[65px] md:w-[100px] md:h-[100px] cursor-pointer hover:border-[#46d1f7]'>
                <img src={!image4 ? upload : URL.createObjectURL(image4)} alt="" className='w-[80%] h-[80%] rounded-lg shadow-2xl hover:border-[#1d1d1d] border-[2px]' />
                <input type="file" id='image4' hidden onChange={(e) => setImage4(e.target.files[0])} />
              </label>
            </div>
          </div>
          <div className='w-[80%] h-[100px] flex items-start justify-center flex-col gap-[10px]'>
            <p className='text-[20px] md:text-[25px] font-semibold'>Product Name</p>
            <input type="text" placeholder='Type here' className='w-[600px] max-w-[98%] h-[40px] rounded-lg hover:border-[#46d1f7] border-[2px] cursor-pointer bg-slate-600 px-[20px] text-[18px] placeholder:text-[#ffffffc2]' onChange={(e) => setName(e.target.value)} value={name} required />
          </div>
          <div className='w-[80%] flex items-start justify-center flex-col gap-[10px]'>
            <p className='text-[20px] md:text-[25px] font-semibold'>Product Description</p>
            <textarea type="text" placeholder='Type here' className='w-[600px] max-w-[98%] h-[100px] rounded-lg hover:border-[#46d1f7] border-[2px] cursor-pointer bg-slate-600 px-[20px] py-[10px] text-[18px] placeholder:text-[#ffffffc2]' onChange={(e) => setDescription(e.target.value)} value={description} required />
          </div>
          <div className='w-[80%] flex items-center gap-[10px] flex-wrap'>
            <div className='md:w-[30%] w-[100%] flex items-start sm:justify-center flex-col gap-[10px]'>
              <p className='text-[20px] md:text-[25px] font-semibold w-[100%]'>Product Category</p>
              <select name="" id="" className='bg-slate-600 w-[60%] px-[10px] py-[7px] rounded-lg hover:border-[#46d1f7] border-[2px]' onChange={handleCategoryChange} value={category}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className='md:w-[30%] w-[100%] flex items-start sm:justify-center flex-col gap-[10px]'>
              <p className='text-[20px] md:text-[25px] font-semibold w-[100%]'>Sub-Category</p>
              <select name="" id="" className='bg-slate-600 w-[60%] px-[10px] py-[7px] rounded-lg hover:border-[#46d1f7] border-[2px]' onChange={(e) => setSubCategory(e.target.value)} value={subCategory}>
                <option value="">Select Sub-Category</option>
                {category && subcategories[category]?.map(subcat => (
                  <option key={subcat} value={subcat}>{subcat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className='w-[80%] h-[100px] flex items-start justify-center flex-col gap-[10px]'>
            <p className='text-[20px] md:text-[25px] font-semibold'>Product Price</p>
            <input type="number" placeholder='₹ 2000' className='w-[600px] max-w-[98%] h-[40px] rounded-lg hover:border-[#46d1f7] border-[2px] cursor-pointer bg-slate-600 px-[20px] text-[18px] placeholder:text-[#ffffffc2]' onChange={(e) => setPrice(e.target.value)} value={price} required />
          </div>
          {getSizeOptions(category).length > 0 && (
            <div className='w-[80%] h-[220px] md:h-[100px] flex items-start justify-center flex-col gap-[10px] py-[10px] md:py-[0px]'>
              <p className='text-[20px] md:text-[25px] font-semibold'>Product Size</p>
              <div className='flex items-center justify-start gap-[15px] flex-wrap'>
                {getSizeOptions(category).map(size => (
                  <div
                    key={size}
                    className={`px-[20px] py-[7px] rounded-lg bg-slate-600 text-[18px] hover:border-[#46d1f7] border-[2px] cursor-pointer ${sizes.includes(size) ? "bg-green-400 text-black border-[#46d1f7]" : ""}`}
                    onClick={() => setSizes(prev => prev.includes(size) ? prev.filter(item => item !== size) : [...prev, size])}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className='w-[80%] flex items-center justify-start gap-[10px] mt-[20px]'>
            <input type="checkbox" id='checkbox' className='w-[25px] h-[25px] cursor-pointer' onChange={() => setBestSeller(prev => !prev)} />
            <label htmlFor="checkbox" className='text-[18px] md:text-[22px] font-semibold'>Add to BestSeller</label>
          </div>
          <button className='w-[140px] px-[20px] py-[20px] rounded-xl bg-[#65d8f7] flex items-center justify-center gap-[10px] text-black active:bg-slate-700 active:text-white active:border-[2px] border-white'>{loading ? <Loading /> : "Add Product"}</button>
        </form>
      </div>
    </div>
  );
}

export default Add;
