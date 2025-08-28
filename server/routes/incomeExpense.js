const express = require("express");
const router = express.Router();
const IncomeExpense = require("../models/IncomeExpense");
const { authenticateToken } = require("../middleware/auth");

// Get all records for authenticated user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const records = await IncomeExpense.find({ user: req.user._id }).sort({
      date: -1,
    });
    res.json(records);
  } catch (err) {
    console.error("Get records error:", err);
    res.status(400).json({ error: err.message || "Failed to get records" });
  }
});

// Create record for authenticated user
router.post("/", authenticateToken, async (req, res) => {
  try {
    const recordData = { ...req.body, user: req.user._id };
    const record = new IncomeExpense(recordData);
    await record.save();
    res.status(201).json(record);
  } catch (err) {
    console.error("Create record error:", err);
    res.status(400).json({ error: err.message || "Failed to create record" });
  }
});

// Update record (only if owned by authenticated user)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const record = await IncomeExpense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!record) {
      return res
        .status(404)
        .json({ error: "Record not found or unauthorized" });
    }

    const updatedRecord = await IncomeExpense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedRecord);
  } catch (err) {
    console.error("Update record error:", err);
    res.status(400).json({ error: err.message || "Failed to update record" });
  }
});

// Delete record (only if owned by authenticated user)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const record = await IncomeExpense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!record) {
      return res
        .status(404)
        .json({ error: "Record not found or unauthorized" });
    }

    await IncomeExpense.findByIdAndDelete(req.params.id);
    res.json({ message: "Record deleted" });
  } catch (err) {
    console.error("Delete record error:", err);
    res.status(400).json({ error: err.message || "Failed to delete record" });
  }
});

module.exports = router;
