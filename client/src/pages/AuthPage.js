import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../utils/auth"; // Keep for password reset functionality

function AuthPage() {
  const {
    login,
    register,
    user,
    error: authError,
    isLoading: authLoading,
    clearError,
  } = useAuth();

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [form, setForm] = useState({ username: "", password: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Clear errors when switching between modes
  useEffect(() => {
    clearError();
    setError("");
  }, [isLogin, clearError]);

  // Don't render if user is already logged in
  if (user) {
    return null; // Or redirect to dashboard
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let result;
      if (isLogin) {
        result = await login({
          username: form.username,
          password: form.password,
        });
        console.log("🚀 ~ handleSubmit ~ result:", result);
      } else {
        result = await register(form);
      }

      if (result && !result.success) {
        setError(result.error);
      }
      // If successful, the AuthProvider will handle the redirect
    } catch (err) {
      setError(err.message || "An error occurred");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setForm({ username: "", password: "", email: "" });
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request reset");
      setIsForgot(false);
      setResetToken(data.token || "");
      if (!data.token) {
        // when email not found we still show generic success
        setError("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      // After successful reset, return to login
      setIsLogin(true);
      setIsForgot(false);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is initializing
  if (authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-2xl">💰</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {isForgot
                ? "Reset Password"
                : isLogin
                ? "Welcome Back"
                : "Create Account"}
            </h1>
            <p className="text-gray-500 mt-2">
              {isForgot
                ? "Enter your email to reset your password"
                : isLogin
                ? "Sign in to your account"
                : "Start managing your finances"}
            </p>
          </div>

          {/* Form */}
          {!isForgot && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">👤</span>
                  </div>
                  <input
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Email field (register only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">📧</span>
                    </div>
                    <input
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
              )}

              {/* Password field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔒</span>
                  </div>
                  <input
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Error message */}
              {(error || authError) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center space-x-2">
                  <span className="text-red-500">⚠️</span>
                  <span className="text-red-700 text-sm">
                    {error || authError}
                  </span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || authLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading || authLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </span>
                  </div>
                ) : (
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                )}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {isForgot && (
            <form
              onSubmit={resetToken ? handleReset : handleForgot}
              className="space-y-6"
            >
              {/* Email (request token) */}
              {!resetToken && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">📧</span>
                    </div>
                    <input
                      name="email"
                      type="email"
                      placeholder="Enter your account email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    We'll generate a temporary reset token (normally emailed).
                  </p>
                </div>
              )}

              {/* Token and new password (reset) */}
              {resetToken && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Reset Token
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">🔑</span>
                      </div>
                      <input
                        name="resetToken"
                        type="text"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Token expires in 15 minutes.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">🔒</span>
                      </div>
                      <input
                        name="password"
                        type="password"
                        placeholder="Enter a new password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center space-x-2">
                  <span className="text-red-500">⚠️</span>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{resetToken ? "Resetting..." : "Sending..."}</span>
                  </div>
                ) : (
                  <span>
                    {resetToken ? "Reset Password" : "Send Reset Link"}
                  </span>
                )}
              </button>
            </form>
          )}

          {/* Toggle between login/register/forgot */}
          <div className="mt-8 text-center space-y-2">
            {!isForgot && (
              <button
                onClick={toggleMode}
                className="block w-full text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
              >
                {isLogin ? (
                  <>
                    Don't have an account?{" "}
                    <span className="font-semibold text-blue-600 hover:text-blue-700">
                      Sign up here
                    </span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span className="font-semibold text-blue-600 hover:text-blue-700">
                      Sign in here
                    </span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => {
                setIsForgot(!isForgot);
                setError("");
                if (!isForgot) {
                  setResetToken("");
                  setForm({ username: "", password: "", email: "" });
                }
              }}
              className="block w-full text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
            >
              {isForgot ? "Back to Sign in" : "Forgot password?"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Secure • Private • Easy to use
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
