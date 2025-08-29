require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

async function debugLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/income_expenses",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("🔍 Connected to MongoDB");

    // Find admin user
    const user = await User.findOne({ username: "admin" });
    console.log("🔍 Admin user found:", !!user);

    if (user) {
      console.log("🔍 User details:");
      console.log("  Username:", user.username);
      console.log("  Email:", user.email);
      console.log("  Password hash:", user.password.substring(0, 30) + "...");

      // Test password comparison
      const testPassword = "admin";
      console.log("🔍 Testing password:", testPassword);

      try {
        const isMatch = await user.comparePassword(testPassword);
        console.log("✅ Password comparison result:", isMatch);
      } catch (err) {
        console.log("❌ Password comparison error:", err.message);

        // Try manual bcrypt compare
        try {
          const manualMatch = await bcrypt.compare(testPassword, user.password);
          console.log("🔧 Manual bcrypt comparison:", manualMatch);
        } catch (manualErr) {
          console.log("❌ Manual bcrypt error:", manualErr.message);
        }
      }
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

debugLogin();
