import User from "../model/userModel.js";
import Product from "../model/productModel.js";
import Notification from "../model/notificationModel.js";

// Add product to wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.userId;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if already in wishlist
        const user = await User.findById(userId);
        const existingItem = user.wishlist.find(item =>
            item.productId.toString() === productId
        );

        if (existingItem) {
            return res.status(400).json({ message: "Product already in wishlist" });
        }

        // Add to wishlist
        user.wishlist.push({
            productId,
            addedAt: new Date(),
            priceAlert: {
                enabled: true,
                targetPrice: null,
                lastNotifiedPrice: product.price
            }
        });

        await user.save();

        res.status(200).json({
            message: "Product added to wishlist",
            wishlistItem: user.wishlist[user.wishlist.length - 1]
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error adding to wishlist" });
    }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId);
        user.wishlist = user.wishlist.filter(item =>
            item.productId.toString() !== productId
        );

        await user.save();

        res.status(200).json({ message: "Product removed from wishlist" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error removing from wishlist" });
    }
};

// Get user's wishlist
export const getWishlist = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId).populate('wishlist.productId');
        const wishlistWithProducts = user.wishlist.map(item => ({
            ...item.toObject(),
            product: item.productId
        }));

        res.status(200).json({ wishlist: wishlistWithProducts });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching wishlist" });
    }
};

// Update wishlist item (price alert settings)
export const updateWishlistItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { priceAlert } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);
        const wishlistItem = user.wishlist.find(item =>
            item.productId.toString() === productId
        );

        if (!wishlistItem) {
            return res.status(404).json({ message: "Product not in wishlist" });
        }

        if (priceAlert) {
            wishlistItem.priceAlert = { ...wishlistItem.priceAlert, ...priceAlert };
        }

        await user.save();

        res.status(200).json({
            message: "Wishlist item updated",
            wishlistItem
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating wishlist item" });
    }
};

// Check if product is in wishlist
export const checkWishlistStatus = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId);
        const isInWishlist = user.wishlist.some(item =>
            item.productId.toString() === productId
        );

        res.status(200).json({ isInWishlist });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error checking wishlist status" });
    }
};
