import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { shopDataContext } from '../context/ShopContext'
import { FaStar } from "react-icons/fa";
import RelatedProduct from '../component/RelatedProduct';
import ProductReviews from '../component/ProductReviews';
import Loading from '../component/Loading';
import { FaVrCardboard, FaCamera, FaHeart, FaShare, FaShoppingCart, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import ARViewer from '../component/ARViewer';
import { toast } from 'react-toastify';

function ProductDetail() {
    let {productId} = useParams()
    let navigate = useNavigate()
    let {products,currency ,addtoCart ,loading, wishlist, addToWishlist, removeFromWishlist} = useContext(shopDataContext)
    let [productData,setProductData] = useState(false)

    const [image, setImage] = useState('')
    const [image1, setImage1] = useState('')
    const [image2, setImage2] = useState('')
    const [image3, setImage3] = useState('')
    const [image4, setImage4] = useState('')
    const [size, setSize] = useState('')
    const [showAR, setShowAR] = useState(false)
    const [arMode, setArMode] = useState('')
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [isWishlisted, setIsWishlisted] = useState(false)

    const fetchProductData = async () => {
      const product = products.find((item) => item._id === productId);
      if (product) {
        setProductData(product);
        setImage1(product.image1);
        setImage2(product.image2);
        setImage3(product.image3);
        setImage4(product.image4);
        setImage(product.image1);

        const isInWishlist = wishlist.some(item => item.productId?._id === productId || item.productId === productId);
        setIsWishlisted(isInWishlist);
      } else {
        setProductData(null);
      }
    }
  
    const imageArray = [image1, image2, image3, image4].filter(img => img);
  
    const nextImage = () => {
      setSelectedImageIndex((prev) => (prev + 1) % imageArray.length);
      setImage(imageArray[(selectedImageIndex + 1) % imageArray.length]);
    }
  
    const prevImage = () => {
      setSelectedImageIndex((prev) => (prev - 1 + imageArray.length) % imageArray.length);
      setImage(imageArray[(selectedImageIndex - 1 + imageArray.length) % imageArray.length]);
    }

  useEffect(() => {
    fetchProductData()
  }, [productId, products, wishlist])

  const openARView = (mode) => {
    console.log('Opening AR view with mode:', mode);
    toast.info(`Opening AR ${mode} mode...`);
    setArMode(mode);
    setShowAR(true);
  }

  const closeARView = () => {
    setShowAR(false)
    setArMode('')
  }

  if (products.length === 0) {
    return <Loading />;
  }

  if (!productData) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
        <div className='text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-md'>
          <div className='text-6xl mb-4'>🔍</div>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>Product Not Found</h2>
          <p className='text-gray-600 mb-6'>The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/collection')}
            className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg'
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Main Product Section */}
      <div className="w-full max-w-7xl mx-auto pt-20 md:pt-16 lg:pt-20 px-4 md:px-6 lg:px-8 pb-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Image Gallery Section */}
          <div className="lg:w-1/2 w-full">
            <div className="flex flex-col-reverse lg:flex-row gap-4 h-full">
              {/* Thumbnail Images */}
              <div className="lg:w-1/5 w-full flex lg:flex-col gap-3 justify-center">
                {imageArray.map((img, index) => (
                  <div 
                    key={index} 
                    className={`w-16 h-16 md:w-20 md:h-20 lg:w-full lg:h-20 bg-white border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      image === img ? 'border-blue-500 shadow-xl' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      className="w-full h-full cursor-pointer rounded-lg object-cover" 
                      onClick={() => { setImage(img); setSelectedImageIndex(index); }}
                    />
                  </div>
                ))}
              </div>
              
              {/* Main Image */}
              <div className="lg:w-4/5 w-full h-[50vh] lg:h-[70vh] border-2 border-gray-200 rounded-xl overflow-hidden relative group shadow-2xl bg-white/90 backdrop-blur-sm">
                <img 
                  src={image} 
                  alt={productData.name} 
                  className="w-full h-full object-contain transition-all duration-500 hover:scale-105" 
                />

                {/* Navigation arrows */}
                {imageArray.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
                    >
                      ›
                    </button>
                  </>
                )}

                {/* Image indicator dots */}
                {imageArray.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                    {imageArray.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 hover:scale-125 ${
                          selectedImageIndex === index ? 'bg-blue-500 shadow-lg' : 'bg-white/70 hover:bg-white/90'
                        }`}
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setImage(imageArray[index]);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="lg:w-1/2 w-full flex flex-col gap-4">
            {/* Product Title & Actions */}
            <div className="flex items-start justify-between">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
                {productData.name.toUpperCase()}
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      if (isWishlisted) {
                        await removeFromWishlist(productData._id);
                        setIsWishlisted(false);
                      } else {
                        await addToWishlist(productData._id);
                        setIsWishlisted(true);
                      }
                    } catch (error) {
                      console.error('Wishlist operation failed:', error);
                      toast.error('Failed to update wishlist. Please try again.');
                    }
                  }}
                  className={`p-3 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
                    isWishlisted 
                      ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30' 
                      : 'bg-white border-gray-300 text-gray-600 hover:border-red-400 hover:shadow-lg'
                  }`}
                >
                  <FaHeart className={isWishlisted ? 'text-white' : 'text-gray-600 hover:text-red-500'} />
                </button>
                <button
                  onClick={() => {
                    const shareUrl = window.location.href;
                    const shareText = `Check out this amazing product: ${productData.name}`;

                    if (navigator.share) {
                      navigator.share({
                        title: productData.name,
                        text: shareText,
                        url: shareUrl,
                      });
                    } else {
                      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                      toast.success('Product link copied to clipboard!');
                    }
                  }}
                  className="p-3 rounded-full border-2 border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <FaShare className="hover:text-blue-500 transition-colors duration-300" />
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 w-fit">
              {productData.averageRating > 0 ? (
                <>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`text-lg transition-all duration-300 ${
                        star <= Math.floor(productData.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : star === Math.ceil(productData.averageRating) && productData.averageRating % 1 !== 0
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <p className="text-sm font-semibold text-gray-700 ml-2">
                    ({productData.totalReviews || 0} reviews)
                  </p>
                </>
              ) : (
                <>
                  <FaStar className="text-lg text-gray-300" />
                  <FaStar className="text-lg text-gray-300" />
                  <FaStar className="text-lg text-gray-300" />
                  <FaStar className="text-lg text-gray-300" />
                  <FaStar className="text-lg text-gray-300" />
                  <p className="text-sm font-semibold text-gray-700 ml-2">(0 reviews)</p>
                </>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              {productData.discount > 0 ? (
                <>
                  <p className="text-2xl md:text-3xl font-bold text-green-500">
                    {currency} {(productData.price - (productData.price * productData.discount / 100)).toFixed(2)}
                  </p>
                  <p className="text-xl text-gray-400 line-through">{currency} {productData.price}</p>
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm px-4 py-2 rounded-full font-bold shadow-lg animate-pulse">
                    {productData.discount}% OFF
                  </div>
                </>
              ) : (
                <p className="text-2xl md:text-3xl font-bold text-gray-800">
                  {currency} {productData.price}
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-base text-gray-600 leading-relaxed bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
              {productData.description}
            </p>

            {/* AR Buttons */}
            <div className="flex gap-3 mt-2 flex-wrap">
              {(productData.category === 'Clothes' || productData.category === 'Home & Kitchen') && (
                <>
                  <button
                    onClick={() => openARView('camera')}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-5 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                  >
                    <FaCamera className="text-lg" />
                    AR Try On
                  </button>
                </>
              )}
              <ARViewer
                mode={arMode}
                product={productData}
                isOpen={showAR}
                onClose={closeARView}
              />
            </div>

            {/* Size Selection */}
            <div className="flex flex-col gap-3 bg-white/50 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50">
              <p className="text-lg font-bold text-gray-800">Select Size</p>
              <div className="flex gap-3 flex-wrap">
                {(productData.sizes && productData.sizes.length > 0 ? productData.sizes : ['One Size']).map((item, index) => (
                  <button 
                    key={index} 
                    className={`px-6 py-3 rounded-xl bg-white text-base hover:border-blue-500 border-2 border-gray-300 cursor-pointer text-gray-800 hover:bg-blue-50 transition-all duration-300 hover:scale-110 hover:shadow-lg font-bold ${
                      item === size ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-500 scale-110 shadow-lg' : ''
                    }`} 
                    onClick={() => setSize(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-2 flex-wrap">
              <button
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 text-base active:bg-blue-700 cursor-pointer bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 py-4 px-8 rounded-2xl border-2 border-green-500 text-white shadow-lg shadow-green-400/50 transition-all duration-300 hover:shadow-xl transform hover:scale-105 font-bold"
                onClick={() => {
                  if (!size) {
                    alert("Please select a size first!");
                    return;
                  }
                  addtoCart(productData._id, size);
                  navigate('/placeorder');
                }}
              >
                <FaShoppingCart className="text-lg" />
                {loading ? <Loading /> : "Buy Now"}
              </button>
              <button 
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 text-base active:bg-gray-600 cursor-pointer bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 py-4 px-8 rounded-2xl border-2 border-orange-500 text-white shadow-lg shadow-orange-400/50 transition-all duration-300 hover:shadow-xl transform hover:scale-105 font-bold" 
                onClick={()=>{
                  if (!size) {
                    alert("Please select a size first!");
                    return;
                  }
                  addtoCart(productData._id, size);
                }}
              >
                <FaShoppingCart className="text-lg" />
                {loading ? <Loading/> : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Section */}
      <div className="w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-16 px-4 md:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-8 bg-white/80 rounded-2xl backdrop-blur-sm border border-gray-200 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 transform hover:scale-105 hover:bg-white">
              <FaShieldAlt className="text-4xl text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-3">100% Original</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Authentic products guaranteed with quality assurance</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white/80 rounded-2xl backdrop-blur-sm border border-gray-200 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:scale-105 hover:bg-white">
              <FaTruck className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-3">Free Delivery</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Cash on delivery available with fast shipping</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white/80 rounded-2xl backdrop-blur-sm border border-gray-200 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:scale-105 hover:bg-white">
              <FaUndo className="text-4xl text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-3">Easy Returns</h3>
              <p className="text-sm text-gray-600 leading-relaxed">7 days hassle-free return policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="w-full min-h-[70vh] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col overflow-x-hidden">
        <RelatedProduct category={productData.category} subCategory={productData.subCategory} currentProductId={productData._id}/>
      </div>

      {/* Product Reviews Section */}
      <div className="w-full min-h-[50vh] bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col overflow-x-hidden px-4 md:px-6 lg:px-8 py-12">
        <ProductReviews productId={productId} />
      </div>
    </div>
  );
}

export default ProductDetail
