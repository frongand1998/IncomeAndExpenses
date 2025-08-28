const mongoose = require("mongoose");
const Todo = require("./models/Todo");
require("dotenv").config();

async function listTodos() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const todos = await Todo.find({}).populate("user", "username email");

    console.log(`\n📝 Found ${todos.length} todos:`);

    if (todos.length === 0) {
      console.log("No todos in database");
    } else {
      todos.forEach((todo, index) => {
        console.log(`\n${index + 1}. "${todo.text}"`);
        console.log(
          `   Status: ${todo.completed ? "✅ Completed" : "⏳ Pending"}`
        );
        console.log(
          `   User: ${todo.user?.username || "Unknown"} (${todo.user?.email || "N/A"})`
        );
        console.log(
          `   Created: ${todo.createdAt ? new Date(todo.createdAt).toLocaleString() : "N/A"}`
        );
        if (todo.completedAt) {
          console.log(
            `   Completed: ${new Date(todo.completedAt).toLocaleString()}`
          );
        }
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

listTodos();
