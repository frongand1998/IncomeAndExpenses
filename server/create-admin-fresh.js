const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Remove existing admin if any
    await User.deleteOne({ username: "admin" });
    console.log("🗑️ Removed existing admin user");

    // Create fresh admin user
    const admin = new User({
      username: "admin",
      password: "admin",
      email: "admin@example.com",
    });

    await admin.save();
    console.log("✅ Created new admin user");

    // Verify it works
    const testAdmin = await User.findOne({ username: "admin" });
    const passwordWorks = await testAdmin.comparePassword("admin");
    console.log(`🔑 Password test: ${passwordWorks ? "SUCCESS" : "FAILED"}`);

    // Show all users
    const allUsers = await User.find({});
    console.log(`\n👥 Total users: ${allUsers.length}`);
    allUsers.forEach((user) => {
      console.log(`- ${user.username} (${user.email})`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
