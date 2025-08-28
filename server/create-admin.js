const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function createAdminUser() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected successfully!");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: "admin" });

    if (existingAdmin) {
      console.log("👤 Admin user already exists!");
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(
        `   Password hashed: ${existingAdmin.password?.startsWith("$2") ? "✅ Yes" : "❌ No"}`
      );

      // If password is not hashed, update it
      if (!existingAdmin.password?.startsWith("$2")) {
        console.log("🔄 Updating password to be properly hashed...");
        existingAdmin.password = "admin"; // This will trigger the pre-save hash
        await existingAdmin.save();
        console.log("✅ Password updated and hashed!");
      }
    } else {
      console.log("🆕 Creating new admin user...");

      const adminUser = new User({
        username: "admin",
        password: "admin", // This will be automatically hashed by the pre-save middleware
        email: "admin@example.com",
      });

      await adminUser.save();
      console.log("✅ Admin user created successfully!");
      console.log("   Username: admin");
      console.log("   Password: admin");
      console.log("   Email: admin@example.com");
    }

    // Verify the user can be found and password works
    console.log("\n🔍 Verifying admin login...");
    const testUser = await User.findOne({ username: "admin" });
    if (testUser) {
      try {
        const passwordMatch = await testUser.comparePassword("admin");
        console.log(
          `🔑 Password verification: ${passwordMatch ? "✅ SUCCESS" : "❌ FAILED"}`
        );
      } catch (err) {
        console.log("❌ Password verification error:", err.message);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

createAdminUser();
