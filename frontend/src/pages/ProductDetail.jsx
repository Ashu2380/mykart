import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { shopDataContext } from '../context/ShopContext'
import { FaStar } from "react-icons/fa";
import { FaStarHalfAlt } from "react-icons/fa";
import RelatedProduct from '../component/RelatedProduct';
import ProductReviews from '../component/ProductReviews';
import Loading from '../component/Loading';
import { FaVrCardboard, FaCamera } from 'react-icons/fa';
import ARViewer from '../component/ARViewer';

function ProductDetail() {
    let {productId} = useParams()
    let navigate = useNavigate()
    let {products,currency ,addtoCart ,loading} = useContext(shopDataContext)
    let [productData,setProductData] = useState(false)

    const [image, setImage] = useState('')
  const [image1, setImage1] = useState('')
  const [image2, setImage2] = useState('')
  const [image3, setImage3] = useState('')
  const [image4, setImage4] = useState('')
  const [size, setSize] = useState('')
  const [showAR, setShowAR] = useState(false)
  const [arMode, setArMode] = useState('') // 'body' or 'room'



    const fetchProductData = async () => {
    const product = products.find((item) => item._id === productId);
    if (product) {
      setProductData(product);
      setImage1(product.image1);
      setImage2(product.image2);
      setImage3(product.image3);
      setImage4(product.image4);
      setImage(product.image1);
    } else {
      setProductData(null);
    }
  }

  useEffect(() => {
    fetchProductData()
  }, [productId, products])

  const openARView = (mode) => {
    setArMode(mode)
    setShowAR(true)
  }

  const closeARView = () => {
    setShowAR(false)
    setArMode('')
  }

  if (products.length === 0) {
    return <Loading />;
  }

  if (!productData) {
    return <div className='flex items-center justify-center min-h-screen text-white'>Product not found</div>;
  }

  return (
    <div >
        <div className=' w-[99vw] min-h-[100vh] bg-blue-50 flex items-center justify-start flex-col lg:flex-row gap-4 md:gap-5 lg:gap-[20px] pt-20 md:pt-16 lg:pt-20 px-4 md:px-6 lg:px-8'>
            <div className='lg:w-[50vw] md:w-[90vw] lg:h-[90vh] h-[50vh] flex items-center justify-center md:gap-[10px] gap-[30px] flex-col-reverse lg:flex-row'>
                <div className='lg:w-[20%] md:w-[80%] h-[10%] lg:h-[80%] flex items-center justify-center gap-[50px] lg:gap-[20px] lg:flex-col flex-wrap '>
                    <div className='md:w-[100px]  w-[50px] h-[50px] md:h-[110px] bg-slate-300 border-[1px] border-[#80808049] rounded-md'>
                        <img src={image1} alt="" className='w-[100%] h-[100%]  cursor-pointer rounded-md' onClick={()=>setImage(image1)}/>
                    </div>
                    <div className='md:w-[100px]  w-[50px] h-[50px] md:h-[110px] bg-slate-300 border-[1px] border-[#80808049] rounded-md'>
                        <img src={image2} alt="" className='w-[100%] h-[100%]  cursor-pointer rounded-md' onClick={()=>setImage(image2)}/>
                    </div>
                    <div className='md:w-[100px]  w-[50px] h-[50px] md:h-[110px] bg-slate-300 border-[1px] border-[#80808049] rounded-md'>
                        <img src={image3} alt="" className='w-[100%] h-[100%]  cursor-pointer rounded-md' onClick={()=>setImage(image3)}/>
                    </div>
                    <div className='md:w-[100px]  w-[50px] h-[50px] md:h-[110px] bg-slate-300 border-[1px] border-[#80808049] rounded-md'>
                        <img src={image4} alt="" className='w-[100%] h-[100%]  cursor-pointer rounded-md' onClick={()=>setImage(image4)}/>
                    </div>

                </div>
                <div className='lg:w-[60%] w-[80%] lg:h-[78%] h-[70%] border-[1px] border-[#80808049] rounded-md  overflow-hidden'>
                    <img src={image} alt="" className=' w-[100%] lg:h-[100%] h-[100%] text-[30px] text-white  text-center rounded-md object-fill ' />
                </div>
            </div>

            <div className='lg:w-[50vw] w-[100vw] lg:h-[75vh] h-[40vh] flex items-start justify-start flex-col py-[20px] px-[30px] md:pb-[20px] md:pl-[20px] lg:pl-[0px] lg:px-[0px] lg:py-[0px] gap-[10px]'>
                <h1 className='text-[40px] font-semibold text-gray-800'>{productData.name.toUpperCase()}</h1>
                <div className='flex items-center gap-1 '>
                    {productData.averageRating > 0 ? (
                        <>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    className={`text-[20px] ${
                                        star <= Math.floor(productData.averageRating)
                                            ? 'fill-[#FFD700] text-[#FFD700]'
                                            : star === Math.ceil(productData.averageRating) && productData.averageRating % 1 !== 0
                                            ? 'fill-[#FFD700] text-[#FFD700]'
                                            : 'text-gray-400'
                                    }`}
                                />
                            ))}
                            <p className='text-[18px] font-semibold pl-[5px] text-gray-800'>
                                ({productData.totalReviews || 0})
                            </p>
                        </>
                    ) : (
                        <>
                            <FaStar className='text-[20px] text-gray-400' />
                            <FaStar className='text-[20px] text-gray-400' />
                            <FaStar className='text-[20px] text-gray-400' />
                            <FaStar className='text-[20px] text-gray-400' />
                            <FaStar className='text-[20px] text-gray-400' />
                            <p className='text-[18px] font-semibold pl-[5px] text-gray-800'>(0)</p>
                        </>
                    )}
                </div>
                <div className='flex items-center gap-3 pl-[5px]'>
                  {productData.discount > 0 ? (
                    <>
                      <p className='text-[30px] font-semibold text-green-400'>{currency} {(productData.price - (productData.price * productData.discount / 100)).toFixed(2)}</p>
                      <p className='text-[24px] text-gray-400 line-through'>{currency} {productData.price}</p>
                      <div className='bg-red-500 text-white text-sm px-3 py-1 rounded-full font-semibold'>{productData.discount}% OFF</div>
                    </>
                  ) : (
                    <p className='text-[30px] font-semibold text-gray-800'>{currency} {productData.price}</p>
                  )}
                </div>

                <p className=' w-[80%] md:w-[60%] text-[20px] font-semibold pl-[5px] text-gray-700'>{productData.description} and Stylish, breathable cotton shirt with a modern slim fit. Easy to wash, super comfortable, and designed for effortless style.</p>

                {/* AR/VR Try-On Buttons */}
                <div className='flex gap-3 mt-4'>
                  {(productData.category === 'Clothes' || productData.category === 'Home & Kitchen') && (
                    <>
                      <button
                        onClick={() => openARView(productData.category === 'Clothes' ? 'body' : 'room')}
                        className='flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg'
                      >
                        <FaVrCardboard className='text-lg' />
                        {productData.category === 'Clothes' ? 'Try On Body' : 'View in Room'}
                      </button>
                      <button
                        onClick={() => openARView('camera')}
                        className='flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg'
                      >
                        <FaCamera className='text-lg' />
                        AR Camera
                      </button>
                    </>
                  )}
                </div>

                <div className='flex flex-col gap-[10px] my-[10px] '>
                        <p className='text-[25px] font-semibold pl-[5px] text-gray-800'>Select Size</p>
               <div className='flex gap-2'>
                 {
                   (productData.sizes && productData.sizes.length > 0 ? productData.sizes : ['One Size']).map((item, index) => (
                     <button key={index} className={`border py-2 px-4 bg-white text-gray-800 rounded-md border-gray-300 hover:bg-gray-100 transition-all duration-300
                       ${item === size ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : ''}`} onClick={() => setSize(item)} >{item}</button>
                   ))
                 }
               </div>
                <div className='flex gap-3 mt-4'>
                  <button
                    className='text-[16px] active:bg-blue-700 cursor-pointer bg-blue-600 hover:bg-blue-700 py-[10px] px-[20px] rounded-2xl border-[1px] border-gray-300 text-white shadow-md shadow-gray-400 transition-all duration-300'
                    onClick={() => {
                      addtoCart(productData._id, size);
                      navigate('/placeorder');
                    }}
                  >
                    {loading ? <Loading /> : "Buy Now"}
                  </button>
                  <button className='text-[16px] active:bg-gray-600 cursor-pointer bg-gray-600 hover:bg-gray-700 py-[10px] px-[20px] rounded-2xl border-[1px] border-gray-300 text-white shadow-md shadow-gray-400 transition-colors duration-300' onClick={()=>addtoCart(productData._id , size)} >{loading? <Loading/> : "Add to Cart"}</button>
                </div>
                    </div>
            <div className='w-[90%] h-[1px] bg-gray-300 mt-4'></div>
            </div>


        </div>

        {/* AR/VR Modal */}
        {showAR && (
          <div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50'>
            <div className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden'>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-2xl font-bold text-white flex items-center gap-2'>
                    <FaVrCardboard className='text-purple-400' />
                    {arMode === 'body' ? 'Virtual Try-On' : arMode === 'room' ? 'Room View' : 'AR Camera'}
                  </h2>
                  <button
                    onClick={closeARView}
                    className='text-gray-400 hover:text-white text-2xl'
                  >
                    ×
                  </button>
                </div>

                <div className='bg-black/50 rounded-lg h-96 flex items-center justify-center'>
                  {arMode === 'body' ? (
                    <div className='text-center text-white'>
                      <FaVrCardboard className='text-6xl mx-auto mb-4 text-purple-400' />
                      <h3 className='text-xl font-semibold mb-2'>Virtual Body Try-On</h3>
                      <p className='text-gray-300'>Experience how {productData.name} looks on you!</p>
                      <p className='text-sm text-gray-400 mt-2'>AR technology coming soon...</p>
                    </div>
                  ) : arMode === 'room' ? (
                    <div className='text-center text-white'>
                      <FaVrCardboard className='text-6xl mx-auto mb-4 text-blue-400' />
                      <h3 className='text-xl font-semibold mb-2'>Room Visualization</h3>
                      <p className='text-gray-300'>See how {productData.name} fits in your space!</p>
                      <p className='text-sm text-gray-400 mt-2'>VR room view coming soon...</p>
                    </div>
                  ) : (
                    <div className='text-center text-white'>
                      <FaCamera className='text-6xl mx-auto mb-4 text-green-400' />
                      <h3 className='text-xl font-semibold mb-2'>AR Camera View</h3>
                      <p className='text-gray-300'>Point your camera to see {productData.name} in real world!</p>
                      <p className='text-sm text-gray-400 mt-2'>Camera AR feature coming soon...</p>
                    </div>
                  )}
                </div>

                <div className='mt-4 text-center'>
                  <button
                    onClick={closeARView}
                    className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg transition-all duration-300'
                  >
                    Close AR View
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Reviews Section */}
        <div className='w-[100%] min-h-[50vh] bg-blue-50 flex items-start justify-start flex-col overflow-x-hidden px-4 md:px-6 lg:px-8 py-8'>
            <ProductReviews productId={productId} />
        </div>

        {/* Product Info Section */}
        <div className='w-[100%] bg-blue-50 flex items-center justify-center py-8 px-4 md:px-6 lg:px-8'>
            <div className='w-[80%] text-[16px] text-gray-700 text-center space-y-2'>
                <p>100% Original Product.</p>
                <p>Cash on delivery is available on this product</p>
                <p>Easy return and exchange policy within 7 days</p>
            </div>
        </div>

        <div className='w-[100%] min-h-[70vh] bg-blue-50 flex items-start justify-start flex-col  overflow-x-hidden'>

            <div className='flex px-[20px] mt-[90px] lg:ml-[80px] ml-[0px]  lg:mt-[0px]  '>


       </div>

       <RelatedProduct category={productData.category} subCategory={productData.subCategory} currentProductId={productData._id}/>
        </div>

    </div>
  );
}

export default ProductDetail
