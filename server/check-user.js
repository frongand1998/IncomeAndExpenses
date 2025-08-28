const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function checkUser(username) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ username: username });

    if (user) {
      console.log(`\n✅ User found: ${username}`);
      console.log(`Email: ${user.email}`);
      console.log(
        `Password hashed: ${user.password?.startsWith("$2") ? "Yes" : "No"}`
      );
      console.log(`Created: ${user.createdAt || "N/A"}`);
      console.log(`Updated: ${user.updatedAt || "N/A"}`);
    } else {
      console.log(`\n❌ User not found: ${username}`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Get username from command line argument
const username = process.argv[2];
if (!username) {
  console.log("Usage: node check-user.js <username>");
  console.log("Example: node check-user.js testuser");
  process.exit(1);
}

checkUser(username);
