const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await User.find({}, "username email password");
    console.log("\n📊 Users in database:");
    console.log("Total users:", users.length);

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(
        `   Password (first 20 chars): ${user.password?.substring(0, 20)}...`
      );
      console.log(
        `   Password looks hashed: ${user.password?.startsWith("$2") ? "Yes" : "No"}`
      );
    });

    console.log("\n✅ Database check complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkUsers();
