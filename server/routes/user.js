const express = require("express");
const router = express.Router();
const User = require("../models/User");
const crypto = require("crypto");
const { sendResetEmail } = require("../utils/email");

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ error: "username, password and email are required" });
    }
    const user = new User({ username, password, email });
    await user.save();
    res.status(201).json(user);
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

// Login (dummy, no JWT yet)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json(user);
  } catch (err) {
    console.error("Login error:", err);
    res.status(400).json({ error: err.message || "Login failed" });
  }
});

// Get user settings
router.get("/:userId/settings", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.settings || { currency: "USD", currencySymbol: "$" });
  } catch (err) {
    console.error("Get settings error:", err);
    res.status(400).json({ error: err.message || "Failed to get settings" });
  }
});

// Update user settings
router.put("/:userId/settings", async (req, res) => {
  try {
    const { currency, currencySymbol } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
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

    user.password = password; // Note: passwords are plain-text in this app currently
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();
    return res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(400).json({ error: err.message || "Failed to reset password" });
  }
});

// Change password (authenticated by username+current password for now)
router.post("/change-password", async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    if (!username || !currentPassword || !newPassword)
      return res
        .status(400)
        .json({ error: "username, currentPassword, newPassword are required" });

    const user = await User.findOne({ username, password: currentPassword });
    if (!user)
      return res.status(401).json({ error: "Invalid current password" });

    user.password = newPassword;
    await user.save();
    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(400).json({ error: err.message || "Failed to change password" });
  }
});
