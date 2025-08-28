const mongoose = require("mongoose");
const User = require("./models/User");
const Todo = require("./models/Todo");
const Note = require("./models/Note");
const IncomeExpense = require("./models/IncomeExpense");
require("dotenv").config();

async function databaseStats() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔌 Connected to MongoDB");

    // Get counts
    const userCount = await User.countDocuments();
    const todoCount = await Todo.countDocuments();
    const noteCount = await Note.countDocuments();
    const incomeExpenseCount = await IncomeExpense.countDocuments();

    console.log("\n📊 DATABASE STATISTICS");
    console.log("=".repeat(30));
    console.log(`Users: ${userCount}`);
    console.log(`Todos: ${todoCount}`);
    console.log(`Notes: ${noteCount}`);
    console.log(`Income/Expenses: ${incomeExpenseCount}`);
    console.log(
      `Total Records: ${userCount + todoCount + noteCount + incomeExpenseCount}`
    );

    // Financial summary
    if (incomeExpenseCount > 0) {
      const incomeRecords = await IncomeExpense.find({ type: "income" });
      const expenseRecords = await IncomeExpense.find({ type: "expense" });

      const totalIncome = incomeRecords.reduce(
        (sum, record) => sum + (parseFloat(record.amount) || 0),
        0
      );
      const totalExpenses = expenseRecords.reduce(
        (sum, record) => sum + (parseFloat(record.amount) || 0),
        0
      );

      console.log("\n💰 FINANCIAL SUMMARY");
      console.log("=".repeat(30));
      console.log(`Income Records: ${incomeRecords.length}`);
      console.log(`Expense Records: ${expenseRecords.length}`);
      console.log(`Total Income: $${totalIncome.toFixed(2)}`);
      console.log(`Total Expenses: $${totalExpenses.toFixed(2)}`);
      console.log(`Net Balance: $${(totalIncome - totalExpenses).toFixed(2)}`);
    }

    // User activity
    if (userCount > 0) {
      console.log("\n👥 USER ACTIVITY");
      console.log("=".repeat(30));

      const users = await User.find({});
      for (const user of users) {
        const userTodos = await Todo.countDocuments({ user: user._id });
        const userNotes = await Note.countDocuments({ user: user._id });
        const userTransactions = await IncomeExpense.countDocuments({
          user: user._id,
        });

        console.log(`${user.username}:`);
        console.log(`  Todos: ${userTodos}`);
        console.log(`  Notes: ${userNotes}`);
        console.log(`  Transactions: ${userTransactions}`);
      }
    }

    console.log("\n✅ Statistics complete!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

databaseStats();
