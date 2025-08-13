const express = require("express");
const router = express.Router();
const Note = require("../models/Note");

// Get all notes for a user
router.get("/:userId", async (req, res) => {
  const notes = await Note.find({ user: req.params.userId });
  res.json(notes);
});

// Create note
router.post("/", async (req, res) => {
  const note = new Note(req.body);
  await note.save();
  res.status(201).json(note);
});

// Update note
router.put("/:id", async (req, res) => {
  const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(note);
});

// Delete note
router.delete("/:id", async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: "Note deleted" });
});

module.exports = router;
