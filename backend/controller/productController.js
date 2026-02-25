import uploadOnCloudinary from "../config/cloudinary.js"
import mongoose from 'mongoose'
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
        // Add timeout and error handling for database operations
        let allProducts = [];
        try {
            allProducts = await Product.find({ isManual: true }).maxTimeMS(15000);
        } catch (dbError) {
            console.log("Database query error:", dbError.message);
            return res.status(500).json({
                success: false,
                message: "Database connection issue. Please try again later."
            });
        }

        if (allProducts.length === 0) {
            return res.status(200).json({
                success: true,
                similarProducts: [],
                message: "No products found in database"
            });
        }

        // Enhanced similarity matching with multiple fallback strategies
        const { similarProducts, searchQuery, confidence } = findSimilarProducts(allProducts, uploadedImage);

        // If we have very few results, try additional fallback strategies
        let finalProducts = [...similarProducts];
        
        // If no products found at all, return random products from database
        if (finalProducts.length === 0) {
            const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
            finalProducts = shuffled.slice(0, 8);
        }
        let finalSearchQuery = searchQuery;

        if (finalProducts.length < 4) {
            // Fallback 1: Try color-based matching (if we can extract colors from filename)
            const colorFallback = findProductsByColor(allProducts, uploadedImage);
            if (colorFallback.length > 0) {
                finalProducts.push(...colorFallback.filter(product =>
                    !finalProducts.some(existing => existing._id.toString() === product._id.toString())
                ));
            }

            // Fallback 2: Try price range matching based on filename hints
            if (finalProducts.length < 6) {
                const priceFallback = findProductsByPriceRange(allProducts, uploadedImage);
                if (priceFallback.length > 0) {
                    finalProducts.push(...priceFallback.filter(product =>
                        !finalProducts.some(existing => existing._id.toString() === product._id.toString())
                    ));
                }
            }

            // Fallback 3: Popular products from same category if we have any category hint
            if (finalProducts.length < 8) {
                const categoryFallback = findPopularProductsInCategory(allProducts, uploadedImage);
                if (categoryFallback.length > 0) {
                    finalProducts.push(...categoryFallback.filter(product =>
                        !finalProducts.some(existing => existing._id.toString() === product._id.toString())
                    ));
                }
            }
        }

        // Limit to maximum 12 products and sort by relevance
        finalProducts = finalProducts.slice(0, 12);

        // Add relevance scoring for better results
        finalProducts = finalProducts.map(product => ({
            ...product.toObject(),
            relevanceScore: calculateRelevanceScore(product, uploadedImage, confidence)
        })).sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Create smart notification for visual search activity
        if (req.userId && finalProducts.length > 0) {
            try {
                const notification = new Notification({
                    userId: req.userId,
                    type: 'recommendation',
                    title: 'Visual Search Results!',
                    message: `Found ${finalProducts.length} products similar to your uploaded image.`,
                    metadata: {
                        searchType: 'visual',
                        resultsCount: finalProducts.length,
                        imageUploaded: true,
                        confidence: confidence
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
            similarProducts: finalProducts,
            searchQuery: finalSearchQuery || 'visual search',
            confidence: confidence,
            totalFound: finalProducts.length,
            message: finalProducts.length > 0 ?
                `Found ${finalProducts.length} similar products!` :
                "No similar products found. Try uploading a different image."
        });

    } catch (error) {
        console.log("Visual search error", error);
        return res.status(500).json({
            success: false,
            message: "Visual search failed. Please try again."
        });
    }
};

// Helper function to find similar products based on basic heuristics
function findSimilarProducts(allProducts, uploadedImage) {
    // Extract potential keywords from filename (if any)
    const filename = uploadedImage.originalname.toLowerCase();
    let categoryHints = [];
    let subCategoryHints = [];
    let searchQuery = '';
    let confidence = 0;

    // Enhanced keyword matching from filename - comprehensive patterns
    const keywordMappings = [
        {
            keywords: ['shirt', 'jacket', 'clothes', 't-shirt', 'top', 'dress', 'blouse', 'sweater', 'hoodie', 'coat', 'suit', 'jeans', 'pants', 'trouser', 'skirt', 'shorts', 'leggings', 'polo', 'cardigan', 'vest', 'blazer', 'kurti', 'sari', 'lehenga', 'salwar', 'churidar'],
            category: 'Clothes',
            subCategories: ['TopWear', 'WinterWear', 'BottomWear', 'Traditional Wear'],
            query: 'clothing fashion apparel wear',
            weight: 1.0
        },
        {
            keywords: ['phone', 'laptop', 'electronics', 'smartphone', 'mobile', 'computer', 'tablet', 'charger', 'headphone', 'earphone', 'speaker', 'mouse', 'keyboard', 'monitor', 'printer', 'router', 'smartwatch', 'earbuds', 'powerbank', 'adapter', 'cable', 'pendrive', 'harddisk', 'ssd'],
            category: 'Electronics',
            subCategories: ['Phones', 'Laptops', 'Accessories', 'Audio', 'Storage'],
            query: 'electronics gadgets tech devices',
            weight: 1.0
        },
        {
            keywords: ['book', 'media', 'movie', 'fiction', 'non-fiction', 'novel', 'magazine', 'cd', 'dvd', 'audiobook', 'ebook', 'comic', 'journal', 'newspaper', 'encyclopedia', 'textbook', 'biography', 'autobiography'],
            category: 'Books & Media',
            subCategories: ['Fiction', 'Non-Fiction', 'Movies & TV', 'Educational'],
            query: 'books media entertainment reading',
            weight: 0.9
        },
        {
            keywords: ['beauty', 'health', 'skincare', 'haircare', 'wellness', 'cosmetic', 'makeup', 'perfume', 'cream', 'lotion', 'shampoo', 'conditioner', 'facewash', 'moisturizer', 'lipstick', 'foundation', 'mascara', 'eyeliner', 'nailpolish', 'sunscreen', 'bodywash', 'deodorant', 'soap'],
            category: 'Beauty & Health',
            subCategories: ['Skincare', 'Haircare', 'Wellness', 'Makeup', 'Fragrance'],
            query: 'beauty health skincare cosmetics wellness',
            weight: 1.0
        },
        {
            keywords: ['sports', 'outdoor', 'athletic', 'camping', 'fitness', 'gym', 'running', 'cycling', 'ball', 'football', 'basketball', 'cricket', 'tennis', 'badminton', 'swimming', 'yoga', 'dumbbell', 'treadmill', 'bicycle', 'helmet', 'gloves', 'shoes', 'sneakers', 'boots', 'tent', 'sleepingbag'],
            category: 'Sports & Outdoors',
            subCategories: ['Athletic Wear', 'Camping Gear', 'Fitness Equipment', 'Sports Accessories'],
            query: 'sports outdoor fitness athletic camping',
            weight: 0.9
        },
        {
            keywords: ['home', 'kitchen', 'furniture', 'cookware', 'storage', 'appliance', 'decor', 'bedding', 'utensil', 'plate', 'bowl', 'cup', 'pan', 'pot', 'knife', 'spoon', 'fork', 'microwave', 'refrigerator', 'washingmachine', 'sofa', 'table', 'chair', 'bed', 'pillow', 'blanket', 'curtain', 'lamp', 'vase', 'carpet'],
            category: 'Home & Kitchen',
            subCategories: ['Furniture', 'Cookware', 'Storage', 'Appliances', 'Home Decor'],
            query: 'home kitchen furniture appliances decor',
            weight: 0.8
        },
        {
            keywords: ['toy', 'game', 'action', 'board', 'puzzle', 'doll', 'lego', 'video', 'console', 'playstation', 'xbox', 'nintendo', 'gaming', 'remote', 'car', 'bike', 'truck', 'teddy', 'stuffed', 'building', 'educational', 'learning', 'puzzle', 'card', 'chess', 'monopoly'],
            category: 'Toys & Games',
            subCategories: ['Action Figures', 'Board Games', 'Puzzles', 'Educational Toys', 'Video Games'],
            query: 'toys games entertainment kids play',
            weight: 0.9
        },
        {
            keywords: ['bag', 'wallet', 'belt', 'watch', 'jewelry', 'necklace', 'earring', 'ring', 'bracelet', 'sunglasses', 'hat', 'cap', 'scarf', 'tie', 'cufflinks', 'handbag', 'backpack', 'purse', 'sandal', 'flipflop'],
            category: 'Accessories',
            subCategories: ['Bags', 'Jewelry', 'Watches', 'Fashion Accessories'],
            query: 'accessories fashion jewelry bags',
            weight: 0.8
        },
        {
            keywords: ['food', 'grocery', 'snack', 'beverage', 'drink', 'coffee', 'tea', 'juice', 'water', 'milk', 'bread', 'rice', 'wheat', 'sugar', 'salt', 'oil', 'spice', 'vegetable', 'fruit', 'meat', 'fish', 'chicken', 'egg'],
            category: 'Food & Grocery',
            subCategories: ['Snacks', 'Beverages', 'Staples', 'Fresh Produce'],
            query: 'food grocery snacks beverages',
            weight: 0.7
        }
    ];

    // Check filename against all keyword mappings
    for (const mapping of keywordMappings) {
        const matches = mapping.keywords.filter(keyword => filename.includes(keyword));
        if (matches.length > 0) {
            categoryHints.push(mapping.category);
            subCategoryHints.push(...mapping.subCategories);
            if (!searchQuery) {
                searchQuery = mapping.query;
            }
            confidence += matches.length * mapping.weight;
        }
    }

    let similarProducts = [];

    // If we found category hints, filter products by category and subcategory
    if (categoryHints.length > 0) {
        let filteredProducts = allProducts.filter(product =>
            categoryHints.some(hint =>
                product.category.toLowerCase().includes(hint.toLowerCase()) ||
                hint.toLowerCase().includes(product.category.toLowerCase())
            )
        );

        // Further filter by subcategory if hints found
        if (filteredProducts.length > 0 && subCategoryHints.length > 0) {
            const subFiltered = filteredProducts.filter(product =>
                subCategoryHints.some(hint =>
                    product.subCategory.toLowerCase().includes(hint.toLowerCase()) ||
                    hint.toLowerCase().includes(product.subCategory.toLowerCase())
                )
            );
            if (subFiltered.length > 0) {
                filteredProducts = subFiltered;
            }
        }

        if (filteredProducts.length > 0) {
            // Sort by relevance (bestseller first, then price) and shuffle
            const sortedProducts = filteredProducts.sort((a, b) => {
                if (a.bestseller && !b.bestseller) return -1;
                if (!a.bestseller && b.bestseller) return 1;
                return a.price - b.price;
            });
            const shuffledProducts = sortedProducts.sort(() => 0.5 - Math.random());
            similarProducts = shuffledProducts.slice(0, Math.min(8, shuffledProducts.length));
        }
    }

    // Enhanced text matching against product names/descriptions
    if (similarProducts.length < 6) {
        const filenameWords = filename.split(/[^a-zA-Z0-9]/).filter(word => word.length > 2);

        const textMatchingProducts = allProducts.filter(product => {
            const productName = product.name.toLowerCase();
            const productDesc = product.description ? product.description.toLowerCase() : '';

            // Check for exact word matches or partial matches
            return filenameWords.some(word => {
                // Exact match
                if (productName.includes(word) || productDesc.includes(word)) {
                    return true;
                }
                // Partial match (word contains filename word or vice versa)
                const nameWords = productName.split(/[^a-zA-Z0-9]/);
                const descWords = productDesc.split(/[^a-zA-Z0-9]/);
                const allWords = [...nameWords, ...descWords];

                return allWords.some(prodWord =>
                    prodWord.length > 2 &&
                    (prodWord.includes(word) || word.includes(prodWord))
                );
            });
        }).filter(product => !similarProducts.some(sim => sim._id.toString() === product._id.toString())); // Avoid duplicates

        if (textMatchingProducts.length > 0) {
            // Sort text matches by relevance
            const sortedTextProducts = textMatchingProducts.sort((a, b) => {
                if (a.bestseller && !b.bestseller) return -1;
                if (!a.bestseller && b.bestseller) return 1;
                return a.price - b.price;
            });
            const shuffledTextProducts = sortedTextProducts.sort(() => 0.5 - Math.random());
            similarProducts.push(...shuffledTextProducts.slice(0, Math.min(8 - similarProducts.length, shuffledTextProducts.length)));
        }
    }

    // If still no matches or low confidence, try broader category matching
    if (similarProducts.length === 0 || confidence < 1.0) {
        // Try to match against all product names and descriptions with broader terms
        const broadMatches = allProducts.filter(product => {
            const productText = (product.name + ' ' + (product.description || '')).toLowerCase();
            const filenameWords = filename.split(/[^a-zA-Z0-9]/).filter(word => word.length > 1);

            return filenameWords.some(word =>
                productText.includes(word) ||
                // Check for similar sounding words or common variations
                productText.includes(word.slice(0, -1)) || // Remove last character
                productText.includes(word + 's') || // Add plural
                productText.includes(word.slice(0, -2)) // Remove last 2 characters
            );
        });

        if (broadMatches.length > 0) {
            const sortedBroadMatches = broadMatches.sort((a, b) => {
                if (a.bestseller && !b.bestseller) return -1;
                if (!a.bestseller && b.bestseller) return 1;
                return a.price - b.price;
            });
            const shuffledBroadMatches = sortedBroadMatches.sort(() => 0.5 - Math.random());
            similarProducts.push(...shuffledBroadMatches.slice(0, Math.min(8 - similarProducts.length, shuffledBroadMatches.length)));
        }
    }

    // If still no matches, return bestseller products as "popular items you might like"
    if (similarProducts.length === 0) {
        const bestsellerProducts = allProducts.filter(product => product.bestseller === true);
        if (bestsellerProducts.length > 0) {
            const shuffledBestsellers = bestsellerProducts.sort(() => 0.5 - Math.random());
            similarProducts = shuffledBestsellers.slice(0, Math.min(8, shuffledBestsellers.length));
            searchQuery = 'popular products';
        } else {
            // Last resort: return random products from different categories
            const categories = [...new Set(allProducts.map(p => p.category))];
            const productsByCategory = categories.map(cat =>
                allProducts.filter(p => p.category === cat).slice(0, 2)
            ).flat();

            if (productsByCategory.length > 0) {
                similarProducts = productsByCategory.sort(() => 0.5 - Math.random()).slice(0, 8);
                searchQuery = 'featured products';
            } else {
                // Absolute last resort: return any random products
                const shuffledProducts = allProducts.sort(() => 0.5 - Math.random());
                similarProducts = shuffledProducts.slice(0, Math.min(8, shuffledProducts.length));
                searchQuery = 'recommended products';
            }
        }
    }

    return {
        similarProducts: similarProducts,
        searchQuery: searchQuery || 'similar products',
        confidence: confidence
    };
}

// Fallback function: Find products by color hints in filename
function findProductsByColor(allProducts, uploadedImage) {
    const filename = uploadedImage.originalname.toLowerCase();
    const colorKeywords = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown', 'gray', 'grey', 'silver', 'gold', 'navy', 'maroon', 'beige', 'cream', 'turquoise', 'violet'];

    const detectedColors = colorKeywords.filter(color => filename.includes(color));

    if (detectedColors.length === 0) return [];

    const colorProducts = allProducts.filter(product => {
        const productText = (product.name + ' ' + (product.description || '')).toLowerCase();
        return detectedColors.some(color => productText.includes(color));
    });

    return colorProducts.slice(0, 4);
}

// Fallback function: Find products by price range hints
function findProductsByPriceRange(allProducts, uploadedImage) {
    const filename = uploadedImage.originalname.toLowerCase();

    // Look for price hints in filename (like "budget", "expensive", "cheap", "premium")
    let priceRange = null;
    if (filename.includes('budget') || filename.includes('cheap') || filename.includes('affordable') || filename.includes('low') || filename.includes('basic')) {
        priceRange = 'low';
    } else if (filename.includes('premium') || filename.includes('expensive') || filename.includes('luxury') || filename.includes('high') || filename.includes('costly')) {
        priceRange = 'high';
    }

    if (!priceRange) return [];

    // Calculate price quartiles
    const prices = allProducts.map(p => p.price).sort((a, b) => a - b);
    const lowThreshold = prices[Math.floor(prices.length * 0.25)];
    const highThreshold = prices[Math.floor(prices.length * 0.75)];

    let filteredProducts;
    if (priceRange === 'low') {
        filteredProducts = allProducts.filter(p => p.price <= lowThreshold);
    } else {
        filteredProducts = allProducts.filter(p => p.price >= highThreshold);
    }

    return filteredProducts.slice(0, 4);
}

// Fallback function: Find popular products in detected categories
function findPopularProductsInCategory(allProducts, uploadedImage) {
    const filename = uploadedImage.originalname.toLowerCase();
    const categoryKeywords = {
        'clothes': ['shirt', 'jacket', 'dress', 'pants', 'top', 'wear'],
        'electronics': ['phone', 'laptop', 'computer', 'device', 'gadget'],
        'books': ['book', 'novel', 'magazine', 'read'],
        'beauty': ['cream', 'makeup', 'cosmetic', 'beauty'],
        'sports': ['sports', 'fitness', 'gym', 'athletic'],
        'home': ['home', 'kitchen', 'furniture', 'decor'],
        'toys': ['toy', 'game', 'play', 'kids']
    };

    let detectedCategory = null;
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => filename.includes(keyword))) {
            detectedCategory = category;
            break;
        }
    }

    if (!detectedCategory) return [];

    // Find bestseller products in the detected category
    const categoryProducts = allProducts.filter(product =>
        product.category.toLowerCase().includes(detectedCategory) ||
        detectedCategory.includes(product.category.toLowerCase())
    );

    const bestsellers = categoryProducts.filter(product => product.bestseller === true);
    if (bestsellers.length > 0) {
        return bestsellers.slice(0, 4);
    }

    // If no bestsellers, return highest rated (by price as proxy) products
    return categoryProducts
        .sort((a, b) => b.price - a.price)
        .slice(0, 4);
}

// Calculate relevance score for products
function calculateRelevanceScore(product, uploadedImage, baseConfidence) {
    let score = baseConfidence;

    const filename = uploadedImage.originalname.toLowerCase();
    const productText = (product.name + ' ' + (product.description || '')).toLowerCase();

    // Exact word matches get higher score
    const filenameWords = filename.split(/[^a-zA-Z0-9]/).filter(word => word.length > 2);
    const exactMatches = filenameWords.filter(word => productText.includes(word)).length;
    score += exactMatches * 2;

    // Bestseller bonus
    if (product.bestseller) {
        score += 1;
    }

    // Recent products bonus (assuming newer products are more relevant)
    const productAge = Date.now() - new Date(product.date).getTime();
    const daysOld = productAge / (1000 * 60 * 60 * 24);
    if (daysOld < 30) {
        score += 0.5; // Boost recent products
    }

    // Price normalization (prefer mid-range products)
    const normalizedPrice = Math.min(product.price / 10000, 1); // Cap at 10k
    score += (1 - Math.abs(normalizedPrice - 0.5)) * 0.5; // Prefer mid-range

    return score;
}

export const updateProduct = async (req,res) => {
    try {
        let {id} = req.params;
        let {name,description,price,category,subCategory,sizes,bestseller,discount} = req.body

        const oldProduct = await Product.findById(id);
        if (!oldProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

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

        // Check for price drops and send notifications to users with price alerts
        if (price && Number(price) < oldProduct.price) {
            console.log(`Price drop detected for product ${id}: ₹${oldProduct.price} -> ₹${price}`);
            
            // Find all users who have this product in their wishlist with price alerts enabled
            const usersWithAlerts = await User.find({
                'wishlist.productId': new mongoose.Types.ObjectId(id),
                'wishlist.priceAlert.enabled': true
            });
            
            console.log(`Found ${usersWithAlerts.length} users with price alerts for this product`);
            
            if (usersWithAlerts.length === 0) {
                console.log('No users found with price alerts. Checking user wishlists...');
                // Debug: check what's in the wishlists
                const allUsers = await User.find({}, 'wishlist');
                for (const user of allUsers) {
                    for (const item of user.wishlist) {
                        if (item.productId.toString() === id) {
                            console.log(`User ${user._id} has product in wishlist with priceAlert:`, item.priceAlert);
                        }
                    }
                }
            }

            let notificationsSent = 0;

            for (const user of usersWithAlerts) {
                const wishlistItem = user.wishlist.find(item =>
                    item.productId.toString() === id
                );

                // Check if we should send notification based on target price or any drop
                const shouldNotify = !wishlistItem.priceAlert.targetPrice ||
                                    Number(price) <= wishlistItem.priceAlert.targetPrice;
                
                console.log(`Checking user ${user._id}: targetPrice=${wishlistItem.priceAlert.targetPrice}, lastNotifiedPrice=${wishlistItem.priceAlert.lastNotifiedPrice}, shouldNotify=${shouldNotify}`);

                if (shouldNotify && wishlistItem.priceAlert.lastNotifiedPrice !== Number(price)) {
                    console.log(`Creating price drop notification for user ${user._id}`);
                    // Create smart notification for price drop
                    const notification = new Notification({
                        userId: user._id,
                        type: 'price_alert',
                        title: 'Price Drop Alert! 🎉',
                        message: `${product.name} price dropped from ₹${oldProduct.price} to ₹${price}!`,
                        productId: id,
                        metadata: {
                            oldPrice: oldProduct.price,
                            newPrice: Number(price),
                            discount: ((oldProduct.price - Number(price)) / oldProduct.price * 100).toFixed(1),
                            targetPrice: wishlistItem.priceAlert.targetPrice || null
                        },
                        priority: 'high'
                    });

                    await notification.save();

                    // Update last notified price
                    wishlistItem.priceAlert.lastNotifiedPrice = Number(price);
                    await user.save();
                    notificationsSent++;
                }
            }

            console.log(`Price drop notifications sent: ${notificationsSent}`);
        }

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
            'wishlist.productId': new mongoose.Types.ObjectId(productId),
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

