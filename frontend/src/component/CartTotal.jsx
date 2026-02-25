import React, { useContext } from 'react'
import { shopDataContext } from '../context/ShopContext'
import Title from './Title'

function CartTotal() {
    const {currency , delivery_fee , getCartAmount} = useContext(shopDataContext)
  return (
    <div className='w-full lg:ml-[30px]'>
        <div className='text-xl py-[10px]'>
        <Title text1={'CART'} text2={'TOTALS'}/>
      </div>
      <div className='flex flex-col gap-2 mt-2 text-sm p-[30px] border-[2px] border-gray-300 bg-white'>
       <div className='flex justify-between text-gray-800 text-[18px] p-[10px]'>
          <p >Subtotal</p>
          <p>{currency} {getCartAmount()}.00</p>
        </div>
        <hr/>
         <div className='flex justify-between text-gray-800 text-[18px] p-[10px]'>
          <p>Shipping Fee</p>
          <p>{currency} {delivery_fee}</p>
        </div>
        <hr/>
        <div className='flex justify-between text-gray-800 text-[18px] p-[10px]'>
          <b>Total</b>
          <b>{currency} {getCartAmount()=== 0 ? 0 :getCartAmount() + delivery_fee}</b>
        </div>

      </div>
      
    </div>
  )
}

export default CartTotal
