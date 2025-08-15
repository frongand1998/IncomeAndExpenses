import React, { useState, useEffect } from "react";

export default function ResetPasswordPage() {
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!token) return setStatus("Missing token");
    if (!password || password.length < 6)
      return setStatus("Password must be at least 6 characters");
    if (password !== confirm) return setStatus("Passwords do not match");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      setStatus("✅ Password reset successful. You can now sign in.");
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 mt-10 border">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <p className="text-sm text-gray-600 mb-4">
        Enter the new password for your account. This page expects a token from
        the reset email link.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Paste your token"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      {status && <div className="mt-4 text-sm text-gray-800">{status}</div>}
    </div>
  );
}
