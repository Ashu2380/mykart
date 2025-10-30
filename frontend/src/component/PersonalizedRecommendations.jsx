import React, { useContext } from 'react'
import Title from './Title'
import { shopDataContext } from '../context/ShopContext'
import Card from './Card'

function PersonalizedRecommendations() {
    let {personalizedProducts} = useContext(shopDataContext)

    // Ensure personalizedProducts is an array
    if (!Array.isArray(personalizedProducts)) {
        return (
            <div>
                <div className='h-[8%] w-[100%] text-center md:mt-[50px]  '>
                    <Title text1={"RECOMMENDED"} text2={"FOR YOU"}/>
                    <p className='w-[100%] m-auto text-[13px] md:text-[20px] px-[10px] text-gray-700 '>AI-Powered Suggestions Based on Your Interests!</p>
                </div>
                <div className='w-[100%] h-[50%] mt-[30px] flex items-center justify-center'>
                    <p className='text-gray-400'>Loading recommendations...</p>
                </div>
            </div>
        );
    }

    if (personalizedProducts.length === 0) {
        return (
            <div>
                <div className='h-[8%] w-[100%] text-center md:mt-[50px]  '>
                    <Title text1={"RECOMMENDED"} text2={"FOR YOU"}/>
                    <p className='w-[100%] m-auto text-[13px] md:text-[20px] px-[10px] text-gray-700 '>AI-Powered Suggestions Based on Your Interests!</p>
                </div>
                <div className='w-[100%] h-[50%] mt-[30px] flex items-center justify-center'>
                    <p className='text-gray-400'>No personalized recommendations available at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className='h-[8%] w-[100%] text-center md:mt-[50px]  '>
                <Title text1={"RECOMMENDED"} text2={"FOR YOU"}/>
                <p className='w-[100%] m-auto text-[13px] md:text-[20px] px-[10px] text-gray-700 '>AI-Powered Suggestions Based on Your Interests!</p>
            </div>
            <div className='w-[100%] h-[50%] mt-[30px] flex items-center justify-center flex-wrap gap-[50px]'>
                {
                    personalizedProducts.map((item,index)=>(
                        <Card key={item._id || index} name={item.name} image={item.image1} id={item._id} price={item.price} discount={item.discount}/>
                    ))
                }

            </div>
        </div>
    )
}

export default PersonalizedRecommendations