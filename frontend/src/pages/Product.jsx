import React from 'react'
import LatestCollection from '../component/LatestCollection'
import BestSeller from '../component/BestSeller'
import PersonalizedRecommendations from '../component/PersonalizedRecommendations'
import Wishlist from '../component/Wishlist'

function Product() {
  return (
    <div className='w-[100vw] min-h-[100vh] bg-blue-50 flex items-center justify-start flex-col py-[20px]'>

        <div className='w-[100%] min-h-[70px] flex items-center justify-center gap-[10px]  flex-col '>
            <PersonalizedRecommendations/>
        </div>
        <div className='w-[100%] min-h-[70px] flex items-center justify-center gap-[10px]  flex-col '>
            <LatestCollection/>
        </div>
        <div className='w-[100%] min-h-[70px] flex items-center justify-center gap-[10px]  flex-col '>
            <BestSeller/>
        </div>

    </div>
  )
}

export default Product
