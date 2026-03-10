import React, { useContext, useState, useEffect } from 'react';
import Nav from '../component/Nav';
import Sidebar from '../component/Sidebar';
import { authDataContext } from '../context/AuthContext';
import { adminDataContext } from '../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../component/Loading';

function Coupons() {
  let { serverUrl } = useContext(authDataContext);
  let { adminData } = useContext(adminDataContext);
  
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Form state
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage"); // percentage or fixed
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Fetch coupons
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setFetching(true);
      const result = await axios.get(serverUrl + "/api/coupon/getallcoupons", {
        withCredentials: true
      });
      if (result.data) {
        setCoupons(result.data);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!couponCode || !discountValue || !validFrom || !validUntil) {
        toast.error("Please fill all required fields");
        setLoading(false);
        return;
      }

      const couponData = {
        code: couponCode.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validFrom,
        validUntil,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        description,
        isActive
      };

      const result = await axios.post(serverUrl + "/api/coupon/create", couponData, {
        withCredentials: true
      });

      if (result.data) {
        toast.success("Coupon created successfully!");
        fetchCoupons();
        resetForm();
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create coupon");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    
    try {
      const result = await axios.delete(serverUrl + `/api/coupon/deletecoupon/${couponId}`, {
        withCredentials: true
      });
      
      if (result.data) {
        toast.success("Coupon deleted successfully!");
        fetchCoupons();
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon");
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const result = await axios.put(serverUrl + `/api/coupon/updatecoupon/${coupon._id}`, {
        isActive: !coupon.isActive
      }, {
        withCredentials: true
      });
      
      if (result.data) {
        toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'} successfully!`);
        fetchCoupons();
      }
    } catch (error) {
      console.error("Error toggling coupon:", error);
      toast.error("Failed to update coupon");
    }
  };

  const resetForm = () => {
    setCouponCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinOrderAmount("");
    setMaxDiscount("");
    setValidFrom("");
    setValidUntil("");
    setUsageLimit("");
    setDescription("");
    setIsActive(true);
  };

  // Generate random coupon code
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "SAVE";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponCode(code);
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
        <div className='w-full h-full flex flex-col gap-6 py-4 px-4 md:px-8'>
          
          {/* Header */}
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <div>
              <h1 className='text-2xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'>
                Coupons & Offers
              </h1>
              <p className='text-gray-500 mt-1'>Create and manage discount coupons for your customers</p>
            </div>
            <div className='flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md'>
              <span className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse'></span>
              <span className='text-sm text-gray-600'>{coupons.length} active coupons</span>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Create Coupon Form */}
            <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center'>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className='text-xl font-semibold text-gray-800'>Create New Coupon</h2>
                  <p className='text-sm text-gray-500'>Fill details to create a new discount coupon</p>
                </div>
              </div>

              <form onSubmit={handleCreateCoupon} className='space-y-4'>
                {/* Coupon Code */}
                <div>
                  <label className='block text-gray-700 font-medium mb-2'>Coupon Code <span className='text-red-500'>*</span></label>
                  <div className='flex gap-2'>
                    <input 
                      type="text" 
                      placeholder='e.g., SUMMER20' 
                      className='flex-1 h-12 rounded-xl border-2 border-gray-300 px-4 text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all duration-300 uppercase' 
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                      value={couponCode}
                      required
                    />
                    <button 
                      type="button"
                      onClick={generateCode}
                      className='px-4 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all'
                    >
                      Generate
                    </button>
                  </div>
                </div>

                {/* Discount Type and Value */}
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-gray-700 font-medium mb-2'>Discount Type</label>
                    <select 
                      className='w-full h-12 rounded-xl border-2 border-gray-300 px-4 text-gray-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 bg-white'
                      onChange={(e) => setDiscountType(e.target.value)}
                      value={discountType}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-gray-700 font-medium mb-2'>Discount Value <span className='text-red-500'>*</span></label>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
                        {discountType === 'percentage' ? '%' : '₹'}
                      </span>
                      <input 
                        type="number" 
                        placeholder={discountType === 'percentage' ? '20' : '500'} 
                        className='w-full h-12 rounded-xl border-2 border-gray-300 pl-8 pr-4 text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all duration-300' 
                        onChange={(e) => setDiscountValue(e.target.value)} 
                        value={discountValue}
                        min="0"
                        max={discountType === "percentage" ? "100" : undefined}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Min Order Amount and Max Discount */}
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-gray-700 font-medium mb-2'>Min Order Amount (₹)</label>
                    <input 
                      type="number" 
                      placeholder='500' 
                      className='w-full h-12 rounded-xl border-2 border-gray-300 px-4 text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all duration-300' 
                      onChange={(e) => setMinOrderAmount(e.target.value)} 
                      value={minOrderAmount}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className='block text-gray-700 font-medium mb-2'>Max Discount (₹)</label>
                    <input 
                      type="number" 
                      placeholder='1000' 
                      className='w-full h-12 rounded-xl border-2 border-gray-300 px-4 text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all duration-300' 
                      onChange={(e) => setMaxDiscount(e.target.value)} 
                      value={maxDiscount}
                      min="0"
                    />
                  </div>
                </div>

                {/* Valid From and Until */}
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-gray-700 font-medium mb-2'>Valid From <span className='text-red-500'>*</span></label>
                    <input 
                      type="date" 
                      className='w-full h-12 rounded-xl border-2 border-gray-300 px-4 text-gray-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all duration-300' 
                      onChange={(e) => setValidFrom(e.target.value)} 
                      value={validFrom}
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-gray-700 font-medium mb-2'>Valid Until <span className='text-red-500'>*</span></label>
                    <input 
                      type="date" 
                      className='w-full h-12 rounded-xl border-2 border-gray-300 px-4 text-gray-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all duration-300' 
                      onChange={(e) => setValidUntil(e.target.value)} 
                      value={validUntil}
                      required
                    />
                  </div>
                </div>

                {/* Usage Limit */}
                <div>
                  <label className='block text-gray-700 font-medium mb-2'>Usage Limit (optional)</label>
                  <input 
                    type="number" 
                    placeholder='100' 
                    className='w-full h-12 rounded-xl border-2 border-gray-300 px-4 text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all duration-300' 
                    onChange={(e) => setUsageLimit(e.target.value)} 
                    value={usageLimit}
                    min="1"
                  />
                  <p className='text-xs text-gray-500 mt-1'>Leave empty for unlimited usage</p>
                </div>

                {/* Description */}
                <div>
                  <label className='block text-gray-700 font-medium mb-2'>Description</label>
                  <textarea 
                    placeholder='Summer sale discount coupon' 
                    className='w-full h-20 rounded-xl border-2 border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all duration-300 resize-none' 
                    onChange={(e) => setDescription(e.target.value)} 
                    value={description}
                  />
                </div>

                {/* Active Toggle */}
                <div className='flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100'>
                  <input 
                    type="checkbox" 
                    id='isActive'
                    className='w-5 h-5 cursor-pointer accent-emerald-500 rounded-md'
                    onChange={() => setIsActive(!isActive)}
                    checked={isActive}
                  />
                  <label htmlFor="isActive" className='flex-1 cursor-pointer'>
                    <p className='text-gray-800 font-medium'>Activate immediately</p>
                    <p className='text-sm text-gray-500'>Customers can use this coupon when active</p>
                  </label>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className='w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 flex items-center justify-center gap-2 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 font-bold'
                >
                  {loading ? <Loading /> : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Coupon
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Coupons List */}
            <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center'>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div>
                  <h2 className='text-xl font-semibold text-gray-800'>Existing Coupons</h2>
                  <p className='text-sm text-gray-500'>Manage your created coupons</p>
                </div>
              </div>

              {fetching ? (
                <div className='flex items-center justify-center py-12'>
                  <Loading />
                </div>
              ) : coupons.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                  <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <p className='text-lg font-medium'>No coupons yet</p>
                  <p className='text-sm'>Create your first coupon to get started</p>
                </div>
              ) : (
                <div className='space-y-4 max-h-[600px] overflow-y-auto pr-2'>
                  {coupons.map((coupon) => (
                    <div 
                      key={coupon._id}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        coupon.isActive 
                          ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-white' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <div className='flex items-center gap-2'>
                            <span className='text-lg font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg'>
                              {coupon.code}
                            </span>
                            {coupon.isActive ? (
                              <span className='px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full'>
                                Active
                              </span>
                            ) : (
                              <span className='px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full'>
                                Inactive
                              </span>
                            )}
                          </div>
                          {coupon.description && (
                            <p className='text-sm text-gray-500 mt-1'>{coupon.description}</p>
                          )}
                        </div>
                        <div className='text-right'>
                          <p className='text-xl font-bold text-emerald-600'>
                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                          </p>
                          <p className='text-xs text-gray-500'>discount</p>
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-2 text-sm mb-3'>
                        <div>
                          <p className='text-gray-500'>Min Order</p>
                          <p className='font-medium'>₹{coupon.minOrderAmount || 0}</p>
                        </div>
                        {coupon.maxDiscount && (
                          <div>
                            <p className='text-gray-500'>Max Discount</p>
                            <p className='font-medium'>₹{coupon.maxDiscount}</p>
                          </div>
                        )}
                        <div>
                          <p className='text-gray-500'>Valid Until</p>
                          <p className='font-medium'>{new Date(coupon.validUntil).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className='text-gray-500'>Usage</p>
                          <p className='font-medium'>{coupon.usageCount || 0} / {coupon.usageLimit || '∞'}</p>
                        </div>
                      </div>

                      <div className='flex gap-2'>
                        <button 
                          onClick={() => handleToggleActive(coupon)}
                          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
                            coupon.isActive 
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          }`}
                        >
                          {coupon.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className='px-4 py-2 rounded-lg font-medium text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-all'
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Coupons;
