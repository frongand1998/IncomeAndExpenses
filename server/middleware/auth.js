const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET =
  process.env.JWT_SECRET || "your_fallback_secret_key_change_in_production";

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "Invalid token - user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(500).json({ error: "Token verification failed" });
  }
};

// Optional authentication (for endpoints that work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth,
  JWT_SECRET,
};
