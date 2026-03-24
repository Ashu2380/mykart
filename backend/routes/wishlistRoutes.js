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


router.use(isAuth);


router.post('/add', addToWishlist);


router.delete('/remove/:productId', removeFromWishlist);

router.get('/', getWishlist);


router.put('/update/:itemId', updateWishlistItem);


router.get('/check/:productId', checkWishlistStatus);

export default router;
