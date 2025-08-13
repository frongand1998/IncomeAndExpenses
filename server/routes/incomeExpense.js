const express = require("express");
const router = express.Router();
const IncomeExpense = require("../models/IncomeExpense");

// Get all records for a user
router.get("/:userId", async (req, res) => {
  const records = await IncomeExpense.find({ user: req.params.userId });
  res.json(records);
});

// Create record
router.post("/", async (req, res) => {
  const record = new IncomeExpense(req.body);
  await record.save();
  res.status(201).json(record);
});

// Update record
router.put("/:id", async (req, res) => {
  const record = await IncomeExpense.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(record);
});

// Delete record
router.delete("/:id", async (req, res) => {
  await IncomeExpense.findByIdAndDelete(req.params.id);
  res.json({ message: "Record deleted" });
});

module.exports = router;
