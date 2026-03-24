import React, { useContext } from 'react'
import { shopDataContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { FaStar } from 'react-icons/fa'

function ListCard({name , image , id , price, discount = 0, category, subCategory, bestseller, sizes}) {
    let {currency} = useContext(shopDataContext)
    let navigate = useNavigate()

    let discountedPrice = discount > 0 ? price - (price * discount / 100) : price

  return (
    <div 
      className='bg-white rounded-xl shadow-sm hover:shadow-md transition p-3 flex gap-4 border border-gray-100 cursor-pointer'
      onClick={() => navigate(`/productdetail/${id}`)}
    >
        {/* Image */}
        <div className='w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100'>
            <img 
                src={image || '/placeholder-image.png'} 
                className='w-full h-full object-cover' 
                alt={name || 'Product'} 
            />
        </div>
        
        {/* Content */}
        <div className='flex-1 flex flex-col justify-between py-1'>
            <div>
                <div className='flex items-center gap-2 mb-1'>
                    <h3 className='font-semibold text-gray-800 line-clamp-1'>
                        {name || 'Unnamed Product'}
                    </h3>
                    {bestseller && (
                        <span className='bg-yellow-400 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5'>
                            <FaStar className='text-[8px]' /> Best
                        </span>
                    )}
                </div>
                <div className='flex items-center gap-2 text-xs text-gray-500'>
                    {category && (
                        <span className='px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded'>
                            {category}
                        </span>
                    )}
                    {subCategory && <span>/ {subCategory}</span>}
                </div>
            </div>
            
            <div className='flex items-center justify-between mt-1'>
                <div className='flex items-center gap-2'>
                    <span className='text-lg font-bold text-gray-900'>
                        {currency}{discountedPrice.toFixed(0)}
                    </span>
                    {discount > 0 && (
                        <>
                            <span className='text-sm text-gray-400 line-through'>
                                {currency}{price}
                            </span>
                            <span className='text-xs text-red-500 font-medium'>
                                {discount}% OFF
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

export default ListCard
