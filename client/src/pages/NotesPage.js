import React, { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { userState, notesState } from "../state/atoms";

function NotesPage() {
  const user = useRecoilValue(userState);
  const [notes, setNotes] = useRecoilState(notesState);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" for newest first, "asc" for oldest first

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

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

  // Sort notes by createdAt
  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);

    if (sortOrder === "desc") {
      return dateB - dateA; // Newest first
    } else {
      return dateA - dateB; // Oldest first
    }
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          📄 Notes
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Capture your thoughts and ideas
        </p>
      </div>

      {/* Add Note Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          ✏️ Create New Note
        </h2>
        <form onSubmit={addNote} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={newNote.title}
              onChange={(e) =>
                setNewNote({ ...newNote, title: e.target.value })
              }
              placeholder="Enter note title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              disabled={loading}
              required
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={newNote.content}
              onChange={(e) =>
                setNewNote({ ...newNote, content: e.target.value })
              }
              placeholder="Write your note content here..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !newNote.title.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base min-h-[48px] touch-manipulation"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding...
                </div>
              ) : (
                "Add Note"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Notes Controls */}
      {notes.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Notes ({notes.length})
          </h2>
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  sortOrder === "desc"
                    ? "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    : "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                }
              />
            </svg>
            {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          </button>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {sortedNotes?.map((note) => (
          <div
            key={note._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
          >
            {/* Note Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-900 break-words">
                {note.title}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(note.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <button
                  onClick={() => deleteNote(note._id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 touch-manipulation"
                  aria-label="Delete note"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Note Content */}
            {note.content && (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap break-words">
                  {note.content}
                </p>
              </div>
            )}

            {/* Note Footer */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Created: {new Date(note.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {notes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notes yet
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Create your first note above to get started!
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      {notes.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">
            Total notes: {notes.length} • Sorted by:{" "}
            {sortOrder === "desc" ? "Newest first" : "Oldest first"}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesPage;
