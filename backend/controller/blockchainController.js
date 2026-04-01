import dotenv from 'dotenv'
import Order from "../model/orderModel.js";
import User from "../model/userModel.js";
import { sendOrderStatusEmail } from "../utils/sendStatusEmail.js";
import { processReferralReward } from "./referralController.js";
import Notification from "../model/notificationModel.js";
import axios from 'axios'

dotenv.config()

// Ethereum Configuration (Sepolia Testnet)
const ETH_CONFIG = {
    depositWallet: process.env.ETH_DEPOSIT_WALLET || '0x0a24533bcC42755C603a39d2eC34F4d31C374022',
    network: 'sepolia', // Testnet
    chainId: 11155111, // Sepolia chain ID
    gasLimit: 21000
}

// Cardano Configuration (Preprod Testnet)
const ADA_CONFIG = {
    depositWallet: process.env.ADA_DEPOSIT_WALLET || 'addr_test1qzlx37p87pe8acwnqkxvkaztvcxq974usev98hdwghc75xq3mxv9u0e38txkc00nnnfmagc0ty3qk6kdmw7s9pwkm4usdkt00q',
    projectId: process.env.BLOCKFROST_ADA_PROJECT_ID || 'preprodJKrEjCnO0pmCBMQwb0UKt5GsuUQAyjH6',
    network: 'preprod'
}

// Crypto prices (in production, fetch from API)
const CRYPTO_PRICES = {
    ETH_USD: parseFloat(process.env.ETH_USD_PRICE) || 2500,
    ADA_USD: parseFloat(process.env.ADA_USD_PRICE) || 0.35
}

// Helper: Get ETH price in USD
const getEthPrice = async () => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        return response.data.ethereum.usd;
    } catch (error) {
        console.log('Using fallback ETH price');
        return CRYPTO_PRICES.ETH_USD;
    }
};

// Helper: Get ADA price in USD
const getAdaPrice = async () => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd');
        return response.data.cardano.usd;
    } catch (error) {
        console.log('Using fallback ADA price');
        return CRYPTO_PRICES.ADA_USD;
    }
};

// Helper: Convert INR to ETH
const inrToEth = (inrAmount) => {
    const usdAmount = inrAmount / 83; // Approximate INR to USD
    return usdAmount / CRYPTO_PRICES.ETH_USD;
};

// Helper: Convert INR to ADA
const inrToAda = (inrAmount) => {
    const usdAmount = inrAmount / 83;
    return usdAmount / CRYPTO_PRICES.ADA_USD;
};

// Check if user has MetaMask or compatible wallet
export const checkWalletConnection = async (req, res) => {
    try {
        const { walletType } = req.body;
        
        const result = {
            hasWallet: false,
            isConnected: false,
            address: null,
            network: null,
            balance: null
        };

        if (walletType === 'ethereum') {
            // Ethereum check is done on frontend
            result.walletType = 'ethereum';
        } else if (walletType === 'cardano') {
            // Check if Nami/Yoroi wallet is available
            result.walletType = 'cardano';
            // We'll check this on frontend
        }

        return res.status(200).json(result);
    } catch (error) {
        console.log('Wallet check error:', error);
        return res.status(500).json({ message: 'Error checking wallet' });
    }
};

// Create Ethereum payment order
export const createEthPayment = async (req, res) => {
    try {
        const { items, amount, address } = req.body;
        const userId = req.userId;

        // Get current ETH price
        const ethPrice = await getEthPrice();
        
        // Calculate ETH amount needed (with 5% buffer for gas)
        const ethAmount = (amount / ethPrice) * 1.05;

        // Create order in database
        const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod: 'Ethereum',
            payment: false,
            date: Date.now(),
            cryptoDetails: {
                currency: 'ETH',
                network: 'Sepolia Testnet',
                amount: ethAmount.toFixed(6),
                walletAddress: ETH_CONFIG.depositWallet,
                exchangeRate: ethPrice,
                status: 'pending'
            }
        };

        const newOrder = new Order(orderData);
        await newOrder.save();

        return res.status(200).json({
            orderId: newOrder._id,
            amount: ethAmount.toFixed(6),
            currency: 'ETH',
            network: 'Sepolia Testnet',
            walletAddress: ETH_CONFIG.depositWallet,
            exchangeRate: ethPrice,
            qrCode: `ethereum:${ETH_CONFIG.depositWallet}?amount=${ethAmount.toFixed(6)}`
        });
    } catch (error) {
        console.log('ETH payment creation error:', error);
        return res.status(500).json({ message: 'Error creating ETH payment' });
    }
};

// Create Cardano payment order
export const createAdaPayment = async (req, res) => {
    try {
        const { items, amount, address } = req.body;
        const userId = req.userId;

        // Get current ADA price
        const adaPrice = await getAdaPrice();
        
        // Calculate ADA amount needed (with 5% buffer for fees)
        const adaAmount = (amount / adaPrice) * 1.05;

        // Create order in database
        const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod: 'Cardano',
            payment: false,
            date: Date.now(),
            cryptoDetails: {
                currency: 'ADA',
                network: 'Preprod Testnet',
                amount: adaAmount.toFixed(6),
                walletAddress: ADA_CONFIG.depositWallet,
                exchangeRate: adaPrice,
                status: 'pending'
            }
        };

        const newOrder = new Order(orderData);
        await newOrder.save();

        return res.status(200).json({
            orderId: newOrder._id,
            amount: adaAmount.toFixed(6),
            currency: 'ADA',
            network: 'Preprod Testnet',
            walletAddress: ADA_CONFIG.depositWallet,
            exchangeRate: adaPrice
        });
    } catch (error) {
        console.log('ADA payment creation error:', error);
        return res.status(500).json({ message: 'Error creating ADA payment' });
    }
};

// Verify Ethereum payment
export const verifyEthPayment = async (req, res) => {
    try {
        const { orderId, transactionHash } = req.body;
        const userId = req.userId;

        console.log('=== ETH Payment Verification ===');
        console.log('userId:', userId);
        console.log('orderId:', orderId);
        console.log('transactionHash:', transactionHash);

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }
        if (!transactionHash) {
            return res.status(400).json({ message: 'Transaction hash required' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            console.log('Order not found for ID:', orderId);
            return res.status(404).json({ message: 'Order not found' });
        }

        console.log('Order found, userId in order:', order.userId);
        console.log('Current userId:', userId);
        console.log('Match:', order.userId?.toString() === userId);

        // Update order with transaction details
        order.payment = true;
        order.cryptoDetails = order.cryptoDetails || {};
        order.cryptoDetails.status = 'confirmed';
        order.cryptoDetails.transactionHash = transactionHash;
        order.razorpayPaymentId = transactionHash; // Using this field for crypto tx
        await order.save();

        console.log('Order updated successfully');

        // Clear cart
        try {
            await User.findByIdAndUpdate(userId, { cartData: {} });
            console.log('Cart cleared');
        } catch (cartError) {
            console.log('Cart clear error (non-critical):', cartError.message);
        }

        // Send order confirmation email
        try {
            const user = await User.findById(userId);
            if (user && user.email) {
                await sendOrderStatusEmail(user.email, 'Order Placed', {
                    orderId: order._id,
                    customerName: user.name || 'Customer',
                    items: order.items,
                    amount: order.amount,
                    paymentMethod: 'Ethereum (Testnet)'
                });
            }
        } catch (emailError) {
            console.log("Order email error:", emailError);
        }

        // Process referral rewards
        try {
            await processReferralReward(userId, order.amount);
        } catch (referralError) {
            console.log('Referral processing error:', referralError);
        }

        // Create notification
        try {
            const notification = new Notification({
                userId: userId,
                type: 'order_update',
                title: 'Payment Confirmed! 🎉',
                message: `Your Ethereum payment has been confirmed. Order #${order._id.toString().slice(-8)} is being processed.`,
                orderId: order._id,
                metadata: {
                    orderId: order._id,
                    orderStatus: 'placed',
                    amount: order.amount,
                    paymentMethod: 'Ethereum'
                }
            });
            await notification.save();
        } catch (notificationError) {
            console.log("Order notification error:", notificationError);
        }

        return res.status(200).json({
            message: 'Payment Successful',
            orderId: order._id
        });
    } catch (error) {
        console.log('ETH payment verification error:', error);
        return res.status(500).json({ message: 'Error verifying ETH payment' });
    }
};

// Verify Cardano payment
export const verifyAdaPayment = async (req, res) => {
    try {
        const { orderId, transactionHash } = req.body;
        const userId = req.userId;

        console.log('=== ADA Payment Verification ===');
        console.log('userId:', userId);
        console.log('orderId:', orderId);
        console.log('transactionHash:', transactionHash);

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }
        if (!transactionHash) {
            return res.status(400).json({ message: 'Transaction hash required' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            console.log('Order not found for ID:', orderId);
            return res.status(404).json({ message: 'Order not found' });
        }

        console.log('Order found, userId in order:', order.userId);
        console.log('Current userId:', userId);

        // For testnet demo, we'll accept the transaction without on-chain verification
        // In production, integrate with Blockfrost API for Cardano
        console.log('Cardano transaction submitted:', transactionHash);
        
        // Update order
        order.payment = true;
        order.cryptoDetails = order.cryptoDetails || {};
        order.cryptoDetails.status = 'confirmed';
        order.cryptoDetails.transactionHash = transactionHash;
        order.razorpayPaymentId = transactionHash;
        await order.save();

        console.log('ADA Order updated successfully');

        // Clear cart
        try {
            await User.findByIdAndUpdate(userId, { cartData: {} });
            console.log('Cart cleared');
        } catch (cartError) {
            console.log('Cart clear error (non-critical):', cartError.message);
        }

        // Send order confirmation email
        try {
            const user = await User.findById(userId);
            if (user && user.email) {
                await sendOrderStatusEmail(user.email, 'Order Placed', {
                    orderId: order._id,
                    customerName: user.name || 'Customer',
                    items: order.items,
                    amount: order.amount,
                    paymentMethod: 'Cardano (Testnet)'
                });
            }
        } catch (emailError) {
            console.log("Order email error:", emailError);
        }

        // Process referral rewards
        try {
            await processReferralReward(userId, order.amount);
        } catch (referralError) {
            console.log('Referral processing error:', referralError);
        }

        // Create notification
        try {
            const notification = new Notification({
                userId: userId,
                type: 'order_update',
                title: 'Payment Confirmed! 🎉',
                message: `Your Cardano payment has been confirmed. Order #${order._id.toString().slice(-8)} is being processed.`,
                orderId: order._id,
                metadata: {
                    orderId: order._id,
                    orderStatus: 'placed',
                    amount: order.amount,
                    paymentMethod: 'Cardano'
                }
            });
            await notification.save();
        } catch (notificationError) {
            console.log("Order notification error:", notificationError);
        }

        return res.status(200).json({
            message: 'Payment Successful',
            orderId: order._id
        });
    } catch (error) {
        console.log('ADA payment verification error:', error);
        return res.status(500).json({ message: 'Error verifying ADA payment' });
    }
};

// Check payment status (for polling)
export const checkCryptoPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({
            paymentStatus: order.payment,
            cryptoStatus: order.cryptoDetails?.status || 'pending',
            transactionHash: order.cryptoDetails?.transactionHash || null
        });
    } catch (error) {
        console.log('Payment status check error:', error);
        return res.status(500).json({ message: 'Error checking payment status' });
    }
};

// Get crypto prices for display
export const getCryptoPrices = async (req, res) => {
    try {
        const ethPrice = await getEthPrice();
        const adaPrice = await getAdaPrice();

        return res.status(200).json({
            ETH: ethPrice,
            ADA: adaPrice,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.log('Crypto prices error:', error);
        return res.status(200).json({
            ETH: CRYPTO_PRICES.ETH_USD,
            ADA: CRYPTO_PRICES.ADA_USD,
            lastUpdated: new Date().toISOString(),
            fallback: true
        });
    }
};
