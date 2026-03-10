import React, { useContext, useState } from 'react'
import { shopDataContext } from '../context/ShopContext'
import { authDataContext } from '../context/authContext'
import Title from './Title'
import axios from 'axios'
import { toast } from 'react-toastify'

function CartTotal() {
    const {currency , delivery_fee , getCartAmount} = useContext(shopDataContext)
    const {serverUrl} = useContext(authDataContext)
    const [couponCode, setCouponCode] = useState("")
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [discount, setDiscount] = useState(0)
    const [applying, setApplying] = useState(false)

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error("Please enter a coupon code")
            return
        }

        setApplying(true)
        try {
            const orderAmount = getCartAmount()
            const result = await axios.post(serverUrl + "/api/coupon/validate", {
                code: couponCode,
                orderAmount
            })

            if (result.data.valid) {
                setAppliedCoupon(result.data.coupon)
                setDiscount(result.data.discount)
                toast.success(`Coupon applied! You save ${currency}${result.data.discount}`)
            }
        } catch (error) {
            console.error("Coupon error:", error)
            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error("Invalid coupon code")
            }
            setAppliedCoupon(null)
            setDiscount(0)
        } finally {
            setApplying(false)
        }
    }

    const handleRemoveCoupon = () => {
        setCouponCode("")
        setAppliedCoupon(null)
        setDiscount(0)
        toast.info("Coupon removed")
    }

    const subtotal = getCartAmount()
    const total = subtotal === 0 ? 0 : subtotal + delivery_fee - discount

  return (
    <div className='w-full lg:ml-[30px]'>
        <div className='text-xl py-[10px]'>
        <Title text1={'CART'} text2={'TOTALS'}/>
      </div>
      <div className='flex flex-col gap-2 mt-2 text-sm p-[30px] border-[2px] border-gray-300 bg-white'>
       <div className='flex justify-between text-gray-800 text-[18px] p-[10px]'>
          <p >Subtotal</p>
          <p>{currency} {subtotal}.00</p>
        </div>
        <hr/>
         <div className='flex justify-between text-gray-800 text-[18px] p-[10px]'>
          <p>Shipping Fee</p>
          <p>{currency} {delivery_fee}</p>
        </div>
        {discount > 0 && (
            <>
            <hr/>
            <div className='flex justify-between text-green-600 text-[18px] p-[10px]'>
                <p>Coupon Discount ({appliedCoupon?.code})</p>
                <p>-{currency} {discount}.00</p>
            </div>
            </>
        )}
        <hr/>
        <div className='flex justify-between text-gray-800 text-[18px] p-[10px]'>
          <b>Total</b>
          <b>{currency} {total > 0 ? total : 0}.00</b>
        </div>

      </div>

      {/* Coupon Section */}
      <div className='mt-4 p-4 border-2 border-gray-300 bg-white rounded-xl'>
        {appliedCoupon ? (
            <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                    <span className='px-3 py-1 bg-green-100 text-green-700 rounded-lg font-medium'>
                        {appliedCoupon.code}
                    </span>
                    <span className='text-green-600 font-medium'>
                        - {currency}{discount} OFF
                    </span>
                </div>
                <button 
                    onClick={handleRemoveCoupon}
                    className='text-red-500 hover:text-red-700 text-sm font-medium'
                >
                    Remove
                </button>
            </div>
        ) : (
            <div className='flex flex-col gap-2'>
                <p className='text-gray-700 font-medium'>Apply Coupon</p>
                <div className='flex gap-2'>
                    <input 
                        type="text" 
                        placeholder='Enter coupon code'
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className='flex-1 h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <button 
                        onClick={handleApplyCoupon}
                        disabled={applying}
                        className='px-4 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50'
                    >
                        {applying ? '...' : 'Apply'}
                    </button>
                </div>
            </div>
        )}
      </div>
      
    </div>
  )
}

export default CartTotal
