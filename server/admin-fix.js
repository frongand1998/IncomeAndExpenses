console.log("Starting admin creation...");

// Simple admin creation script
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define User schema inline to avoid issues
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    settings: {
      currency: { type: String, default: "USD" },
      currencySymbol: { type: String, default: "$" },
    },
  },
  { timestamps: true }
);

// Add password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Add password comparison method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

async function main() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(
      "mongodb+srv://admin:RaahHXRsKaj1OMOn@cluster0.akzqchz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("Connected!");

    // Delete existing admin
    await User.deleteOne({ username: "admin" });
    console.log("Deleted existing admin");

    // Create new admin
    const admin = new User({
      username: "admin",
      password: "admin",
      email: "admin@example.com",
    });

    await admin.save();
    console.log("Admin created successfully!");

    // Test login
    const testUser = await User.findOne({ username: "admin" });
    const isValid = await testUser.comparePassword("admin");
    console.log("Password test:", isValid ? "PASS" : "FAIL");

    console.log("All done!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    process.exit(0);
  }
}

main();
