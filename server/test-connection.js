console.log("🔍 Starting database test...");

const mongoose = require("mongoose");
require("dotenv").config();

async function testConnection() {
  try {
    console.log("🔌 MongoDB URI exists:", !!process.env.MONGO_URI);
    console.log("🔌 Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB successfully!");

    // Try to list collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "📊 Collections found:",
      collections.map((c) => c.name)
    );

    await mongoose.disconnect();
    console.log("🔌 Disconnected successfully");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Full error:", error);
  }

  process.exit(0);
}

testConnection();
