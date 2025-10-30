import User from "../model/userModel.js"
import Product from "../model/productModel.js"
import Order from "../model/orderModel.js"
import bcrypt from "bcryptjs"


export const getCurrentUser = async (req,res) => {
    try {
        let user = await User.findById(req.userId).select("-password")
        if(!user){
           return res.status(404).json({message:"user is not found"}) 
        }
        return res.status(200).json(user)
    } catch (error) {
         console.log(error)
    return res.status(500).json({message:`getCurrentUser error ${error}`})
    }
}

export const getAdmin = async (req,res) => {
    try {
        let adminEmail = req.adminEmail;
        if(!adminEmail){
            return res.status(404).json({message:"Admin is not found"})
        }
        return res.status(201).json({
            email:adminEmail,
            role:"admin"
        })
    } catch (error) {
        console.log(error)
    return res.status(500).json({message:`getAdmin error ${error}`})
    }
}

export const getAllUsers = async (req,res) => {
    try {
        let users = await User.find({}).select("-password").sort({createdAt: -1});
        return res.status(200).json({
            success: true,
            users: users,
            total: users.length
        })
    } catch (error) {
        console.log(error)
    return res.status(500).json({message:`getAllUsers error ${error}`})
    }
}

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, dateOfBirth, gender, alternateEmail } = req.body;
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update only provided fields
        if (name !== undefined) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (gender !== undefined) user.gender = gender;
        if (alternateEmail !== undefined) user.alternateEmail = alternateEmail;

        await user.save();
        
        return res.status(200).json({ 
            success: true, 
            message: "Profile updated successfully",
            user: { ...user.toObject(), password: undefined }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: `Update profile error: ${error}` });
    }
};

// Get user addresses
export const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('addresses');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        return res.status(200).json({ 
            success: true, 
            addresses: user.addresses || [] 
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: `Get addresses error: ${error}` });
    }
};

// Add new address
export const addAddress = async (req, res) => {
    try {
        const { type, firstName, lastName, street, city, state, pinCode, country, phone, landmark, isDefault } = req.body;
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // If this is set as default, remove default from other addresses
        if (isDefault) {
            user.addresses.forEach(address => {
                address.isDefault = false;
            });
        }

        const newAddress = {
            type,
            firstName,
            lastName,
            street,
            city,
            state,
            pinCode,
            country: country || 'India',
            phone,
            landmark,
            isDefault: isDefault || false
        };

        user.addresses.push(newAddress);
        await user.save();
        
        return res.status(201).json({ 
            success: true, 
            message: "Address added successfully",
            address: newAddress
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: `Add address error: ${error}` });
    }
};

// Update existing address
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { type, firstName, lastName, street, city, state, pinCode, country, phone, landmark, isDefault } = req.body;
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        // If this is set as default, remove default from other addresses
        if (isDefault) {
            user.addresses.forEach(address => {
                address.isDefault = false;
            });
        }

        // Update the address
        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex].toObject(),
            type,
            firstName,
            lastName,
            street,
            city,
            state,
            pinCode,
            country: country || 'India',
            phone,
            landmark,
            isDefault: isDefault || false
        };

        await user.save();
        
        return res.status(200).json({ 
            success: true, 
            message: "Address updated successfully",
            address: user.addresses[addressIndex]
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: `Update address error: ${error}` });
    }
};

// Delete address
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        user.addresses.splice(addressIndex, 1);
        await user.save();
        
        return res.status(200).json({ 
            success: true, 
            message: "Address deleted successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: `Delete address error: ${error}` });
    }
};

// Set address as default
export const setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        // Remove default from all addresses
        user.addresses.forEach(address => {
            address.isDefault = false;
        });

        // Set the selected address as default
        user.addresses[addressIndex].isDefault = true;
        await user.save();
        
        return res.status(200).json({ 
            success: true, 
            message: "Default address updated successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: `Set default address error: ${error}` });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        // Hash new password
        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: `Change password error: ${error}` });
    }
};

// Get analytics data for admin dashboard
export const getAnalytics = async (req, res) => {
    try {
        // Get total counts from actual models
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        // Get category distribution from products
        const categoryStats = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Get monthly order stats (last 6 months)
        const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);
        const monthlyOrders = await Order.aggregate([
            { $match: { date: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m", date: { $toDate: "$createdAt" } }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Get user registration growth (last 6 months)
        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: new Date(sixMonthsAgo) } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Get order status distribution
        const orderStatusStats = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Get completed orders count (orders that are delivered)
        const completedOrders = await Order.countDocuments({
            status: 'Delivered'
        });

        // Get top selling products
        const topProducts = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items._id",
                    name: { $first: "$items.name" },
                    totalSold: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // Get recent orders
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name email');

        // Format data for charts
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const monthlyRevenue = monthlyOrders.map(order => order.revenue || 0);
        const categorySales = categoryStats.map(cat => cat.count);
        const userGrowthData = userGrowth.map(user => user.count);

        // Ensure we have 6 data points for charts
        while (monthlyRevenue.length < 6) monthlyRevenue.unshift(0);
        while (categorySales.length < 5) categorySales.push(0);
        while (userGrowthData.length < 6) userGrowthData.unshift(0);

        const analytics = {
            totalUsers,
            totalProducts,
            totalOrders,
            completedOrders,
            monthlyRevenue: monthlyRevenue.slice(-6),
            categorySales: categorySales.slice(0, 5),
            userGrowth: userGrowthData.slice(-6),
            categories: categoryStats.map(cat => cat._id).slice(0, 5),
            months,
            orderStatusStats,
            topProducts,
            recentOrders
        };

        return res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: `Analytics error: ${error}` });
    }
};

// Get user notifications
export const getNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('productId', 'name image1 price');

        const totalNotifications = await Notification.countDocuments({ userId });
        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        // Transform notifications for frontend
        const transformedNotifications = notifications.map(notification => ({
            id: notification._id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            productId: notification.productId,
            metadata: notification.metadata,
            isRead: notification.isRead,
            priority: notification.priority,
            createdAt: notification.createdAt,
            timeAgo: getTimeAgo(notification.createdAt)
        }));

        return res.status(200).json({
            success: true,
            notifications: transformedNotifications,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalNotifications / limit),
                totalNotifications,
                hasNextPage: page * limit < totalNotifications,
                hasPrevPage: page > 1
            },
            unreadCount
        });
    } catch (error) {
        console.log("Get notifications error", error);
        return res.status(500).json({ success: false, message: `Get notifications error: ${error.message}` });
    }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.userId;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification: {
                id: notification._id,
                isRead: notification.isRead
            }
        });
    } catch (error) {
        console.log("Mark notification as read error", error);
        return res.status(500).json({ success: false, message: `Mark notification as read error: ${error.message}` });
    }
};

// Delete notification
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.userId;

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            userId
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully"
        });
    } catch (error) {
        console.log("Delete notification error", error);
        return res.status(500).json({ success: false, message: `Delete notification error: ${error.message}` });
    }
};

// Helper function to get time ago
const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};