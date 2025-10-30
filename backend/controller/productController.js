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
        let {name,description,price,category,subCategory,sizes,bestseller,discount} = req.body

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
            discount :Number(discount) || 0,
            date :Date.now(),
            isManual :true
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
        const userId = req.userId; // From auth middleware

        if (!query) {
            return res.status(400).json({ message: "Query is required for recommendations" });
        }

        // Get all manual products only (exclude AI-generated)
        const allProducts = await Product.find({ isManual: true });

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

        // Add personalized scoring based on preferences and user history
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

        // Create smart notification for search activity
        if (userId && recommendations.length > 0) {
            try {
                const notification = new Notification({
                    userId: userId,
                    type: 'recommendation',
                    title: 'Smart Recommendations Available!',
                    message: `Based on your search for "${query}", we found ${recommendations.length} products you might like.`,
                    metadata: {
                        searchQuery: query,
                        recommendationsCount: recommendations.length,
                        category: category || 'General'
                    }
                });
                await notification.save();
            } catch (notificationError) {
                console.log("Notification creation error:", notificationError);
                // Don't fail the main request if notification fails
            }
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

        // Get all manual products from database (exclude AI-generated)
        const allProducts = await Product.find({ isManual: true });

        if (allProducts.length === 0) {
            return res.status(200).json({
                success: true,
                similarProducts: [],
                message: "No products found in database"
            });
        }

        // Basic similarity matching based on category and subcategory patterns
        // This is a simple implementation - in production, use AI/computer vision APIs
        const { similarProducts, searchQuery } = findSimilarProducts(allProducts, uploadedImage);

        // Create smart notification for visual search activity
        if (req.userId) {
            try {
                const notification = new Notification({
                    userId: req.userId,
                    type: 'recommendation',
                    title: 'Visual Search Results!',
                    message: `Found ${similarProducts.length} products similar to your uploaded image.`,
                    metadata: {
                        searchType: 'visual',
                        resultsCount: similarProducts.length,
                        imageUploaded: true
                    }
                });
                await notification.save();
            } catch (notificationError) {
                console.log("Visual search notification error:", notificationError);
                // Don't fail the main request if notification fails
            }
        }

        return res.status(200).json({
            success: true,
            similarProducts: similarProducts,
            searchQuery: searchQuery || 'visual search',
            message: "Visual search completed successfully"
        });

    } catch (error) {
        console.log("Visual search error", error);
        return res.status(500).json({ message: `Visual search error: ${error.message}` });
    }
};

// Helper function to find similar products based on basic heuristics
function findSimilarProducts(allProducts, uploadedImage) {
    // For now, we'll use a simple approach based on filename patterns or random selection
    // In a real implementation, this would analyze the image using AI

    // Extract potential keywords from filename (if any)
    const filename = uploadedImage.originalname.toLowerCase();
    let categoryHints = [];
    let subCategoryHints = [];
    let searchQuery = '';

    // Simple keyword matching from filename
    if (filename.includes('shirt') || filename.includes('jacket') || filename.includes('clothes') || filename.includes('t-shirt') || filename.includes('top')) {
        categoryHints.push('Clothes');
        subCategoryHints.push('TopWear', 'WinterWear');
        searchQuery = 'shirt jacket clothes top';
    }
    if (filename.includes('phone') || filename.includes('laptop') || filename.includes('electronics') || filename.includes('smartphone') || filename.includes('mobile')) {
        categoryHints.push('Electronics');
        subCategoryHints.push('Phones', 'Laptops', 'Accessories');
        searchQuery = 'phone laptop electronics smartphone mobile';
    }
    if (filename.includes('book') || filename.includes('media') || filename.includes('movie') || filename.includes('fiction') || filename.includes('non-fiction')) {
        categoryHints.push('Books & Media');
        subCategoryHints.push('Fiction', 'Non-Fiction', 'Movies & TV');
        searchQuery = 'book media movie fiction non-fiction';
    }
    if (filename.includes('beauty') || filename.includes('health') || filename.includes('skincare') || filename.includes('haircare') || filename.includes('wellness')) {
        categoryHints.push('Beauty & Health');
        subCategoryHints.push('Skincare', 'Haircare', 'Wellness');
        searchQuery = 'beauty health skincare haircare wellness';
    }
    if (filename.includes('sports') || filename.includes('outdoor') || filename.includes('athletic') || filename.includes('camping') || filename.includes('fitness')) {
        categoryHints.push('Sports & Outdoors');
        subCategoryHints.push('Athletic Wear', 'Camping Gear', 'Fitness Equipment');
        searchQuery = 'sports outdoor athletic camping fitness';
    }
    if (filename.includes('home') || filename.includes('kitchen') || filename.includes('furniture') || filename.includes('cookware') || filename.includes('storage')) {
        categoryHints.push('Home & Kitchen');
        subCategoryHints.push('Furniture', 'Cookware', 'Storage');
        searchQuery = 'home kitchen furniture cookware storage';
    }
    if (filename.includes('toy') || filename.includes('game') || filename.includes('action') || filename.includes('board') || filename.includes('puzzle')) {
        categoryHints.push('Toys & Games');
        subCategoryHints.push('Action Figures', 'Board Games', 'Puzzles');
        searchQuery = 'toy game action board puzzle';
    }

    // If we found category hints, filter products
    let filteredProducts = allProducts;
    if (categoryHints.length > 0) {
        filteredProducts = allProducts.filter(product =>
            categoryHints.some(hint =>
                product.category.toLowerCase().includes(hint.toLowerCase())
            )
        );
    }

    // Further filter by subcategory if hints found
    if (filteredProducts.length > 0 && subCategoryHints.length > 0) {
        const subFiltered = filteredProducts.filter(product =>
            subCategoryHints.some(hint =>
                product.subCategory.toLowerCase().includes(hint.toLowerCase())
            )
        );
        // If subcategory filtering gives results, use them; otherwise keep category filtered
        if (subFiltered.length > 0) {
            filteredProducts = subFiltered;
        }
    }

    // If no category hints found, return random products
    if (categoryHints.length === 0) {
        const shuffledProducts = allProducts.sort(() => 0.5 - Math.random());
        return {
            similarProducts: shuffledProducts.slice(0, Math.min(8, shuffledProducts.length)),
            searchQuery: searchQuery
        };
    }

    // If no matches found after filtering, return random products from the category
    if (filteredProducts.length === 0) {
        const categoryProducts = allProducts.filter(product =>
            categoryHints.some(hint =>
                product.category.toLowerCase().includes(hint.toLowerCase())
            )
        );
        if (categoryProducts.length > 0) {
            const shuffledProducts = categoryProducts.sort(() => 0.5 - Math.random());
            return {
                similarProducts: shuffledProducts.slice(0, Math.min(8, shuffledProducts.length)),
                searchQuery: searchQuery
            };
        }
        // Fallback to random products
        const shuffledProducts = allProducts.sort(() => 0.5 - Math.random());
        return {
            similarProducts: shuffledProducts.slice(0, Math.min(8, shuffledProducts.length)),
            searchQuery: searchQuery
        };
    }

    // Shuffle and return top matches
    const shuffledProducts = filteredProducts.sort(() => 0.5 - Math.random());
    return {
        similarProducts: shuffledProducts.slice(0, Math.min(8, shuffledProducts.length)),
        searchQuery: searchQuery
    };
}

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

// Personalized recommendations based on user behavior
export const getPersonalizedRecommendations = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        // Get user's browsing history
        const browsingHistory = await BrowsingHistory.find({ userId }).sort({ timestamp: -1 }).limit(20);

        // Get user's wishlist
        const user = await User.findById(userId).populate('wishlist.productId');
        const wishlistItems = user ? user.wishlist.map(item => item.productId).filter(Boolean) : [];

        // Get user's order history for purchased items
        const userOrders = await Order.find({ userId }).populate('items.productId');
        const purchasedItems = [];
        userOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.productId) {
                    purchasedItems.push(item.productId);
                }
            });
        });

        // Get all manual products only (exclude AI-generated)
        const allProducts = await Product.find({ isManual: true });

        // Generate recommendations based on user behavior
        let recommendations = [];

        // 1. Based on browsing history categories
        if (browsingHistory.length > 0) {
            const browsedCategories = browsingHistory.map(h => h.category).filter(Boolean);
            const categoryRecommendations = allProducts.filter(product =>
                browsedCategories.includes(product.category) &&
                !purchasedItems.some(purchased => purchased._id.toString() === product._id.toString())
            );
            recommendations.push(...categoryRecommendations);
        }

        // 2. Based on wishlist categories
        if (wishlistItems.length > 0) {
            const wishlistCategories = wishlistItems.map(item => item.category).filter(Boolean);
            const wishlistRecommendations = allProducts.filter(product =>
                wishlistCategories.includes(product.category) &&
                !wishlistItems.some(wishItem => wishItem._id.toString() === product._id.toString()) &&
                !purchasedItems.some(purchased => purchased._id.toString() === product._id.toString())
            );
            recommendations.push(...wishlistRecommendations);
        }

        // 3. Based on purchased items categories
        if (purchasedItems.length > 0) {
            const purchasedCategories = purchasedItems.map(item => item.category).filter(Boolean);
            const purchaseRecommendations = allProducts.filter(product =>
                purchasedCategories.includes(product.category) &&
                !purchasedItems.some(purchased => purchased._id.toString() === product._id.toString())
            );
            recommendations.push(...purchaseRecommendations);
        }

        // Remove duplicates and limit to 10 recommendations
        const uniqueRecommendations = recommendations.filter((product, index, self) =>
            index === self.findIndex(p => p._id.toString() === product._id.toString())
        ).slice(0, 10);

        // If no recommendations based on history, return popular/best-selling manual products
        if (uniqueRecommendations.length === 0) {
            const popularProducts = await Product.find({ bestseller: true, isManual: true }).limit(10);
            return res.status(200).json(popularProducts);
        }

        return res.status(200).json(uniqueRecommendations);

    } catch (error) {
        console.log("Personalized recommendations error", error);
        return res.status(500).json({ message: `Personalized recommendations error: ${error.message}` });
    }
};

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

