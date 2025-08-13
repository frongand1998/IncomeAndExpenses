import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { RecoilRoot, useRecoilState } from "recoil";
import { userState } from "./state/atoms";

import TodoPage from "./pages/TodoPage";
import NotesPage from "./pages/NotesPage";
import IncomeExpensesPage from "./pages/IncomeExpensesPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";

function AppContent() {
  const [user, setUser] = useRecoilState(userState);

  if (!user) {
    return <AuthPage onAuth={setUser} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex space-x-8">
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
              <button
                onClick={() => setUser(null)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 px-4">
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
