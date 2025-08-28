// Register admin user via API
const fetch = require("node-fetch");

async function registerAdmin() {
  try {
    console.log("🆕 Registering admin user...");

    const response = await fetch("http://localhost:3000/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "admin",
        email: "admin@example.com",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Admin user registered successfully!");
      console.log("Username:", data.user.username);
      console.log("Email:", data.user.email);
      console.log("Token:", data.token ? "Received" : "Not received");
    } else {
      console.log("❌ Registration failed:", data.error);
      if (data.error.includes("already exists")) {
        console.log("💡 Admin user already exists, trying to login...");
        await testLogin();
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function testLogin() {
  try {
    console.log("\n🔑 Testing admin login...");

    const response = await fetch("http://localhost:3000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "admin",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Login successful!");
      console.log("User:", data.user.username);
    } else {
      console.log("❌ Login failed:", data.error);
    }
  } catch (error) {
    console.error("❌ Login error:", error.message);
  }
}

registerAdmin();
