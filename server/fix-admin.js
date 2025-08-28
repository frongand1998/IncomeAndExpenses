// Simple user checker and creator
const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function checkAndCreateAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  // Check all users
  const allUsers = await User.find({});
  console.log("📋 All users in database:");
  allUsers.forEach((user) => {
    console.log(`- ${user.username} (${user.email})`);
  });

  // Check for admin specifically
  let admin = await User.findOne({ username: "admin" });

  if (!admin) {
    console.log("\n🆕 Creating admin user...");
    admin = new User({
      username: "admin",
      password: "admin",
      email: "admin@example.com",
    });
    await admin.save();
    console.log("✅ Admin user created!");
  } else {
    console.log("\n👤 Admin user already exists");
  }

  // Test password
  console.log("\n🔑 Testing admin password...");
  const isValid = await admin.comparePassword("admin");
  console.log(`Password 'admin' works: ${isValid ? "✅ YES" : "❌ NO"}`);

  await mongoose.disconnect();
  process.exit(0);
}

checkAndCreateAdmin().catch(console.error);
