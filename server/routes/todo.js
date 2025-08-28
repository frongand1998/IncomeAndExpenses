const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");
const { authenticateToken } = require("../middleware/auth");

// Get all todos for authenticated user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(todos);
  } catch (err) {
    console.error("Get todos error:", err);
    res.status(400).json({ error: err.message || "Failed to get todos" });
  }
});

// Create todo for authenticated user
router.post("/", authenticateToken, async (req, res) => {
  try {
    const todoData = { ...req.body, user: req.user._id };
    const todo = new Todo(todoData);
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    console.error("Create todo error:", err);
    res.status(400).json({ error: err.message || "Failed to create todo" });
  }
});

// Update todo (only if owned by authenticated user)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({ error: "Todo not found or unauthorized" });
    }

    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedTodo);
  } catch (err) {
    console.error("Update todo error:", err);
    res.status(400).json({ error: err.message || "Failed to update todo" });
  }
});

// Delete todo (only if owned by authenticated user)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({ error: "Todo not found or unauthorized" });
    }

    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Todo deleted" });
  } catch (err) {
    console.error("Delete todo error:", err);
    res.status(400).json({ error: err.message || "Failed to delete todo" });
  }
});

module.exports = router;
