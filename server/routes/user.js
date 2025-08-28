const express = require("express");
const router = express.Router();
const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { sendResetEmail } = require("../utils/email");
const { generateToken, authenticateToken } = require("../middleware/auth");

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ error: "username, password and email are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ error: "Username already exists" });
      }
      if (existingUser.email === email) {
        return res.status(409).json({ error: "Email already exists" });
      }
    }

    // Create new user (password will be hashed by pre-save middleware)
    const user = new User({ username, password, email });
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        settings: user.settings,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    if (err && err.code === 11000) {
      // Duplicate key error from Mongo
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(409).json({ error: `${field} already exists` });
    }
    res.status(400).json({ error: err.message || "Registration failed" });
  }
});

// Login with JWT
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Find user by username
    const user = await User.findOne({ username });
    console.log("🔍 Login attempt for username:", username);
    console.log("🔍 User found in database:", !!user);

    if (!user) {
      console.log("❌ User not found in database");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log(
      "🔍 Stored password (first 10 chars):",
      user.password.substring(0, 10)
    );
    console.log("🔍 Input password:", password);

    // Check password
    let isMatch = false;

    // First try with bcrypt (new hashed passwords)
    try {
      isMatch = await user.comparePassword(password);
      console.log("🔍 bcrypt comparison result:", isMatch);
    } catch (err) {
      console.log("🔍 bcrypt comparison failed, trying plain text...");
      // If bcrypt fails, check if it's a plain text password (legacy)
      if (user.password === password) {
        // Found legacy plain text password, hash it and save
        console.log("✅ Migrating legacy password for user:", username);
        user.password = password; // This will trigger the pre-save hash
        await user.save();
        isMatch = true;
      } else {
        console.log("❌ Plain text password comparison also failed");
      }
    }

    if (!isMatch) {
      console.log("❌ Final password match result: false");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("✅ Login successful for user:", username);

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        settings: user.settings,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(400).json({ error: err.message || "Login failed" });
  }
});

// Get current user profile (protected route)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      settings: req.user.settings,
      createdAt: req.user.createdAt,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(400).json({ error: err.message || "Failed to get profile" });
  }
});

// Get user settings (protected route)
router.get("/settings", authenticateToken, async (req, res) => {
  try {
    res.json(req.user.settings || { currency: "USD", currencySymbol: "$" });
  } catch (err) {
    console.error("Get settings error:", err);
    res.status(400).json({ error: err.message || "Failed to get settings" });
  }
});

// Update user settings (protected route)
router.put("/settings", authenticateToken, async (req, res) => {
  try {
    const { currency, currencySymbol } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          "settings.currency": currency,
          "settings.currencySymbol": currencySymbol,
        },
      },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.settings);
  } catch (err) {
    console.error("Update settings error:", err);
    res.status(400).json({ error: err.message || "Failed to update settings" });
  }
});

module.exports = router;

// --- Password Reset Flow ---

// Request password reset (send reset token)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });

    const user = await User.findOne({ email });
    // Don't reveal whether the email exists to avoid user enumeration
    if (!user)
      return res.json({
        message: "If that email exists, a reset link has been sent.",
      });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
    user.resetToken = token;
    user.resetTokenExpires = expires;
    await user.save();

    // Send reset email; do not expose whether email exists or the token value
    const provider = process.env.EMAIL_PROVIDER; // 'sendgrid' | 'resend'
    const frontendOrigin = process.env.FRONTEND_ORIGIN;
    if (!provider || !frontendOrigin) {
      console.warn("Email not sent: missing EMAIL_PROVIDER or FRONTEND_ORIGIN");
    } else {
      try {
        await sendResetEmail({
          provider,
          to: email,
          token,
          frontendOrigin,
        });
      } catch (mailErr) {
        console.error("Email send error:", mailErr);
      }
    }
    return res.json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(400).json({ error: err.message || "Failed to start reset" });
  }
});

// Reset password using token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "token and password are required" });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });
    if (!user)
      return res.status(400).json({ error: "Invalid or expired token" });

    // Password will be hashed by pre-save middleware
    user.password = password;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();
    return res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(400).json({ error: err.message || "Failed to reset password" });
  }
});

// Change password (protected route)
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ error: "currentPassword and newPassword are required" });

    // Verify current password
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid current password" });

    // Update password (will be hashed by pre-save middleware)
    req.user.password = newPassword;
    await req.user.save();
    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(400).json({ error: err.message || "Failed to change password" });
  }
});
