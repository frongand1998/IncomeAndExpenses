const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function quickCheck() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    console.log("URI:", process.env.MONGO_URI ? "Found" : "Missing");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected successfully!");

    const users = await User.find({});
    console.log(`\n👥 Found ${users.length} users:`);

    if (users.length === 0) {
      console.log("❌ No users found in database!");
      console.log("💡 You need to register a user first.");
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: "${user.username}"`);
        console.log(`   Email: "${user.email}"`);
        console.log(
          `   Password hashed: ${user.password?.startsWith("$2") ? "✅" : "❌"}`
        );
      });

      // Check specifically for admin
      const adminUser = users.find((u) => u.username === "admin");
      if (adminUser) {
        console.log("\n🔑 Admin user found!");
      } else {
        console.log("\n❌ Admin user NOT found!");
        console.log(
          "Available usernames:",
          users.map((u) => u.username).join(", ")
        );
      }
    }
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

quickCheck();
