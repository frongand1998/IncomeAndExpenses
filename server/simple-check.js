const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const users = await User.find({});
    console.log(`\n👥 Total users: ${users.length}`);

    if (users.length === 0) {
      console.log("❌ No users found!");
      console.log("💡 Creating admin user...");

      const admin = new User({
        username: "admin",
        password: "admin",
        email: "admin@example.com",
      });

      await admin.save();
      console.log("✅ Admin user created!");
    } else {
      console.log("\n📋 Existing users:");
      users.forEach((user, i) => {
        console.log(`${i + 1}. "${user.username}" (${user.email})`);
        console.log(
          `   Password starts with: ${user.password.substring(0, 10)}...`
        );
        console.log(
          `   Is hashed: ${user.password.startsWith("$2") ? "Yes" : "No"}`
        );
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
