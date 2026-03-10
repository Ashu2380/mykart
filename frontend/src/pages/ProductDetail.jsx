import React, { useContext, useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { shopDataContext } from '../context/ShopContext'
import { FaStar, FaRegStar, FaMinus, FaPlus, FaCheck, FaTruck, FaShieldAlt, FaUndo, FaExchangeAlt, FaRupeeSign, FaStore, FaShippingFast, FaMoneyBillWave, FaArrowLeft, FaArrowRight, FaExpand, FaTimes, FaBalanceScale } from "react-icons/fa";
import RelatedProduct from '../component/RelatedProduct';
import ProductReviews from '../component/ProductReviews';
import Loading from '../component/Loading';
import { FaVrCardboard, FaCamera, FaHeart, FaShare, FaShoppingCart } from 'react-icons/fa';
import ARViewer from '../component/ARViewer';
import { toast } from 'react-toastify';

function ProductDetail() {
    let {productId} = useParams()
    let navigate = useNavigate()
    let {products, currency, addtoCart, loading, wishlist, addToWishlist, removeFromWishlist} = useContext(shopDataContext)
    let [productData, setProductData] = useState(false)

    // Image states
    const [image, setImage] = useState('')
    const [image1, setImage1] = useState('')
    const [image2, setImage2] = useState('')
    const [image3, setImage3] = useState('')
    const [image4, setImage4] = useState('')
    const [size, setSize] = useState('')
    const [color, setColor] = useState('')
    const [showAR, setShowAR] = useState(false)
    const [arMode, setArMode] = useState('')
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [isWishlisted, setIsWishlisted] = useState(false)
    
    // New state additions
    const [quantity, setQuantity] = useState(1)
    const [showZoom, setShowZoom] = useState(false)
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
    const [showSpecifications, setShowSpecifications] = useState(false)
    const [compareList, setCompareList] = useState([])
    const [showCompareModal, setShowCompareModal] = useState(false)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    
    // Ref for image container
    const imageContainerRef = useRef(null)

    // Calculate delivery date
    const getDeliveryDate = () => {
        const today = new Date()
        const deliveryDate = new Date(today)
        deliveryDate.setDate(today.getDate() + 5)
        return deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    const getFastDeliveryDate = () => {
        const today = new Date()
        const deliveryDate = new Date(today)
        deliveryDate.setDate(today.getDate() + 2)
        return deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    // Get stock status
    const getStockStatus = () => {
        const stock = productData?.stock || 0
        if (stock === 0) return { text: 'Out of Stock', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' }
        if (stock <= 5) return { text: `Only ${stock} left`, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' }
        return { text: 'In Stock', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' }
    }

    const fetchProductData = async () => {
      const product = products.find((item) => item._id === productId);
      if (product) {
        setProductData(product);
        setImage1(product.image1);
        setImage2(product.image2);
        setImage3(product.image3);
        setImage4(product.image4);
        setImage(product.image1);

        // Set default color if available
        if (product.colors && product.colors.length > 0) {
            setColor(product.colors[0])
        }

        const isInWishlist = wishlist.some(item => item.productId?._id === productId || item.productId === productId);
        setIsWishlisted(isInWishlist);
      } else {
        setProductData(null);
      }
    }
  
    const imageArray = [image1, image2, image3, image4].filter(img => img);
    
    // Fixed image navigation - using functional updates properly
    const nextImage = () => {
        setSelectedImageIndex(prev => {
            const newIndex = (prev + 1) % imageArray.length;
            setImage(imageArray[newIndex]);
            return newIndex;
        });
    }
    
    const prevImage = () => {
        setSelectedImageIndex(prev => {
            const newIndex = (prev - 1 + imageArray.length) % imageArray.length;
            setImage(imageArray[newIndex]);
            return newIndex;
        });
    }

    // Zoom functionality
    const handleMouseMove = (e) => {
        if (!imageContainerRef.current) return
        const rect = imageContainerRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setZoomPosition({ x, y })
    }

    // Quantity handlers
    const increaseQuantity = () => {
        if (quantity < (productData?.stock || 10)) {
            setQuantity(quantity + 1)
        }
    }

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1)
        }
    }

    // Add to comparison
    const addToCompare = () => {
        if (compareList.length >= 3) {
            toast.error('You can compare up to 3 products')
            return
        }
        if (!compareList.find(p => p._id === productData._id)) {
            setCompareList([...compareList, productData])
            toast.success('Added to compare')
        } else {
            toast.info('Already in compare list')
        }
    }

    // Remove from comparison
    const removeFromCompare = (productId) => {
        setCompareList(compareList.filter(p => p._id !== productId))
    }

  useEffect(() => {
    fetchProductData()
    // Reset states on product change
    setQuantity(1)
    setSelectedImageIndex(0)
  }, [productId, products])

  // Load comparison list from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('compareList')
    if (saved) {
        try {
            setCompareList(JSON.parse(saved))
        } catch (e) {
            console.error('Error loading compare list:', e)
        }
    }
  }, [])

  // Save comparison list to localStorage
  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList))
  }, [compareList])

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
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='text-center bg-white rounded-2xl p-10 shadow-xl max-w-md border border-gray-100'>
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-5xl">🔍</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h2>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/collection')}
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();
  const discountedPrice = productData.price - (productData.price * productData.discount / 100);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 py-4 px-4 md:px-8 shadow-sm w-full">
        <div className="">
          <p className="text-sm text-gray-500">
            Home / {productData.category} / {productData.subCategory} / <span className="text-gray-900 font-medium">{productData.name}</span>
          </p>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="w-full py-8 px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Image Gallery Section */}
          <div className="lg:w-1/2 w-full">
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 mb-4 group">
              <div 
                className="relative h-[400px] lg:h-[500px] cursor-zoom-in"
                ref={imageContainerRef}
                onMouseEnter={() => setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setLightboxOpen(true)}
              >
                {showZoom ? (
                    <div 
                        className="w-full h-full"
                        style={{
                            backgroundImage: `url(${image})`,
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            backgroundSize: '250%',
                            backgroundRepeat: 'no-repeat'
                        }}
                    />
                ) : (
                    <img 
                        src={image} 
                        alt={productData.name} 
                        className="w-full h-full object-contain p-8" 
                    />
                )}

                {/* Navigation arrows */}
                {imageArray.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg p-3 rounded-full transition-all duration-200 hover:scale-110"
                    >
                      <FaArrowLeft className="text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg p-3 rounded-full transition-all duration-200 hover:scale-110"
                    >
                      <FaArrowRight className="text-gray-700" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                    {selectedImageIndex + 1} / {imageArray.length}
                </div>

                {/* Zoom indicator */}
                <div className="absolute bottom-4 right-4 bg-white/90 text-gray-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                    <FaExpand /> Hover to zoom
                </div>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-3 overflow-x-auto pb-2 px-1">
                {imageArray.map((img, index) => (
                  <button 
                    key={index}
                    onClick={() => { setImage(img); setSelectedImageIndex(index); }}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-sm ${
                        image === img ? 'border-blue-600 ring-2 ring-blue-200 scale-105' : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="lg:w-1/2 w-full">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                        {productData.name}
                    </h1>
                    <div className="flex gap-2 flex-shrink-0">
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
                              toast.error('Failed to update wishlist');
                            }
                          }}
                          className={`p-3 rounded-full border transition-all duration-200 ${
                            isWishlisted 
                              ? 'bg-red-500 border-red-500 text-white' 
                              : 'bg-white border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500'
                          }`}
                        >
                          <FaHeart className={isWishlisted ? 'text-white' : ''} />
                        </button>
                        <button
                          onClick={() => {
                            const shareUrl = window.location.href;
                            if (navigator.share) {
                              navigator.share({ title: productData.name, url: shareUrl });
                            } else {
                              navigator.clipboard.writeText(shareUrl);
                              toast.success('Link copied!');
                            }
                          }}
                          className="p-3 rounded-full border border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-all duration-200"
                        >
                          <FaShare />
                        </button>
                        <button
                            onClick={addToCompare}
                            className="p-3 rounded-full border border-gray-300 bg-white text-gray-600 hover:border-purple-400 hover:text-purple-500 transition-all duration-200"
                        >
                            <FaExchangeAlt />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-200">
                        <FaStar className="text-yellow-500 text-sm" />
                        <span className="font-bold text-gray-900">{productData.averageRating?.toFixed(1) || '0'}</span>
                        <span className="text-gray-500 text-sm">({productData.totalReviews || 0})</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500 text-sm">Brand: <span className="font-semibold text-gray-800">{productData.brand || 'Mykart'}</span></span>
                </div>
            </div>

            {/* Price Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                        {currency} {discountedPrice.toFixed(2)}
                    </span>
                    {productData.discount > 0 && (
                        <>
                            <span className="text-base text-gray-400 line-through">{currency} {productData.price}</span>
                            <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded">
                                {productData.discount}% OFF
                            </span>
                        </>
                    )}
                </div>
                
                {/* Stock Status */}
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-sm ${stockStatus.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.color.replace('text-', 'bg-')}`}></span>
                    <span className={`font-medium ${stockStatus.color}`}>{stockStatus.text}</span>
                </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                        <FaTruck className="text-blue-600 text-sm" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Free Delivery</p>
                        <p className="font-medium text-sm text-gray-900">{getDeliveryDate()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded flex items-center justify-center">
                        <FaShippingFast className="text-green-600 text-sm" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Fast Delivery</p>
                        <p className="font-medium text-sm text-gray-900">{getFastDeliveryDate()}</p>
                    </div>
                </div>
            </div>

            {/* Sold By */}
            <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                    <FaStore className="text-purple-600 text-sm" />
                </div>
                <div className="flex-1">
                    <p className="text-xs text-gray-500">Sold by</p>
                    <p className="font-semibold text-sm text-gray-900">{productData.seller || 'Mykart Direct'}</p>
                </div>
                {productData.sellerRating && (
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                        <FaStar className="text-yellow-500 text-xs" />
                        <span className="font-semibold text-xs">{productData.sellerRating}</span>
                    </div>
                )}
            </div>

            {/* Color Selection */}
            {productData.colors && productData.colors.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                    <p className="font-semibold text-gray-900 mb-2">Select Color</p>
                    <div className="flex gap-2 flex-wrap">
                        {productData.colors.map((item, index) => (
                            <button 
                                key={index} 
                                className={`px-3 py-1.5 rounded border text-sm ${
                                item === color 
                                    ? 'border-blue-600 bg-blue-50 text-blue-600' 
                                    : 'border-gray-300 bg-white text-gray-700'
                                }`} 
                                onClick={() => setColor(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Size Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">Select Size</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(productData.sizes && productData.sizes.length > 0 ? productData.sizes : ['One Size']).map((item, index) => (
                        <button 
                            key={index} 
                            className={`px-3 py-1.5 rounded border text-sm ${
                            item === size 
                                ? 'border-blue-600 bg-blue-50 text-blue-600' 
                                : 'border-gray-300 bg-white text-gray-700'
                            }`} 
                            onClick={() => setSize(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Quantity Selector */}
                <div className="flex items-center border-2 border-gray-300 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <button 
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="px-5 py-4 bg-gray-50 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700"
                    >
                        <FaMinus className="text-sm font-bold" />
                    </button>
                    <span className="px-8 py-4 font-bold border-x-2 border-gray-300 min-w-[80px] text-center text-lg">{quantity}</span>
                    <button 
                        onClick={increaseQuantity}
                        disabled={quantity >= (productData.stock || 10)}
                        className="px-5 py-4 bg-gray-50 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700"
                    >
                        <FaPlus className="text-sm font-bold" />
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex-1 flex gap-3">
                    <button 
                        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 px-8 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        onClick={() => {
                            if (!size && productData.sizes?.length > 0) {
                                toast.error("Please select a size!");
                                return;
                            }
                            addtoCart(productData._id, size, quantity);
                            toast.success('Added to cart!');
                        }}
                        disabled={productData.stock === 0}
                    >
                        <FaShoppingCart />
                        Add to Cart
                    </button>
                    <button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                            if (!size && productData.sizes?.length > 0) {
                                toast.error("Please select a size!");
                                return;
                            }
                            addtoCart(productData._id, size, quantity);
                            navigate('/placeorder');
                        }}
                        disabled={productData.stock === 0}
                    >
                        Buy Now
                    </button>
                </div>
            </div>

            {/* ARViewer - Disabled */}
            {/* <ARViewer mode={arMode} product={productData} isOpen={showAR} onClose={closeARView} /> */}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                <div className="text-center">
                    <FaShieldAlt className="text-green-600 text-xl mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700">100% Original</p>
                </div>
                <div className="text-center">
                    <FaTruck className="text-blue-600 text-xl mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700">Free Delivery</p>
                </div>
                <div className="text-center">
                    <FaUndo className="text-purple-600 text-xl mx-auto mb-1" />
                    <p className="text-xs font-medium text-gray-700">Easy Returns</p>
                </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Product Description</h3>
            <p className="text-gray-600 leading-relaxed">{productData.description}</p>
        </div>

        {/* Specifications Toggle */}
        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-200">
            <button 
                onClick={() => setShowSpecifications(!showSpecifications)}
                className="flex items-center justify-between w-full"
            >
                <h3 className="text-lg font-bold text-gray-900">Product Specifications</h3>
                <span className={`transform transition-transform ${showSpecifications ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {showSpecifications && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Category</span>
                            <span className="font-medium text-gray-900">{productData.category}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Sub Category</span>
                            <span className="font-medium text-gray-900">{productData.subCategory}</span>
                        </div>
                        {productData.brand && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Brand</span>
                                <span className="font-medium text-gray-900">{productData.brand}</span>
                            </div>
                        )}
                        {productData.specifications && Object.entries(productData.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">{key}</span>
                                <span className="font-medium text-gray-900">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Compare Banner */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-gray-200 z-50 p-4">
            <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <FaBalanceScale className="text-purple-600 text-xl" />
                    <span className="font-semibold text-gray-800">Compare ({compareList.length}/3):</span>
                    <div className="flex gap-2">
                        {compareList.map((item) => (
                            <div key={item._id} className="relative group">
                                <img src={item.image1} alt={item.name} className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                                <button 
                                    onClick={() => removeFromCompare(item._id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => { setCompareList([]); localStorage.removeItem('compareList'); }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Clear
                    </button>
                    <button 
                        onClick={() => setShowCompareModal(true)}
                        disabled={compareList.length < 2}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Compare
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Product Comparison</h2>
                    <button onClick={() => setShowCompareModal(false)} className="text-gray-500 hover:text-gray-700">
                        <FaTimes className="text-xl" />
                    </button>
                </div>
                <div className="overflow-x-auto p-6">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="text-left p-3 text-gray-500 font-medium w-1/4"></th>
                                {compareList.map(item => (
                                    <th key={item._id} className="p-3">
                                        <img src={item.image1} alt={item.name} className="w-24 h-24 object-cover mx-auto rounded-xl mb-3" />
                                        <p className="font-semibold text-gray-900 text-sm text-center line-clamp-2">{item.name}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t border-gray-100">
                                <td className="p-3 font-medium text-gray-600">Price</td>
                                {compareList.map(item => (
                                    <td key={item._id} className="p-3 text-center font-bold text-green-600">
                                        {currency} {(item.price - (item.price * item.discount / 100)).toFixed(2)}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-t border-gray-100">
                                <td className="p-3 font-medium text-gray-600">Rating</td>
                                {compareList.map(item => (
                                    <td key={item._id} className="p-3 text-center">
                                        <div className="flex justify-center items-center gap-1">
                                            <FaStar className="text-yellow-500" />
                                            <span className="font-medium">{item.averageRating?.toFixed(1) || 'N/A'}</span>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-t border-gray-100">
                                <td className="p-3 font-medium text-gray-600">Availability</td>
                                {compareList.map(item => (
                                    <td key={item._id} className="p-3 text-center">
                                        <span className={item.stock > 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                                            {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-t border-gray-100">
                                <td className="p-3 font-medium text-gray-600"></td>
                                {compareList.map(item => (
                                    <td key={item._id} className="p-3 text-center">
                                        <button 
                                            onClick={() => navigate(`/product/${item._id}`)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
            <button 
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
            >
                <FaTimes className="text-2xl" />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-4 hover:bg-white/20 rounded-full"
            >
                <FaArrowLeft className="text-2xl" />
            </button>
            <img src={image} alt={productData.name} className="max-w-[90vw] max-h-[90vh] object-contain" />
            <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-4 hover:bg-white/20 rounded-full"
            >
                <FaArrowRight className="text-2xl" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {imageArray.map((_, index) => (
                    <div
                        key={index}
                        className={`w-3 h-3 rounded-full cursor-pointer ${selectedImageIndex === index ? 'bg-white' : 'bg-white/50'}`}
                        onClick={() => { setSelectedImageIndex(index); setImage(imageArray[index]); }}
                    />
                ))}
            </div>
        </div>
      )}

      {/* Related Products */}
      <div className="w-full px-4 md:px-8 py-12">
        <RelatedProduct category={productData.category} subCategory={productData.subCategory} currentProductId={productData._id}/>
      </div>

      {/* Reviews */}
      <div className="w-full py-12">
        <ProductReviews productId={productId} />
      </div>
    </div>
  );
}

export default ProductDetail

