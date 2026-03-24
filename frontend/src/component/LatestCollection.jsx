import React, { useContext, useEffect, useState } from 'react'
import Title from './Title'
import { shopDataContext } from '../context/ShopContext'
import Card from './Card'

function LatestCollection() {
    let {products} = useContext(shopDataContext)
    let [latestProducts,setLatestProducts] = useState([])
    let [loading, setLoading] = useState(true)

    useEffect(()=>{
        if (products && products.length > 0) {
            setLatestProducts(products.slice(0,8));
            setLoading(false);
        } else {
            setLoading(false);
        }
    },[products])

    if (loading) {
        return (
            <div>
                <div className='h-[8%] w-[100%] text-center md:mt-[50px]'>
                    <Title text1={"LATEST"} text2={"COLLECTIONS"}/>
                </div>
                <div className='w-[100%] mt-[30px] flex items-center justify-center gap-[20px] flex-wrap'>
                    {[1,2,3,4].map((item) => (
                        <div key={item} className='w-[250px] h-[300px] bg-gray-200 animate-pulse rounded-xl'></div>
                    ))}
                </div>
            </div>
        )
    }

    if (latestProducts.length === 0) {
        return (
            <div>
                <div className='h-[8%] w-[100%] text-center md:mt-[50px]'>
                    <Title text1={"LATEST"} text2={"COLLECTIONS"}/>
                </div>
                <div className='w-[100%] mt-[30px] flex items-center justify-center'>
                    <p className='text-gray-500 text-lg'>No products available yet. Check back soon!</p>
                </div>
            </div>
        )
    }

  return (
    <div>
      <div className='h-[8%] w-[100%] text-center md:mt-[50px]'>
        <Title text1={"LATEST"} text2={"COLLECTIONS"}/>
        <p className='w-[100%] m-auto text-[13px] md:text-[20px] px-[10px] text-gray-700 '>Step Into Style – New Collection Dropping This Season!</p>
      </div>
      <div className='w-[100%] mt-[30px] flex items-center justify-center flex-wrap gap-[50px]'>
        {
            latestProducts.map((item,index)=>(
                <Card key={index} name={item.name} image={item.image1} id={item._id} price={item.price} discount={item.discount}/>
            ))
        }
        
        </div>
    </div>
  )
}

export default LatestCollection
