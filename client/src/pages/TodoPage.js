import React, { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { userState, todosState } from "../state/atoms";

function TodoPage() {
  const user = useRecoilValue(userState);
  const [todos, setTodos] = useRecoilState(todosState);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/todos/${user._id}`);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error("Error fetching todos:", err);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user._id, title: newTodo }),
      });
      const todo = await res.json();
      setTodos([...todos, todo]);
      setNewTodo("");
    } catch (err) {
      console.error("Error adding todo:", err);
    }
    setLoading(false);
  };

  const toggleTodo = async (id, completed) => {
    try {
      const res = await fetch(`${API_BASE}/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      const updatedTodo = await res.json();
      setTodos(todos.map((t) => (t._id === id ? updatedTodo : t)));
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`${API_BASE}/api/todos/${id}`, { method: "DELETE" });
      setTodos(todos.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          📝 To-Do List
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Keep track of your tasks and stay organized
        </p>
      </div>

      {/* Add Todo Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <form onSubmit={addTodo} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new todo..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !newTodo.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base min-h-[48px] touch-manipulation"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding...
                </div>
              ) : (
                "Add Todo"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {todos.map((todo) => (
          <div
            key={todo._id}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              {/* Checkbox */}
              <button
                onClick={() => toggleTodo(todo._id, todo.completed)}
                className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors touch-manipulation"
                style={{
                  backgroundColor: todo.completed ? "#10B981" : "transparent",
                  borderColor: todo.completed ? "#10B981" : "#D1D5DB",
                }}
              >
                {todo.completed && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>

              {/* Todo Text */}
              <div className="flex-1 min-w-0">
                <span
                  className={`text-base sm:text-lg break-words ${
                    todo.completed
                      ? "line-through text-gray-500"
                      : "text-gray-900"
                  }`}
                >
                  {todo.title}
                </span>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => deleteTodo(todo._id)}
                className="flex-shrink-0 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 touch-manipulation"
                aria-label="Delete todo"
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
        ))}

        {/* Empty State */}
        {todos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No todos yet
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Add your first todo above to get started!
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      {todos.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>Total: {todos.length}</span>
            <span>Completed: {todos.filter((t) => t.completed).length}</span>
            <span>Remaining: {todos.filter((t) => !t.completed).length}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoPage;
