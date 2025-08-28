const mongoose = require("mongoose");
const User = require("./models/User");
const Todo = require("./models/Todo");
const Note = require("./models/Note");
const IncomeExpense = require("./models/IncomeExpense");
require("dotenv").config();

async function checkDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n" + "=".repeat(50));
    console.log("📊 DATABASE OVERVIEW");
    console.log("=".repeat(50));

    // Check Users
    const users = await User.find({});
    console.log(`\n👥 USERS (${users.length} total):`);
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.username} (${user.email})`);
        console.log(
          `     Password hashed: ${user.password?.startsWith("$2") ? "✅ Yes" : "❌ No"}`
        );
        console.log(`     Created: ${user.createdAt || "N/A"}`);
      });
    } else {
      console.log("  No users found");
    }

    // Check Todos
    const todos = await Todo.find({}).populate("user", "username");
    console.log(`\n📝 TODOS (${todos.length} total):`);
    if (todos.length > 0) {
      todos.forEach((todo, index) => {
        console.log(
          `  ${index + 1}. "${todo.text}" - ${todo.completed ? "✅ Done" : "⏳ Pending"}`
        );
        console.log(`     User: ${todo.user?.username || "Unknown"}`);
        console.log(`     Created: ${todo.createdAt || "N/A"}`);
      });
    } else {
      console.log("  No todos found");
    }

    // Check Notes
    const notes = await Note.find({}).populate("user", "username");
    console.log(`\n📄 NOTES (${notes.length} total):`);
    if (notes.length > 0) {
      notes.forEach((note, index) => {
        console.log(`  ${index + 1}. "${note.title}"`);
        console.log(
          `     Content: ${note.content?.substring(0, 50)}${note.content?.length > 50 ? "..." : ""}`
        );
        console.log(`     User: ${note.user?.username || "Unknown"}`);
        console.log(`     Created: ${note.createdAt || "N/A"}`);
      });
    } else {
      console.log("  No notes found");
    }

    // Check Income/Expenses
    const incomeExpenses = await IncomeExpense.find({}).populate(
      "user",
      "username"
    );
    console.log(`\n💰 INCOME & EXPENSES (${incomeExpenses.length} total):`);
    if (incomeExpenses.length > 0) {
      let totalIncome = 0;
      let totalExpenses = 0;

      incomeExpenses.forEach((record, index) => {
        const amount = parseFloat(record.amount) || 0;
        if (record.type === "income") {
          totalIncome += amount;
        } else {
          totalExpenses += amount;
        }

        console.log(
          `  ${index + 1}. ${record.type === "income" ? "💚" : "❤️"} $${amount} - ${record.description}`
        );
        console.log(`     Category: ${record.category || "N/A"}`);
        console.log(`     User: ${record.user?.username || "Unknown"}`);
        console.log(`     Date: ${record.date || "N/A"}`);
      });

      console.log(`\n💰 FINANCIAL SUMMARY:`);
      console.log(`   Total Income: $${totalIncome.toFixed(2)}`);
      console.log(`   Total Expenses: $${totalExpenses.toFixed(2)}`);
      console.log(
        `   Net Balance: $${(totalIncome - totalExpenses).toFixed(2)}`
      );
    } else {
      console.log("  No income/expense records found");
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Database check complete!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Error connecting to database:", error.message);
    console.error("Full error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

checkDatabase();
