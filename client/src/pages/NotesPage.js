import React, { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { userState, notesState } from "../state/atoms";

function NotesPage() {
  const user = useRecoilValue(userState);
  const [notes, setNotes] = useRecoilState(notesState);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notes/${user._id}`);
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user._id, ...newNote }),
      });
      const note = await res.json();
      setNotes([...notes, note]);
      setNewNote({ title: "", content: "" });
    } catch (err) {
      console.error("Error adding note:", err);
    }
    setLoading(false);
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notes/${id}`, { method: "DELETE" });
      setNotes(notes.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Notes</h2>
      <form onSubmit={addNote}>
        <div className="flex gap-4">
          <input
            type="text"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            placeholder="Note title..."
            style={{ padding: "8px", width: "200px" }}
          />
          <textarea
            value={newNote.content}
            onChange={(e) =>
              setNewNote({ ...newNote, content: e.target.value })
            }
            placeholder="Note content..."
            style={{
              padding: "8px",
              width: "300px",
              height: "60px",
              minHeight: "60px",
            }}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Note"}
          </button>
        </div>
      </form>
      <div>
        {notes?.map((note) => (
          <div
            key={note._id}
            style={{
              padding: "15px",
              border: "1px solid #ddd",
              marginBottom: "10px",
              borderRadius: "4px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h4 style={{ margin: "0 0 10px 0" }}>{note.title}</h4>
              <button
                onClick={() => deleteNote(note._id)}
                style={{
                  color: "red",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{note.content}</p>
            <small style={{ color: "#666" }}>
              Created: {new Date(note.createdAt).toLocaleDateString()}
            </small>
          </div>
        ))}
        {notes.length === 0 && (
          <p style={{ color: "#666" }}>No notes yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}

export default NotesPage;
