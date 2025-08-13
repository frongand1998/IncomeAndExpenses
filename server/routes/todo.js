const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");

// Get all todos for a user
router.get("/:userId", async (req, res) => {
  const todos = await Todo.find({ user: req.params.userId });
  res.json(todos);
});

// Create todo
router.post("/", async (req, res) => {
  const todo = new Todo(req.body);
  await todo.save();
  res.status(201).json(todo);
});

// Update todo
router.put("/:id", async (req, res) => {
  const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(todo);
});

// Delete todo
router.delete("/:id", async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: "Todo deleted" });
});

module.exports = router;
