// Test login directly against the API
async function testLogin(username, password) {
  try {
    console.log(`🔍 Testing login for: ${username}`);

    const response = await fetch("http://localhost:3000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    console.log(`📡 Response status: ${response.status}`);

    const data = await response.json();
    console.log("📡 Response data:", data);

    if (response.ok) {
      console.log("✅ Login successful!");
      console.log("User:", data.user.username);
      console.log("Token received:", !!data.token);
    } else {
      console.log("❌ Login failed:", data.error);
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

// Test different variations
async function runTests() {
  console.log("🧪 Testing different login variations...\n");

  await testLogin("admin", "admin");
  console.log("\n" + "-".repeat(50) + "\n");

  await testLogin("Admin", "admin");
  console.log("\n" + "-".repeat(50) + "\n");

  await testLogin("admin", "Admin");
  console.log("\n" + "-".repeat(50) + "\n");

  await testLogin("testuser", "password");
}

runTests();
