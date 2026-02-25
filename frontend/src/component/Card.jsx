import React, { useContext } from 'react'
import { shopDataContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'

function Card({name , image , id , price, discount = 0}) {
    let {currency} = useContext(shopDataContext)
    let navigate = useNavigate()

    const discountedPrice = discount > 0 ? price - (price * discount / 100) : price

  return (
    <div className='card-container' onClick={()=>navigate(`/productdetail/${id}`)}>
        <img src={image || '/placeholder-image.png'} alt={name || 'Product'} className='w-[100%] h-[80%] rounded-sm object-cover '/>
        <div className='text-gray-800 text-[18px] py-[10px]'>{name || 'Unnamed Product'}</div>
        <div className='flex items-center gap-2'>
          {discount > 0 ? (
            <>
              <div className='text-gray-500 text-[14px] line-through'>{currency} {price}</div>
              <div className='text-green-400 text-[16px] font-semibold'>{currency} {discountedPrice.toFixed(2)}</div>
              <div className='bg-red-500 text-white text-[10px] px-2 py-1 rounded-full'>{discount}% OFF</div>
            </>
          ) : (
            <div className='text-gray-800 text-[14px] '>{currency} {price}</div>
          )}
        </div>

    </div>
  )
}

export default Card
