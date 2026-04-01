import Return from "../model/returnModel.js";
import Order from "../model/orderModel.js";
import User from "../model/userModel.js";
import { sendReturnStatusEmail } from "../utils/sendStatusEmail.js";

// User: Submit a return request
export const requestReturn = async (req, res) => {
  try {
    console.log('=== REQUEST RETURN ===');
    console.log('Request body:', req.body);
    console.log('User from token:', req.user);
    
    const { orderId, reason, description, items } = req.body;
    const userId = req.user._id;

    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Check if order is delivered
    if (order.status !== 'Delivered') {
      return res.status(400).json({ success: false, message: "Order is not eligible for return" });
    }

    // Check if return already exists for this order
    const existingReturn = await Return.findOne({ orderId, userId });
    if (existingReturn) {
      return res.status(400).json({ success: false, message: "Return request already exists for this order" });
    }

    // Calculate refund amount (full order amount for now)
    const refundAmount = order.amount || 0;

    const returnRequest = new Return({
      userId,
      orderId,
      items: items || order.items,
      reason,
      description,
      status: 'Requested',
      refundAmount
    });

    await returnRequest.save();

    // Send email notification for return request
    try {
      const user = await User.findById(userId);
      if (user && user.email) {
        await sendReturnStatusEmail(user.email, 'Requested', {
          returnId: returnRequest._id,
          orderId: orderId,
          customerName: user.name,
          refundAmount: returnRequest.refundAmount || 0
        });
      }
    } catch (emailError) {
      console.log("Return request email error:", emailError);
      // Don't fail the return request if email fails
    }

    console.log('Return request saved:', returnRequest);

    return res.status(201).json({
      success: true,
      message: "Return request submitted successfully",
      return: returnRequest
    });

  } catch (error) {
    console.log("Request return error:", error);
    return res.status(500).json({ success: false, message: `Error: ${error.message}` });
  }
};

// User: Get their return requests
export const getUserReturns = async (req, res) => {
  try {
    console.log('=== GET USER RETURNS ===');
    console.log('User ID from request.user:', req.user._id);
    const userId = req.user._id;
    
    const returns = await Return.find({ userId })
      .populate('orderId')
      .sort({ createdAt: -1 });

    console.log('Found returns:', returns.length);
    console.log('Returns:', JSON.stringify(returns, null, 2));

    return res.status(200).json({
      success: true,
      returns
    });

  } catch (error) {
    console.log("Get user returns error:", error);
    return res.status(500).json({ success: false, message: `Error: ${error.message}` });
  }
};

// User: Get single return request
export const getUserReturnById = async (req, res) => {
  try {
    const userId = req.user._id;
    const returnId = req.params.id;

    const returnRequest = await Return.findOne({ _id: returnId, userId })
      .populate('orderId');

    if (!returnRequest) {
      return res.status(404).json({ success: false, message: "Return request not found" });
    }

    return res.status(200).json({
      success: true,
      return: returnRequest
    });

  } catch (error) {
    console.log("Get return by id error:", error);
    return res.status(500).json({ success: false, message: `Error: ${error.message}` });
  }
};

// Generate return label (stub - can be enhanced with PDF generation)
export const generateReturnLabel = async (req, res) => {
  try {
    const userId = req.user._id;
    const returnId = req.params.id;

    const returnRequest = await Return.findOne({ _id: returnId, userId })
      .populate('orderId');

    if (!returnRequest) {
      return res.status(404).json({ success: false, message: "Return request not found" });
    }

    // Generate a simple return label (in production, you'd generate a PDF)
    const returnLabel = {
      returnId: returnRequest._id,
      orderId: returnRequest.orderId._id,
      reason: returnRequest.reason,
      description: returnRequest.description,
      instructions: "Please pack the item securely and attach this label to the package.",
      createdAt: returnRequest.createdAt
    };

    return res.status(200).json({
      success: true,
      label: returnLabel,
      message: "Return label generated"
    });

  } catch (error) {
    console.log("Generate return label error:", error);
    return res.status(500).json({ success: false, message: `Error: ${error.message}` });
  }
};

// Admin: Get all returns
export const getAllReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate('userId', 'name email')
      .populate('orderId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      returns
    });

  } catch (error) {
    console.log("Get all returns error:", error);
    return res.status(500).json({ success: false, message: `Error: ${error.message}` });
  }
};

// Admin: Update return status
export const updateReturnStatus = async (req, res) => {
  try {
    const { status, refundAmount } = req.body;
    const returnId = req.params.id;

    console.log('=== UPDATE RETURN STATUS ===');
    console.log('Return ID:', returnId);
    console.log('New Status:', status);

    const returnRequest = await Return.findById(returnId);

    if (!returnRequest) {
      return res.status(404).json({ success: false, message: "Return request not found" });
    }

    console.log('Return Request userId:', returnRequest?.userId);

    // Fetch user data manually since userId is stored as String in Return model
    let userData = null;
    let userEmail = null;
    let customerName = null;
    
    if (returnRequest?.userId) {
      try {
        const User = (await import('../model/userModel.js')).default;
        userData = await User.findById(returnRequest.userId);
        userEmail = userData?.email;
        customerName = userData?.name;
      } catch (err) {
        console.log('Error fetching user:', err);
      }
    }
    
    // Also try to get email from the order if available
    if (!userEmail && returnRequest?.orderId) {
      try {
        const Order = (await import('../model/orderModel.js')).default;
        const order = await Order.findById(returnRequest.orderId);
        if (order?.address?.email) {
          userEmail = order.address.email;
          customerName = order.address.firstName || 'Customer';
          console.log('Using order address email as fallback:', userEmail);
        }
      } catch (err) {
        console.log('Error fetching order:', err);
      }
    }

    console.log('User Data:', customerName, userEmail);

    // Validate status
    const validStatuses = ['Requested', 'Approved', 'Picked Up', 'Completed', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    returnRequest.status = status;

    if (refundAmount !== undefined) {
      returnRequest.refundAmount = refundAmount;
    }

    if (status === 'Picked Up') {
      returnRequest.pickupDate = new Date();
    }

    if (status === 'Completed') {
      returnRequest.completedAt = new Date();
    }

    await returnRequest.save();

    // Send email notification to user
    console.log('Checking email - exists:', !!userEmail, 'includes @:', userEmail?.includes('@'));
    
    if (userEmail && userEmail.includes('@')) {
      try {
        console.log('Sending return status email from controller to:', userEmail, 'status:', status);
        await sendReturnStatusEmail(userEmail, status, {
          returnId: returnRequest._id,
          orderId: returnRequest.orderId,
          customerName: customerName,
          refundAmount: returnRequest.refundAmount || 0
        });
        console.log('Email sent successfully');
      } catch (emailError) {
        console.log("Return status email error:", emailError);
        // Don't fail the status update if email fails
      }
    } else {
      console.log('Skipping email - no valid email found');
    }

    return res.status(200).json({
      success: true,
      message: "Return status updated successfully",
      return: returnRequest
    });

  } catch (error) {
    console.log("Update return status error:", error);
    return res.status(500).json({ success: false, message: `Error: ${error.message}` });
  }
};

// Admin: Delete/Remove a return request
export const deleteReturn = async (req, res) => {
  try {
    const returnId = req.params.id;

    const returnRequest = await Return.findByIdAndDelete(returnId);

    if (!returnRequest) {
      return res.status(404).json({ success: false, message: "Return request not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Return request deleted successfully"
    });

  } catch (error) {
    console.log("Delete return error:", error);
    return res.status(500).json({ success: false, message: `Error: ${error.message}` });
  }
};