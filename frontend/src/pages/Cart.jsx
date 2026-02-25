import React, { useContext, useEffect, useState } from 'react'
import Title from '../component/Title'
import { shopDataContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { RiDeleteBin6Line } from "react-icons/ri";
import CartTotal from '../component/CartTotal';

function Cart() {
    const { products, currency, cartItem ,updateQuantity } = useContext(shopDataContext)
  const [cartData, setCartData] = useState([])
  const navigate = useNavigate()


  useEffect(() => {
    const tempData = [];
    for (const itemId in cartItem) {
      for (const size in cartItem[itemId]) {
        if (cartItem[itemId][size] > 0) {
          tempData.push({
            _id: itemId,
            size: size,
            quantity: cartItem[itemId][size]
          });
        }
      }
    }
    setCartData(tempData);
  }, [cartItem]);
  return (
    <div className='w-[99vw] min-h-[100vh] p-4 md:p-5 lg:p-[20px] overflow-hidden bg-blue-50 pt-24 md:pt-20 lg:pt-24'>
      <div className='h-[8%] w-[100%] text-center'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      <div className='w-[100%] h-[92%] flex flex-wrap gap-[20px]'>
        {
         cartData.map((item,index)=>{
             const productData = products.find((product) => product._id === item._id);
             
             // Check if productData exists before rendering
             if (!productData) return null;
             
             return (
              <div key={index} className='w-[100%] h-[10%] border-t border-b mb-4'>
                <div className='w-[100%] h-[80%] flex items-start gap-6 bg-white py-[15px] px-[25px] rounded-2xl relative shadow-lg hover:bg-gray-50 transition-all duration-300'>
                    <div className='relative'>
                      <img className='w-[100px] h-[100px] rounded-md object-cover'
                        src={productData.image1 || "https://i.ibb.co/Qf5mGFZ/water-heater.jpg"}
                        alt={productData.name}
                      />
                    </div>
                    <div className='flex items-start justify-center flex-col gap-[10px]'>
                    <p className='md:text-[25px] text-[20px] text-gray-800 font-semibold'>{productData.name}</p>
                    <div className='flex items-center gap-[20px]'>
                      <p className='text-[20px] text-blue-600 font-bold'>{currency} {productData.price}</p>
                      <p className='w-[40px] h-[40px] text-[16px] text-gray-800
                      bg-gray-200 rounded-md mt-[5px] flex items-center justify-center border-[1px] border-gray-300'>{item.size}</p>
                </div>
                </div>
                <input type="number" min={1} defaultValue={item.quantity} className='md:max-w-20 max-w-10 md:px-2 md:py-2 py-[5px] px-[10px] text-gray-800 text-[18px] font-semibold bg-white absolute md:top-[40%] top-[46%] left-[75%] md:left-[50%] border-[1px] border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'  onChange={(e)=> (e.target.value === ' ' || e.target.value === '0') ? null  :  updateQuantity(item._id,item.size,Number(e.target.value))} />

                <RiDeleteBin6Line className='text-gray-600 w-[25px] h-[25px] absolute top-[50%] md:top-[40%] md:right-[5%] right-1 hover:text-red-500 hover:scale-110 transition-all duration-300 cursor-pointer' onClick={()=>updateQuantity(item._id,item.size,0)}/>
                </div>
 
              </div>
             )
         })
        }
      </div>

      <div className='flex justify-start items-end my-20'>
        <div className='w-full sm:w-[450px]'>
            <CartTotal/>
            <button className='text-[18px] hover:bg-blue-600 cursor-pointer bg-blue-500 py-[10px] px-[50px] rounded-2xl text-white flex items-center justify-center gap-[20px]  border-[1px] border-blue-300 ml-[30px] mt-[20px]' onClick={()=>{
                if (cartData.length > 0) {
      navigate("/placeorder");
    } else {
      console.log("Your cart is empty!");
    }
            }}>
                PROCEED TO CHECKOUT
            </button>
        </div>
      </div>
      
    </div>
  )
}

export default Cart
