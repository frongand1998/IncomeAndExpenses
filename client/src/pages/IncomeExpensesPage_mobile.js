import React, { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { userState, incomeExpensesState } from "../state/atoms";
import { useCurrency } from "../hooks/useCurrency";
import dayjs from "dayjs";

function IncomeExpensesPage() {
  const user = useRecoilValue(userState);
  const [records, setRecords] = useRecoilState(incomeExpensesState);
  const [newRecord, setNewRecord] = useState({
    type: "income",
    amount: "",
    description: "",
    date: dayjs().format("YYYY-MM-DD"), // Default to today
  });
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    fromDate: "",
    toDate: "",
    preset: "all",
  });
  const [filters, setFilters] = useState({
    description: "",
    type: "all", // "all", "income", "expense"
  });
  const [showFilters, setShowFilters] = useState(false);
  const { formatCurrency } = useCurrency();

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

  // Date filter helper functions
  const getDatePresets = () => {
    const today = dayjs();

    return {
      today: {
        from: today.startOf("day"),
        to: today.endOf("day"),
      },
      week: {
        from: today.startOf("week"),
        to: today.endOf("week"),
      },
      month: {
        from: today.startOf("month"),
        to: today.endOf("month"),
      },
      year: {
        from: today.startOf("year"),
        to: today.endOf("year"),
      },
    };
  };

  const applyDatePreset = (preset) => {
    const presets = getDatePresets();
    setDateFilter((prev) => ({ ...prev, preset }));

    if (preset === "all") {
      setDateFilter((prev) => ({ ...prev, fromDate: "", toDate: "" }));
    } else if (presets[preset]) {
      const { from, to } = presets[preset];
      setDateFilter((prev) => ({
        ...prev,
        fromDate: from.format("YYYY-MM-DD"),
        toDate: to.format("YYYY-MM-DD"),
      }));
    }
  };

  // Filter records based on date range, description, and type
  const filteredRecords = records
    .filter((record) => {
      // Date filter
      if (dateFilter.fromDate || dateFilter.toDate) {
        const recordDate = dayjs(record.date);
        const fromDate = dateFilter.fromDate
          ? dayjs(dateFilter.fromDate).startOf("day")
          : null;
        const toDate = dateFilter.toDate
          ? dayjs(dateFilter.toDate).endOf("day")
          : null;

        if (fromDate && recordDate.isBefore(fromDate)) return false;
        if (toDate && recordDate.isAfter(toDate)) return false;
      }

      // Description filter (case-insensitive)
      if (filters.description) {
        const searchTerm = filters.description.toLowerCase();
        if (!record.description.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      // Type filter
      if (filters.type !== "all") {
        if (record.type !== filters.type) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by date in descending order (newest first)
      return dayjs(b.date).unix() - dayjs(a.date).unix();
    });

  const fetchRecords = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/income-expenses/${user._id}`);
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addRecord = async (e) => {
    e.preventDefault();
    if (!newRecord.amount || !newRecord.description.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/income-expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user._id,
          ...newRecord,
          amount: parseFloat(newRecord.amount),
          date: newRecord.date, // Ensure date is included
        }),
      });
      const record = await res.json();
      setRecords([...records, record]);
      setNewRecord({
        type: "income",
        amount: "",
        description: "",
        date: dayjs().format("YYYY-MM-DD"),
      });
    } catch (err) {
      console.error("Error adding record:", err);
    }
    setLoading(false);
  };

  const deleteRecord = async (id) => {
    try {
      await fetch(`${API_BASE}/api/income-expenses/${id}`, {
        method: "DELETE",
      });
      setRecords(records.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  const totalIncome = filteredRecords
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = filteredRecords
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + r.amount, 0);

  const balance = totalIncome - totalExpenses;

  const hasActiveFilters =
    dateFilter.fromDate ||
    dateFilter.toDate ||
    filters.description ||
    filters.type !== "all";

  const clearAllFilters = () => {
    setDateFilter({ fromDate: "", toDate: "", preset: "all" });
    setFilters({ description: "", type: "all" });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          💰 Income & Expenses
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Track your financial transactions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Income</p>
              <p className="text-xl sm:text-2xl font-bold text-green-700">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="text-green-500 text-2xl">💰</div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Expenses</p>
              <p className="text-xl sm:text-2xl font-bold text-red-700">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="text-red-500 text-2xl">💸</div>
          </div>
        </div>

        <div
          className={`${
            balance >= 0
              ? "bg-blue-50 border-blue-200"
              : "bg-orange-50 border-orange-200"
          } border rounded-xl p-4`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`${
                  balance >= 0 ? "text-blue-600" : "text-orange-600"
                } text-sm font-medium`}
              >
                Balance
              </p>
              <p
                className={`text-xl sm:text-2xl font-bold ${
                  balance >= 0 ? "text-blue-700" : "text-orange-700"
                }`}
              >
                {formatCurrency(balance)}
              </p>
            </div>
            <div
              className={`${
                balance >= 0 ? "text-blue-500" : "text-orange-500"
              } text-2xl`}
            >
              {balance >= 0 ? "📈" : "📉"}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Toggle Button (Mobile) */}
      <div className="mb-4 sm:hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <span className="font-medium text-gray-700">🔍 Filters & Search</span>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Filters Section */}
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 ${
          showFilters ? "block" : "hidden sm:block"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            🔍 Filters & Search
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors touch-manipulation"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Date Filter Presets */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            📅 Quick Date Filters
          </p>
          <div className="flex flex-wrap gap-2">
            {["all", "today", "week", "month", "year"].map((preset) => (
              <button
                key={preset}
                onClick={() => applyDatePreset(preset)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors touch-manipulation ${
                  dateFilter.preset === preset
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {preset === "all" ? "All Time" : `This ${preset}`}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateFilter.fromDate}
              onChange={(e) =>
                setDateFilter((prev) => ({
                  ...prev,
                  fromDate: e.target.value,
                  preset: "custom",
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={dateFilter.toDate}
              onChange={(e) =>
                setDateFilter((prev) => ({
                  ...prev,
                  toDate: e.target.value,
                  preset: "custom",
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Description
            </label>
            <input
              type="text"
              value={filters.description}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Search descriptions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white"
            >
              <option value="all">All Types</option>
              <option value="income">💰 Income Only</option>
              <option value="expense">💸 Expenses Only</option>
            </select>
          </div>
        </div>

        {/* Active Filters Info */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>
                Showing {filteredRecords.length} of {records.length} records
              </strong>
              {dateFilter.fromDate &&
                ` • From ${dayjs(dateFilter.fromDate).format("MMM DD, YYYY")}`}
              {dateFilter.toDate &&
                ` • To ${dayjs(dateFilter.toDate).format("MMM DD, YYYY")}`}
              {filters.description && ` • Contains "${filters.description}"`}
              {filters.type !== "all" &&
                ` • Type: ${
                  filters.type === "income" ? "💰 Income" : "💸 Expenses"
                }`}
            </p>
          </div>
        )}
      </div>

      {/* Add Record Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          ➕ Add New Record
        </h2>

        <form onSubmit={addRecord} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={newRecord.type}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, type: e.target.value })
                }
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white"
              >
                <option value="income">💰 Income</option>
                <option value="expense">💸 Expense</option>
              </select>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={newRecord.amount}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, amount: e.target.value })
                }
                placeholder="0.00"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                required
              />
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, date: e.target.value })
                  }
                  className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setNewRecord({
                      ...newRecord,
                      date: dayjs().format("YYYY-MM-DD"),
                    })
                  }
                  className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
                  title="Set to today"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newRecord.description}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, description: e.target.value })
                }
                placeholder="Enter description..."
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={
                loading || !newRecord.amount || !newRecord.description.trim()
              }
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base min-h-[48px] touch-manipulation"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding...
                </div>
              ) : (
                "➕ Add Record"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.map((record) => (
          <div
            key={record._id}
            className={`bg-white rounded-lg border-l-4 shadow-sm p-4 ${
              record.type === "income"
                ? "border-l-green-500 hover:bg-green-50"
                : "border-l-red-500 hover:bg-red-50"
            } transition-colors`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Left side - Type, Description, Date */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit ${
                      record.type === "income"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {record.type === "income" ? "💰 Income" : "💸 Expense"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {dayjs(record.date).format("MMM DD, YYYY")}
                  </span>
                </div>
                <p className="text-base font-medium text-gray-900 break-words">
                  {record.description}
                </p>
              </div>

              {/* Right side - Amount and Delete */}
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(record.amount)}
                </span>
                <button
                  onClick={() => deleteRecord(record._id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 touch-manipulation"
                  aria-label="Delete record"
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
          </div>
        ))}

        {/* Empty States */}
        {filteredRecords.length === 0 && records.length > 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No records match your filters
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Try adjusting your search criteria
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {records.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No records yet
            </h3>
            <p className="text-gray-600 text-sm">
              Add your first income or expense above to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default IncomeExpensesPage;
