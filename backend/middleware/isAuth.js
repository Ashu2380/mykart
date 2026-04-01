import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "No token, unauthorized" });
    }

    // Try to verify with JWT_SECRET first (for user tokens)
    let verifyToken;
    try {
      verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (userError) {
      // If JWT_SECRET fails, try JWT_SECRET1 (for admin tokens)
      try {
        verifyToken = jwt.verify(token, process.env.JWT_SECRET1);
      } catch (adminError) {
        // Both failed, token is invalid
        console.log("isAuth error: invalid signature - token verified with neither JWT_SECRET nor JWT_SECRET1");
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    if (!verifyToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // ✅ FIX: attach full user object
    // Check if it's an admin token (has email) or user token (has userId)
    if (verifyToken.email) {
      // Admin token
      req.user = {
        email: verifyToken.email,
        isAdmin: true
      };
    } else if (verifyToken.userId) {
      // User token
      req.user = {
        _id: verifyToken.userId,
      };
      // Also set userId for backward compatibility
      req.userId = verifyToken.userId;
    }

    next();
  } catch (error) {
    console.log("isAuth error:", error.message);
    return res.status(500).json({
      message: `isAuth error: ${error.message}`,
    });
  }
};

export default isAuth;