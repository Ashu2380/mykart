import React, { useContext } from 'react'
import { shopDataContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { FaStar } from 'react-icons/fa'

function Card({name , image , id , price, discount = 0, category, bestseller, sizes}) {
    let {currency} = useContext(shopDataContext)
    let navigate = useNavigate()

    let discountedPrice = discount > 0 ? price - (price * discount / 100) : price

  return (
    <div 
        className='bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer'
        onClick={()=>navigate(`/productdetail/${id}`)}
    >
        {/* Image */}
        <div className='relative h-48 bg-gray-100 overflow-hidden'>
            <img 
                src={image || '/placeholder-image.png'} 
                alt={name || 'Product'} 
                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' 
            />
            {/* Badges */}
            <div className='absolute top-2 left-2 flex flex-col gap-1'>
                {bestseller && (
                    <span className='bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1'>
                        <FaStar className='text-[8px]' /> Bestseller
                    </span>
                )}
                {discount > 0 && (
                    <span className='bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full'>
                        {discount}% OFF
                    </span>
                )}
            </div>
        </div>
        
        {/* Content */}
        <div className='p-3'>
            {category && (
                <span className='text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg'>
                    {category}
                </span>
            )}
            
            <h3 className='text-gray-800 text-sm font-semibold mt-2 line-clamp-2 group-hover:text-blue-600 transition-colors'>
                {name || 'Unnamed Product'}
            </h3>
            
            {sizes && sizes.length > 0 && (
                <div className='mt-2 flex flex-wrap gap-1'>
                    {sizes.slice(0, 4).map((size, idx) => (
                        <span key={idx} className='text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded'>
                            {size}
                        </span>
                    ))}
                </div>
            )}
            
            <div className='flex items-center gap-2 mt-2'>
              {discount > 0 ? (
                <>
                  <span className='text-gray-400 text-xs line-through'>{currency}{price}</span>
                  <span className='text-green-600 text-base font-bold'>{currency}{discountedPrice.toFixed(0)}</span>
                </>
              ) : (
                <span className='text-gray-800 text-base font-semibold'>{currency}{price}</span>
              )}
            </div>
        </div>
    </div>
  )
}

export default Card
