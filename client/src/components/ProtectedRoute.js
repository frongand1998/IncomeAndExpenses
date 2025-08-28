import React from "react";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect will be handled by App.js
  if (!isAuthenticated) {
    return null;
  }

  return children;
}

export default ProtectedRoute;
