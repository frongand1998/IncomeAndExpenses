const express = require("express");
const router = express.Router();
const User = require("../models/User");

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
