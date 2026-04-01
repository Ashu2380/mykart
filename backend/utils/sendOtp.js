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

const sendOtp = async (email, otp) => {
  // Validate environment variables
  if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
    console.error('EMAIL or EMAIL_PASS not configured in environment');
    throw new Error('Email configuration missing');
  }
  
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('OTP Transporter verified successfully');
    
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "OTP for Mykart Registration",
      text: `Please use this OTP to verify your email: ${otp}`,
    });
    console.log('OTP sent successfully to:', email);
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    throw error;
  }
};

export default sendOtp;