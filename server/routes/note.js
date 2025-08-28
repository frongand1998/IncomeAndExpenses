const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const { authenticateToken } = require("../middleware/auth");

// Get all notes for authenticated user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(notes);
  } catch (err) {
    console.error("Get notes error:", err);
    res.status(400).json({ error: err.message || "Failed to get notes" });
  }
});

// Create note for authenticated user
router.post("/", authenticateToken, async (req, res) => {
  try {
    const noteData = { ...req.body, user: req.user._id };
    const note = new Note(noteData);
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    console.error("Create note error:", err);
    res.status(400).json({ error: err.message || "Failed to create note" });
  }
});

// Update note (only if owned by authenticated user)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found or unauthorized" });
    }

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedNote);
  } catch (err) {
    console.error("Update note error:", err);
    res.status(400).json({ error: err.message || "Failed to update note" });
  }
});

// Delete note (only if owned by authenticated user)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found or unauthorized" });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(400).json({ error: err.message || "Failed to delete note" });
  }
});

module.exports = router;
