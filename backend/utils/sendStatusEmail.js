import nodemailer from "nodemailer";

// Lazy transporter - only created when needed
const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
    secure: true,
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates for order status
const getEmailTemplate = (status, orderData) => {
  const { orderId, customerName, items, amount } = orderData;
  const orderNumber = orderId ? orderId.toString().slice(-8).toUpperCase() : 'N/A';
  
  const templates = {
    'Order Placed': {
      subject: `Order Received - #${orderNumber} | MyKart`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2196F3;">📝 Order Received!</h2>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>We have received your order and it is being processed.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> #${orderNumber}</p>
            <p><strong>Order Amount:</strong> ₹${amount}</p>
            <p><strong>Status:</strong> <span style="color: #2196F3; font-weight: bold;">Order Received</span></p>
          </div>
          <p>We will notify you once your order is processed and shipped. Thank you for shopping with MyKart!</p>
          <p>Best regards,<br>The MyKart Team</p>
        </div>
      `
    },
    'Packing': {
      subject: `Order Being Packed - #${orderNumber} | MyKart`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #FF9800;">📦 Order Being Packed</h2>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>Your order is being packed and prepared for shipment.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> #${orderNumber}</p>
            <p><strong>Order Amount:</strong> ₹${amount}</p>
            <p><strong>Status:</strong> <span style="color: #FF9800; font-weight: bold;">Packing</span></p>
          </div>
          <p>We will update you once your order is shipped. Thank you for your patience!</p>
          <p>Best regards,<br>The MyKart Team</p>
        </div>
      `
    },
    'Confirmed': {
      subject: `Order Confirmed - #${orderNumber} | MyKart`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50;">✅ Order Confirmed!</h2>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>Thank you for your order! We are pleased to confirm that your order has been received and is being processed.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> #${orderNumber}</p>
            <p><strong>Order Amount:</strong> ₹${amount}</p>
            <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Confirmed</span></p>
          </div>
          <p>We will notify you once your order is shipped. Thank you for shopping with MyKart!</p>
          <p>Best regards,<br>The MyKart Team</p>
        </div>
      `
    },
    'Processing': {
      subject: `Order Processing - #${orderNumber} | MyKart`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #FF9800;">📦 Order Processing</h2>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>Your order is being processed and is being prepared for shipment.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> #${orderNumber}</p>
            <p><strong>Order Amount:</strong> ₹${amount}</p>
            <p><strong>Status:</strong> <span style="color: #FF9800; font-weight: bold;">Processing</span></p>
          </div>
          <p>We will update you once your order is shipped. Thank you for your patience!</p>
          <p>Best regards,<br>The MyKart Team</p>
        </div>
      `
    },
    'Shipped': {
      subject: `Order Shipped - #${orderNumber} | MyKart`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2196F3;">🚚 Order Shipped!</h2>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>Great news! Your order has been shipped and is on its way to you.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> #${orderNumber}</p>
            <p><strong>Order Amount:</strong> ₹${amount}</p>
            <p><strong>Status:</strong> <span style="color: #2196F3; font-weight: bold;">Shipped</span></p>
          </div>
          <p>Track your order using the tracking link in your order details. Expected delivery in 3-5 business days.</p>
          <p>Thank you for shopping with MyKart!</p>
          <p>Best regards,<br>The MyKart Team</p>
        </div>
      `
    },
    'Out for Delivery': {
      subject: `Out for Delivery - #${orderNumber} | MyKart`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #9C27B0;">🚛 Out for Delivery!</h2>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>Your order is out for delivery today! Please be available to receive it.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> #${orderNumber}</p>
            <p><strong>Order Amount:</strong> ₹${amount}</p>
            <p><strong>Status:</strong> <span style="color: #9C27B0; font-weight: bold;">Out for Delivery</span></p>
          </div>
          <p>Our delivery partner will reach you soon. Please keep your phone available.</p>
          <p>Thank you for shopping with MyKart!</p>
          <p>Best regards,<br>The MyKart Team</p>
        </div>
      `
    },
    'Delivered': {
      subject: `Order Delivered - #${orderNumber} | MyKart`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50;">✅ Order Delivered!</h2>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>Your order has been delivered successfully! We hope you enjoy your purchase.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> #${orderNumber}</p>
            <p><strong>Order Amount:</strong> ₹${amount}</p>
            <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Delivered</span></p>
          </div>
          <p>Please take a moment to rate your experience and leave a review. Your feedback helps us improve!</p>
          <p>Thank you for shopping with MyKart!</p>
          <p>Best regards,<br>The MyKart Team</p>
        </div>
      `
    },
    'Cancelled': {
      subject: `Order Cancelled - #${orderNumber} | MyKart`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #F44336;">❌ Order Cancelled</h2>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>Your order has been cancelled as per your request.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> #${orderNumber}</p>
            <p><strong>Order Amount:</strong> ₹${amount}</p>
            <p><strong>Status:</strong> <span style="color: #F44336; font-weight: bold;">Cancelled</span></p>
          </div>
          <p>If you did not request this cancellation, please contact our support team immediately.</p>
          <p>We hope to serve you again soon!</p>
          <p>Best regards,<br>The MyKart Team</p>
        </div>
      `
    }
  };

  return templates[status] || {
    subject: `Order Update - #${orderNumber} | MyKart`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #607D8B;">Order Update</h2>
        <p>Dear <strong>${customerName}</strong>,</p>
        <p>Your order status has been updated.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> #${orderNumber}</p>
          <p><strong>Order Amount:</strong> ₹${amount}</p>
          <p><strong>New Status:</strong> ${status}</p>
        </div>
        <p>Thank you for shopping with MyKart!</p>
        <p>Best regards,<br>The MyKart Team</p>
      </div>
    `
  };
};

// Send order status email
export const sendOrderStatusEmail = async (email, status, orderData) => {
  // Validate email
  if (!email || typeof email !== 'string' || !email.includes('@') || email.trim().length === 0) {
    console.warn('Skipping order status email: invalid/missing email', email, 'for status:', status, 'orderId:', orderData?.orderId);
    return false;
  }

  // Validate environment variables
  if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
    console.error('EMAIL or EMAIL_PASS not configured in environment');
    return false;
  }

  try {
    console.log('Attempting to send order status email to:', email, 'status:', status);
    console.log('Using EMAIL:', process.env.EMAIL);
    
    const template = getEmailTemplate(status, orderData);
    
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: template.subject,
      html: template.html
    };

    const transporter = getTransporter();
    
    // Verify transporter is working
    await transporter.verify();
    console.log('Transporter verified successfully');
    
    await transporter.sendMail(mailOptions);
    console.log(`Order status email sent to ${email} for status: ${status}`);
    return true;
  } catch (error) {
    console.error('Error sending order status email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed - check EMAIL and EMAIL_PASS in .env file');
    }
    return false;
  }
};

// Email template for return status
const getReturnEmailTemplate = (status, returnData) => {
  const { returnId, orderId, customerName, refundAmount } = returnData;
  const returnNumber = returnId ? returnId.toString().slice(-8).toUpperCase() : 'N/A';
  const orderNumber = orderId ? orderId.toString().slice(-8).toUpperCase() : 'N/A';
  
  const templates = {
    'Requested': {
      subject: `Return Request Received - #${returnNumber} | MyKart`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #FF9800;">Return Request Received</h2>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>We have received your return request and it is being reviewed.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Return Details</h3>
            <p><strong>Return ID:</strong> #${returnNumber}</p>
            <p><strong>Order ID:</strong> #${orderNumber}</p>
            <p><strong>Refund Amount:</strong> ₹${refundAmount}</p>
            <p><strong>Status:</strong> <span style="color: #FF9800; font-weight: bold;">Pending Review</span></p>
          </div>
          <p>We will update you once your return request is processed. This usually takes 1-2 business days.</p>
          <p>Thank you for your patience!</p>
          <p>Best regards,<br>The MyKart Team</p>
        </div>
      `
    },
    'Approved': {
      subject: `Return Approved - #${returnNumber} | MyKart`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50;">✅ Return Approved!</h2>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>Great news! Your return request has been approved.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Return Details</h3>
            <p><strong>Return ID:</strong> #${returnNumber}</p>
            <p><strong>Order ID:</strong> #${orderNumber}</p>
            <p><strong>Refund Amount:</strong> ₹${refundAmount}</p>
            <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Approved</span></p>
          </div>
          <p>Your refund will be processed within 5-7 business days. The amount will be credited to your original payment method.</p>
          <p>Thank you for shopping with MyKart!</p>
          <p>Best regards,<br>The MyKart Team</p>
        </div>
      `
    },
    'Rejected': {
      subject: `Return Rejected - #${returnNumber} | MyKart`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #F44336;">Return Request Update</h2>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>We regret to inform you that your return request has been rejected.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Return Details</h3>
            <p><strong>Return ID:</strong> #${returnNumber}</p>
            <p><strong>Order ID:</strong> #${orderNumber}</p>
            <p><strong>Status:</strong> <span style="color: #F44336; font-weight: bold;">Rejected</span></p>
          </div>
          <p>If you have any questions about this decision, please contact our support team.</p>
          <p>Best regards,<br>The MyKart Team</p>
        </div>
      `
    },
    'Completed': {
      subject: `Return Completed - #${returnNumber} | MyKart`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50;">✅ Return Completed!</h2>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>Your return has been completed successfully and refund has been processed.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Return Details</h3>
            <p><strong>Return ID:</strong> #${returnNumber}</p>
            <p><strong>Order ID:</strong> #${orderNumber}</p>
            <p><strong>Refund Amount:</strong> ₹${refundAmount}</p>
            <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Completed</span></p>
          </div>
          <p>Please allow 5-7 business days for the refund to reflect in your account.</p>
          <p>Thank you for giving us the opportunity to serve you better!</p>
          <p>Best regards,<br>The MyKart Team</p>
        </div>
      `
    }
  };

  return templates[status] || {
    subject: `Return Update - #${returnNumber} | MyKart`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #607D8B;">Return Update</h2>
        <p>Dear <strong>${customerName}</strong>,</p>
        <p>Your return status has been updated.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Return Details</h3>
          <p><strong>Return ID:</strong> #${returnNumber}</p>
          <p><strong>Order ID:</strong> #${orderNumber}</p>
          <p><strong>New Status:</strong> ${status}</p>
        </div>
        <p>Best regards,<br>The MyKart Team</p>
      </div>
    `
  };
};

// Send return status email
export const sendReturnStatusEmail = async (email, status, returnData) => {
  // Validate email
  if (!email || typeof email !== 'string' || !email.includes('@') || email.trim().length === 0) {
    console.warn('Skipping return status email: invalid/missing email', email, 'for status:', status, 'returnId:', returnData?.returnId);
    return false;
  }

  // Validate environment variables
  if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
    console.error('EMAIL or EMAIL_PASS not configured in environment');
    return false;
  }

  try {
    console.log('Attempting to send return status email to:', email, 'status:', status);
    console.log('Using EMAIL:', process.env.EMAIL);
    
    const template = getReturnEmailTemplate(status, returnData);
    
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: template.subject,
      html: template.html
    };

    const transporter = getTransporter();
    
    // Verify transporter is working
    await transporter.verify();
    console.log('Transporter verified successfully');
    
    await transporter.sendMail(mailOptions);
    console.log(`Return status email sent to ${email} for status: ${status}`);
    return true;
  } catch (error) {
    console.error('Error sending return status email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed - check EMAIL and EMAIL_PASS in .env file');
    }
    return false;
  }
};

export default { sendOrderStatusEmail, sendReturnStatusEmail };
