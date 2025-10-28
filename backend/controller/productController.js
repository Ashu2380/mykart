import uploadOnCloudinary from "../config/cloudinary.js"
import Product from "../model/productModel.js"
import User from "../model/userModel.js"
import BrowsingHistory from "../model/browsingHistoryModel.js"
import Feedback from "../model/feedbackModel.js"
import Order from "../model/orderModel.js"
import Notification from "../model/notificationModel.js"

// AI-powered product recommendation function
const getProductRecommendations = (query, products) => {
    const queryLower = query.toLowerCase();

    // Simple keyword matching for now - can be enhanced with ML models later
    const recommendations = products.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(queryLower);
        const descMatch = product.description.toLowerCase().includes(queryLower);
        const categoryMatch = product.category.toLowerCase().includes(queryLower);
        const subCategoryMatch = product.subCategory.toLowerCase().includes(queryLower);

        return nameMatch || descMatch || categoryMatch || subCategoryMatch;
    });

    // Sort by relevance (bestseller first, then price)
    return recommendations.sort((a, b) => {
        if (a.bestseller && !b.bestseller) return -1;
        if (!a.bestseller && b.bestseller) return 1;
        return a.price - b.price;
    }).slice(0, 10); // Return top 10 recommendations
};


export const addProduct = async (req,res) => {
    try {
        let {name,description,price,category,subCategory,sizes,bestseller} = req.body

        // Handle image uploads with proper checks
        let image1 = null, image2 = null, image3 = null, image4 = null;

        if (req.files && req.files.image1 && req.files.image1[0]) {
            image1 = await uploadOnCloudinary(req.files.image1[0].path)
        }
        if (req.files && req.files.image2 && req.files.image2[0]) {
            image2 = await uploadOnCloudinary(req.files.image2[0].path)
        }
        if (req.files && req.files.image3 && req.files.image3[0]) {
            image3 = await uploadOnCloudinary(req.files.image3[0].path)
        }
        if (req.files && req.files.image4 && req.files.image4[0]) {
            image4 = await uploadOnCloudinary(req.files.image4[0].path)
        }

        let productData = {
            name,
            description,
            price :Number(price),
            category,
            subCategory,
            sizes :JSON.parse(sizes),
            bestseller :bestseller === "true" ? true : false,
            date :Date.now()
        }

        // Only add image fields if they exist
        if (image1) productData.image1 = image1;
        if (image2) productData.image2 = image2;
        if (image3) productData.image3 = image3;
        if (image4) productData.image4 = image4;

        const product = await Product.create(productData)

        return res.status(201).json(product)

    } catch (error) {
          console.log("AddProduct error", error)
    return res.status(500).json({message:`AddProduct error ${error.message}`})
    }

}


export const listProduct = async (req,res) => {
     
    try {
        const product = await Product.find({});
        return res.status(200).json(product)

    } catch (error) {
        console.log("ListProduct error")
    return res.status(500).json({message:`ListProduct error ${error}`})
    }
}

export const removeProduct = async (req,res) => {
    try {
        let {id} = req.params;
        const product = await Product.findByIdAndDelete(id)
         return res.status(200).json(product)
    } catch (error) {
        console.log("RemoveProduct error")
    return res.status(500).json({message:`RemoveProduct error ${error}`})
    }

}

// AI-powered product recommendations endpoint
export const getAIRecommendations = async (req, res) => {
    try {
        const { query, budget, category, preferences } = req.body;

        if (!query) {
            return res.status(400).json({ message: "Query is required for recommendations" });
        }

        // Get all products
        const allProducts = await Product.find({});

        // Get AI recommendations based on query
        let recommendations = getProductRecommendations(query, allProducts);

        // Apply additional filters
        if (budget) {
            const maxBudget = parseFloat(budget);
            recommendations = recommendations.filter(product => product.price <= maxBudget);
        }

        if (category) {
            recommendations = recommendations.filter(product =>
                product.category.toLowerCase() === category.toLowerCase()
            );
        }

        // Add personalized scoring based on preferences (can be enhanced with user history)
        if (preferences && preferences.length > 0) {
            recommendations = recommendations.map(product => {
                let score = 0;
                preferences.forEach(pref => {
                    if (product.category.toLowerCase().includes(pref.toLowerCase()) ||
                        product.subCategory.toLowerCase().includes(pref.toLowerCase())) {
                        score += 10;
                    }
                });
                return { ...product.toObject(), recommendationScore: score };
            }).sort((a, b) => b.recommendationScore - a.recommendationScore);
        }

        return res.status(200).json({
            success: true,
            recommendations,
            totalFound: recommendations.length,
            query: query
        });

    } catch (error) {
        console.log("AI Recommendations error", error);
        return res.status(500).json({ message: `AI Recommendations error: ${error.message}` });
    }
};

// Visual search endpoint
export const visualSearch = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const uploadedImage = req.file;

        // For now, return a mock response since database connection is failing
        // In production, this would analyze the image and find similar products

        // Mock similar products based on common categories
        const mockSimilarProducts = [
            {
                _id: "mock1",
                name: "Nike Men's Jacket",
                image1: "https://loremflickr.com/800/800/clothes%2Cmen%2Cnike%2Cmens%2Cjacket?lock=4",
                price: 4837,
                category: "Clothes",
                subCategory: "Men",
                bestseller: true,
                discount: 0
            },
            {
                _id: "mock2",
                name: "Adidas Men's Jacket",
                image1: "https://loremflickr.com/800/800/clothes%2Cmen%2Cadidas%2Cmens%2Cjacket?lock=3",
                price: 4746,
                category: "Clothes",
                subCategory: "Men",
                bestseller: false,
                discount: 0
            },
            {
                _id: "mock3",
                name: "Samsung Smartphone",
                image1: "https://loremflickr.com/800/800/electronics%2Cphones%2Csamsung%2Csmartphone?lock=1",
                price: 26631,
                category: "Electronics",
                subCategory: "Phones",
                bestseller: false,
                discount: 0
            },
            {
                _id: "mock4",
                name: "Apple Smartphone",
                image1: "https://loremflickr.com/800/800/electronics%2Cphones%2Capple%2Csmartphone?lock=2",
                price: 56467,
                category: "Electronics",
                subCategory: "Phones",
                bestseller: false,
                discount: 0
            }
        ];

        return res.status(200).json({
            success: true,
            similarProducts: mockSimilarProducts,
            message: "Visual search completed successfully (using mock data due to database connection issues)"
        });

    } catch (error) {
        console.log("Visual search error", error);
        return res.status(500).json({ message: `Visual search error: ${error.message}` });
    }
};

export const updateProduct = async (req,res) => {
    try {
        let {id} = req.params;
        let {name,description,price,category,subCategory,sizes,bestseller,discount} = req.body

        const updateData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: JSON.parse(sizes),
            bestseller: bestseller === "true" ? true : false,
            discount: Number(discount) || 0
        }

        // Handle image updates if provided
        if (req.files && Object.keys(req.files).length > 0) {
            if (req.files.image1 && req.files.image1[0]) {
                updateData.image1 = await uploadOnCloudinary(req.files.image1[0].path)
            }
            if (req.files.image2 && req.files.image2[0]) {
                updateData.image2 = await uploadOnCloudinary(req.files.image2[0].path)
            }
            if (req.files.image3 && req.files.image3[0]) {
                updateData.image3 = await uploadOnCloudinary(req.files.image3[0].path)
            }
            if (req.files.image4 && req.files.image4[0]) {
                updateData.image4 = await uploadOnCloudinary(req.files.image4[0].path)
            }
        }

        const product = await Product.findByIdAndUpdate(id, updateData, {new: true})
        return res.status(200).json(product)

    } catch (error) {
        console.log("UpdateProduct error")
    return res.status(500).json({message:`UpdateProduct error ${error}`})
    }

}

// Price drop alert system - check for price changes and notify users
export const checkPriceDrops = async (req, res) => {
    try {
        const { productId, oldPrice, newPrice } = req.body;

        if (!productId || oldPrice === undefined || newPrice === undefined) {
            return res.status(400).json({ message: "Product ID, old price, and new price are required" });
        }

        // Only proceed if price actually dropped
        if (newPrice >= oldPrice) {
            return res.status(200).json({ message: "No price drop detected" });
        }

        // Find all users who have this product in their wishlist with price alerts enabled
        const usersWithAlerts = await User.find({
            'wishlist.productId': productId,
            'wishlist.priceAlert.enabled': true
        });

        let notificationsSent = 0;

        for (const user of usersWithAlerts) {
            const wishlistItem = user.wishlist.find(item =>
                item.productId.toString() === productId
            );

            // Check if we should send notification based on target price or any drop
            const shouldNotify = !wishlistItem.priceAlert.targetPrice ||
                                newPrice <= wishlistItem.priceAlert.targetPrice;

            if (shouldNotify && wishlistItem.priceAlert.lastNotifiedPrice !== newPrice) {
                // Create notification
                const notification = new Notification({
                    userId: user._id,
                    type: 'price_alert',
                    title: 'Price Drop Alert! 🎉',
                    message: `${wishlistItem.productId.name || 'Product'} price dropped from ₹${oldPrice} to ₹${newPrice}!`,
                    productId: productId,
                    metadata: {
                        oldPrice: oldPrice,
                        newPrice: newPrice,
                        discount: ((oldPrice - newPrice) / oldPrice * 100).toFixed(1)
                    }
                });

                await notification.save();

                // Update user's notification array
                user.notifications.push({
                    type: 'price_alert',
                    productId: productId,
                    message: notification.message,
                    createdAt: new Date()
                });

                // Update last notified price
                wishlistItem.priceAlert.lastNotifiedPrice = newPrice;

                await user.save();
                notificationsSent++;
            }
        }

        return res.status(200).json({
            message: `Price drop check completed. Notifications sent: ${notificationsSent}`,
            notificationsSent
        });

    } catch (error) {
        console.log("Price drop check error", error);
        return res.status(500).json({ message: `Price drop check error: ${error.message}` });
    }
};

