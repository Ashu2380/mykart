import React, { createContext, useContext, useEffect, useState } from 'react'
import { authDataContext } from './authContext'
import axios from 'axios'
import { userDataContext } from './UserContext'
import { toast } from 'react-toastify'

 export const shopDataContext = createContext()
function ShopContext({children}) {

    let [products,setProducts] = useState([])
    let [search,setSearch] = useState('')
    let {userData} = useContext(userDataContext)
    let [showSearch,setShowSearch] = useState(false)
    let {serverUrl} = useContext(authDataContext)
    let [cartItem, setCartItem] = useState({});
      let [loading,setLoading] = useState(false)
    let currency = '₹';
    let delivery_fee = 40;

    // AI-powered personalized recommendations
    let [personalizedProducts, setPersonalizedProducts] = useState([])

    // Wishlist functionality
    let [wishlist, setWishlist] = useState([])

    const getProducts = async () => {
        try {
            const response = await axios.get(serverUrl + "/api/product/list")
            setProducts(response.data)
        } catch (error) {
            console.log("Error fetching products:", error)
            setProducts([])
        }

    }

    // Get personalized recommendations based on user behavior
    const getPersonalizedRecommendations = async () => {
        if (!userData) return;

        try {
            // Analyze user's cart and browsing history to determine preferences
            const cartCategories = Object.keys(cartItem).map(productId => {
                const product = products.find(p => p._id === productId);
                return product ? product.category : null;
            }).filter(Boolean);

            const preferences = [...new Set(cartCategories)]; // Remove duplicates

            if (preferences.length === 0) {
                // If no cart data, show trending/best selling items
                const trending = products.filter(p => p.bestseller).slice(0, 8);
                setPersonalizedProducts(trending);
                return;
            }

            // Get AI recommendations based on preferences
            const response = await axios.post(serverUrl + "/api/product/ai-recommendations", {
                query: preferences.join(' '),
                preferences: preferences
            });

            if (response.data.success) {
                setPersonalizedProducts(response.data.recommendations.slice(0, 8));
            } else {
                // Fallback to bestseller if AI fails
                const trending = products.filter(p => p.bestseller).slice(0, 8);
                setPersonalizedProducts(trending);
            }
        } catch (error) {
            console.log("Error getting personalized recommendations:", error);
            // Fallback to latest products
            setPersonalizedProducts(products.slice(0, 8));
        }
    }


    const addtoCart = async (itemId , size) => {
       // If no size provided and product has no sizes, fallback to 'One Size'
       let effectiveSize = size;
       if (!effectiveSize) {
         const productInfo = products.find((p) => p._id === itemId);
         if (productInfo && (!productInfo.sizes || productInfo.sizes.length === 0)) {
           effectiveSize = 'One Size';
         }
       }
       if (!effectiveSize) {
         console.log("Select Product Size");
         return;
       }

    let cartData = structuredClone(cartItem); // Clone the product

    if (cartData[itemId]) {
      if (cartData[itemId][effectiveSize]) {
        cartData[itemId][effectiveSize] += 1;
      } else {
        cartData[itemId][effectiveSize] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][effectiveSize] = 1;
    }
  
    setCartItem(cartData);
  

    if (userData) {
      setLoading(true)
      try {
      let result = await axios.post(serverUrl + "/api/cart/add" , {itemId,size: effectiveSize} , {withCredentials: true})
      console.log(result.data)
      toast.success("Product Added")
      setLoading(false)


       
      }
      catch (error) {
        console.log(error)
        setLoading(false)
        toast.error("Add Cart Error")
       
      }
     
    } 
    }


    const getUserCart = async () => {
      try {
        const result = await axios.post(serverUrl + '/api/cart/get',{},{ withCredentials: true })

      setCartItem(result.data)
    } catch (error) {
      console.log(error)
     


    }
      
    }
    const updateQuantity = async (itemId , size , quantity) => {
      let cartData = structuredClone(cartItem);
    cartData[itemId][size] = quantity
    setCartItem(cartData)

    if (userData) {
      try {
        await axios.post(serverUrl + "/api/cart/update", { itemId, size, quantity }, { withCredentials: true })
      } catch (error) {
        console.log(error)
        
      }
    }
      
    }
     const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItem) {
      for (const item in cartItem[items]) {
        try {
          if (cartItem[items][item] > 0) {
            totalCount += cartItem[items][item]
          }
        } catch (error) {
          console.log("Error in cart count calculation:", error);
        }
      }
    }
    return totalCount
  }

  const getCartAmount = () => {
  let totalAmount = 0;
    for (const items in cartItem) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItem[items]) {
        try {
          if (cartItem[items][item] > 0) {
            // Apply discount if available
            const discountedPrice = itemInfo.discount > 0 ?
              itemInfo.price - (itemInfo.price * itemInfo.discount / 100) :
              itemInfo.price;
            totalAmount += discountedPrice * cartItem[items][item];
          }
        } catch (error) {
          console.log("Error in cart amount calculation:", error);
        }
      }
    }
    return totalAmount

  }

    useEffect(()=>{
     getProducts()
    },[])

    useEffect(() => {
    getUserCart()
  },[])

    // Update personalized recommendations when products or cart changes
    useEffect(() => {
        if (products.length > 0 && userData) {
            getPersonalizedRecommendations();
        }
    }, [products, cartItem, userData]);

    // Wishlist functions
    const addToWishlist = async (productId) => {
        try {
            const response = await axios.post(serverUrl + "/api/wishlist/add", { productId }, { withCredentials: true });
            if (response.data) {
                toast.success("Added to wishlist");
                getUserWishlist(); // Refresh wishlist
            }
        } catch (error) {
            console.log("Error adding to wishlist:", error);
            toast.error("Failed to add to wishlist");
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            const response = await axios.delete(serverUrl + `/api/wishlist/remove/${productId}`, { withCredentials: true });
            if (response.data) {
                toast.success("Removed from wishlist");
                getUserWishlist(); // Refresh wishlist
            }
        } catch (error) {
            console.log("Error removing from wishlist:", error);
            toast.error("Failed to remove from wishlist");
        }
    };

    const getUserWishlist = async () => {
        try {
            const response = await axios.get(serverUrl + "/api/wishlist/", { withCredentials: true });
            if (response.data) {
                setWishlist(response.data.wishlist);
            }
        } catch (error) {
            console.log("Error fetching wishlist:", error);
            setWishlist([]);
        }
    };

    const updateWishlistItem = async (productId, updates) => {
        try {
            const response = await axios.put(serverUrl + `/api/wishlist/update/${productId}`, updates, { withCredentials: true });
            if (response.data) {
                toast.success("Wishlist updated");
                getUserWishlist(); // Refresh wishlist
            }
        } catch (error) {
            console.log("Error updating wishlist item:", error);
            toast.error("Failed to update wishlist");
        }
    };

    const checkWishlistStatus = async (productId) => {
        try {
            const response = await axios.get(serverUrl + `/api/wishlist/check/${productId}`, { withCredentials: true });
            return response.data.isInWishlist;
        } catch (error) {
            console.log("Error checking wishlist status:", error);
            return false;
        }
    };

    // Load wishlist when user logs in
    useEffect(() => {
        if (userData) {
            getUserWishlist();
        } else {
            setWishlist([]);
        }
    }, [userData]);






    let value = {
      products, currency , delivery_fee,getProducts,search,setSearch,showSearch,setShowSearch,cartItem, addtoCart, getCartCount, setCartItem ,updateQuantity,getCartAmount,loading, personalizedProducts,
      wishlist, addToWishlist, removeFromWishlist, updateWishlistItem, checkWishlistStatus
    }
  return (
    <div>
    <shopDataContext.Provider value={value}>
      {children}
      </shopDataContext.Provider>
    </div>
  )
}

export default ShopContext
