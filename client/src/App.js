import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { RecoilRoot, useRecoilState } from "recoil";
import { userState } from "./state/atoms";
import { useState } from "react";

import TodoPage from "./pages/TodoPage";
import NotesPage from "./pages/NotesPage";
import IncomeExpensesPage from "./pages/IncomeExpensesPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";

function AppContent() {
  const [user, setUser] = useRecoilState(userState);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return <AuthPage onAuth={setUser} />;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo/Brand */}
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-800">
                  💰 Finance Tracker
                </span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-8">
                <Link
                  to="/todos"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  📝 To-Do List
                </Link>
                <Link
                  to="/notes"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  📄 Notes
                </Link>
                <Link
                  to="/income-expenses"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  💰 Income & Expenses
                </Link>
                <Link
                  to="/settings"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  ⚙️ Settings
                </Link>
              </div>

              {/* Desktop Logout Button */}
              <div className="hidden md:flex">
                <button
                  onClick={() => setUser(null)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-2 rounded-md transition-colors"
                  aria-label="Toggle menu"
                >
                  <svg
                    className="h-6 w-6"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  to="/todos"
                  onClick={closeMobileMenu}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  📝 To-Do List
                </Link>
                <Link
                  to="/notes"
                  onClick={closeMobileMenu}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  📄 Notes
                </Link>
                <Link
                  to="/income-expenses"
                  onClick={closeMobileMenu}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  💰 Income & Expenses
                </Link>
                <Link
                  to="/settings"
                  onClick={closeMobileMenu}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  ⚙️ Settings
                </Link>
                <button
                  onClick={() => {
                    setUser(null);
                    closeMobileMenu();
                  }}
                  className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </nav>

        <main className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/todos" element={<TodoPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/income-expenses" element={<IncomeExpensesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/" element={<TodoPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <RecoilRoot>
      <AppContent />
    </RecoilRoot>
  );
}

export default App;
