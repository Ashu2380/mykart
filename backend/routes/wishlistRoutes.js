import express from 'express';
import {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    updateWishlistItem,
    checkWishlistStatus
} from '../controller/wishlistController.js';
import isAuth from '../middleware/isAuth.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(isAuth);

// Add product to wishlist
router.post('/add', addToWishlist);

// Remove product from wishlist
router.delete('/remove/:productId', removeFromWishlist);

// Get user's wishlist
router.get('/', getWishlist);

// Update wishlist item (price alert settings)
router.put('/update/:productId', updateWishlistItem);

// Check if product is in wishlist
router.get('/check/:productId', checkWishlistStatus);

export default router;
