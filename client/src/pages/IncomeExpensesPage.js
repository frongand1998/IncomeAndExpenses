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
    category: "",
    date: dayjs().format("YYYY-MM-DD"),
  });
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    fromDate: "",
    toDate: "",
    preset: "all",
  });
  const [filters, setFilters] = useState({
    description: "",
    type: "all",
    category: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Editing state
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingField, setEditingField] = useState(null); // 'description' or 'category'
  const [editingValue, setEditingValue] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const { formatCurrency } = useCurrency();

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

  // Income categories with emojis and descriptions
  const incomeCategories = {
    salary: {
      label: "💼 Salary",
      description: "Regular employment income",
      icon: "💼",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    freelance: {
      label: "🎨 Freelance",
      description: "Project-based work",
      icon: "🎨",
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
    business: {
      label: "🏢 Business",
      description: "Business profits & revenue",
      icon: "🏢",
      color: "bg-gray-100 text-gray-800 border-gray-200",
    },
    investment: {
      label: "📈 Investment",
      description: "Dividends, capital gains",
      icon: "📈",
      color: "bg-green-100 text-green-800 border-green-200",
    },
    rental: {
      label: "🏠 Rental",
      description: "Property rental income",
      icon: "🏠",
      color: "bg-orange-100 text-orange-800 border-orange-200",
    },
    bonus: {
      label: "🎁 Bonus",
      description: "Performance bonuses, tips",
      icon: "🎁",
      color: "bg-pink-100 text-pink-800 border-pink-200",
    },
    gift: {
      label: "💝 Gift",
      description: "Money gifts received",
      icon: "💝",
      color: "bg-rose-100 text-rose-800 border-rose-200",
    },
    refund: {
      label: "💰 Refund",
      description: "Tax refunds, cashbacks",
      icon: "💰",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    side_hustle: {
      label: "🚀 Side Hustle",
      description: "Part-time income",
      icon: "🚀",
      color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    },
    other: {
      label: "📦 Other",
      description: "Other income sources",
      icon: "📦",
      color: "bg-gray-100 text-gray-800 border-gray-200",
    },
  };

  // Expense categories
  const expenseCategories = {
    food: {
      label: "🍔 Food & Dining",
      description: "Meals, groceries, restaurants",
      icon: "🍔",
      color: "bg-red-100 text-red-800 border-red-200",
    },
    transport: {
      label: "🚗 Transportation",
      description: "Gas, public transport, uber",
      icon: "🚗",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    utilities: {
      label: "⚡ Utilities",
      description: "Electricity, water, internet",
      icon: "⚡",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    shopping: {
      label: "🛍️ Shopping",
      description: "Clothes, electronics, misc",
      icon: "🛍️",
      color: "bg-pink-100 text-pink-800 border-pink-200",
    },
    entertainment: {
      label: "🎬 Entertainment",
      description: "Movies, games, subscriptions",
      icon: "🎬",
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
    health: {
      label: "🏥 Healthcare",
      description: "Medical, pharmacy, fitness",
      icon: "🏥",
      color: "bg-green-100 text-green-800 border-green-200",
    },
    education: {
      label: "📚 Education",
      description: "Courses, books, training",
      icon: "📚",
      color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    },
    bills: {
      label: "📋 Bills",
      description: "Rent, insurance, loans",
      icon: "📋",
      color: "bg-orange-100 text-orange-800 border-orange-200",
    },
    travel: {
      label: "✈️ Travel",
      description: "Flights, hotels, vacation",
      icon: "✈️",
      color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    },
    other: {
      label: "📦 Other",
      description: "Other expenses",
      icon: "📦",
      color: "bg-gray-100 text-gray-800 border-gray-200",
    },
  };

  // Quick income suggestions
  const quickIncomeOptions = [
    { amount: "", description: "Monthly Salary", category: "salary" },
    { amount: "", description: "Freelance Project", category: "freelance" },
    { amount: "", description: "Side Gig Earnings", category: "side_hustle" },
    { amount: "", description: "Investment Dividend", category: "investment" },
    { amount: "", description: "Bonus Payment", category: "bonus" },
  ];

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

  // Filter records based on date range, description, type, and category
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

      // Category filter
      if (filters.category !== "all") {
        if (record.category !== filters.category) return false;
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
    if (
      !newRecord.amount ||
      !newRecord.description.trim() ||
      !newRecord.category
    )
      return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/income-expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user._id,
          ...newRecord,
          amount: parseFloat(newRecord.amount),
          date: newRecord.date,
        }),
      });
      const record = await res.json();
      setRecords([...records, record]);
      setNewRecord({
        type: "income",
        amount: "",
        description: "",
        category: "",
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

  // Edit functionality
  const startEditing = (record, field) => {
    setEditingRecord(record._id);
    setEditingField(field);
    setEditingValue(
      field === "description" ? record.description : record.category || ""
    );
  };

  const cancelEditing = () => {
    setEditingRecord(null);
    setEditingField(null);
    setEditingValue("");
  };

  const saveEdit = async (recordId) => {
    if (
      (!editingValue.trim() && editingField === "description") ||
      updateLoading
    )
      return;

    setUpdateLoading(true);
    try {
      const updateData = {};
      if (editingField === "description") {
        updateData.description = editingValue.trim();
      } else if (editingField === "category") {
        updateData.category = editingValue;
      }

      const res = await fetch(`${API_BASE}/api/income-expenses/${recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        setRecords(
          records.map((record) =>
            record._id === recordId ? { ...record, ...updateData } : record
          )
        );
        setEditingRecord(null);
        setEditingField(null);
        setEditingValue("");
      } else {
        console.error("Failed to update record");
      }
    } catch (err) {
      console.error("Error updating record:", err);
    }
    setUpdateLoading(false);
  };

  const handleKeyPress = (e, recordId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit(recordId);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const applyQuickOption = (option) => {
    setNewRecord({
      ...newRecord,
      description: option?.description,
      category: option?.category,
      amount: option?.amount,
    });
  };

  const totalIncome = filteredRecords
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = filteredRecords
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + r.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Income breakdown by category
  const incomeByCategory = Object.keys(incomeCategories)
    .map((categoryKey) => {
      const amount = filteredRecords
        .filter((r) => r.type === "income" && r.category === categoryKey)
        .reduce((sum, r) => sum + r.amount, 0);
      return {
        key: categoryKey,
        label: incomeCategories[categoryKey].label,
        icon: incomeCategories[categoryKey].icon,
        amount,
      };
    })
    .filter((cat) => cat.amount > 0);

  const hasActiveFilters =
    dateFilter.fromDate ||
    dateFilter.toDate ||
    filters.description ||
    filters.type !== "all" ||
    filters.category !== "all";

  const clearAllFilters = () => {
    setDateFilter({ fromDate: "", toDate: "", preset: "all" });
    setFilters({ description: "", type: "all", category: "all" });
  };

  const currentCategories =
    newRecord.type === "income" ? incomeCategories : expenseCategories;

  const getCategoryInfo = (record) => {
    const categories =
      record.type === "income" ? incomeCategories : expenseCategories;
    const categoryData = categories[record.category];

    if (categoryData) {
      return {
        label: categoryData.label,
        icon: categoryData.icon,
        color: categoryData.color,
      };
    }

    // Fallback for records without category or unknown categories
    return {
      label: `${record.type === "income" ? "💰 Income" : "💸 Expense"}`,
      icon: record.type === "income" ? "💰" : "💸",
      color:
        record.type === "income"
          ? "bg-green-100 text-green-800 border-green-200"
          : "bg-red-100 text-red-800 border-red-200",
    };
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          💰 Income & Expenses Tracker
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Track your financial transactions with categories - Click to edit
          descriptions and categories
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Income</p>
              <p className="text-xl sm:text-2xl font-bold text-green-700">
                {formatCurrency(totalIncome)}
              </p>
              {incomeByCategory.length > 0 && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <span>Top:</span>
                  <span className="text-base">{incomeByCategory[0]?.icon}</span>
                  <span>
                    {incomeByCategory[0]?.label.replace(/^[^\s]+ /, "")}
                  </span>
                  <span>{formatCurrency(incomeByCategory[0]?.amount)}</span>
                </p>
              )}
            </div>
            <div className="text-green-500 text-2xl">💰</div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Total Expenses</p>
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
                Net Balance
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

      {/* Income Categories Breakdown */}
      {incomeByCategory.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            💼 Income Sources Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {incomeByCategory.map((category) => (
              <div key={category.key} className="text-center">
                <div className="text-2xl mb-1">{category.icon}</div>
                <div className="text-xs text-gray-600 mb-1">
                  {category.label.replace(/^[^\s]+ /, "")}
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {formatCurrency(category.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

        {/* Custom Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              placeholder="Search..."
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white"
            >
              <option value="all">All Categories</option>
              {filters.type === "income" || filters.type === "all" ? (
                <>
                  <optgroup label="Income Categories">
                    {Object.entries(incomeCategories).map(([key, category]) => (
                      <option key={key} value={key}>
                        {category.label}
                      </option>
                    ))}
                  </optgroup>
                </>
              ) : null}
              {filters.type === "expense" || filters.type === "all" ? (
                <>
                  <optgroup label="Expense Categories">
                    {Object.entries(expenseCategories).map(
                      ([key, category]) => (
                        <option key={key} value={key}>
                          {category.label}
                        </option>
                      )
                    )}
                  </optgroup>
                </>
              ) : null}
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
              {filters.category !== "all" &&
                ` • Category: ${
                  (filters.type === "income"
                    ? incomeCategories
                    : expenseCategories)[filters.category]?.label ||
                  filters.category
                }`}
            </p>
          </div>
        )}
      </div>

      {/* Add Record Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          ➕ Add New Transaction
        </h2>

        {/* Quick Income Options */}
        {newRecord.type === "income" && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-2">
              💡 Quick Income Options
            </p>
            <div className="flex flex-wrap gap-2">
              {quickIncomeOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applyQuickOption(option)}
                  className="px-3 py-1 text-xs bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                >
                  <span className="text-sm">
                    {incomeCategories[option.category]?.icon}
                  </span>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={addRecord} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                value={newRecord.type}
                onChange={(e) =>
                  setNewRecord({
                    ...newRecord,
                    type: e.target.value,
                    category: "",
                  })
                }
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white"
              >
                <option value="income">💰 Income</option>
                <option value="expense">💸 Expense</option>
              </select>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={newRecord.category}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, category: e.target.value })
                }
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white"
                required
              >
                <option value="">Select Category</option>
                {Object.entries(currentCategories).map(([key, category]) => (
                  <option key={key} value={key}>
                    {category.label}
                  </option>
                ))}
              </select>
              {newRecord.category && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <span className="text-sm">
                    {currentCategories[newRecord.category]?.icon}
                  </span>
                  <span>
                    {currentCategories[newRecord.category]?.description}
                  </span>
                </p>
              )}
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
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
                Date <span className="text-red-500">*</span>
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
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newRecord.description}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, description: e.target.value })
                }
                placeholder={
                  newRecord.type === "income"
                    ? "e.g., Monthly salary from ABC Corp, Freelance project payment..."
                    : "e.g., Grocery shopping, Gas for car..."
                }
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
                loading ||
                !newRecord.amount ||
                !newRecord.description.trim() ||
                !newRecord.category
              }
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base min-h-[48px] touch-manipulation"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding...
                </div>
              ) : (
                `➕ Add ${newRecord.type === "income" ? "Income" : "Expense"}`
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.map((record) => {
          const categoryInfo = getCategoryInfo(record);

          return (
            <div
              key={record._id}
              className={`bg-white rounded-lg border-l-4 shadow-sm p-4 ${
                record.type === "income"
                  ? "border-l-green-500 hover:bg-green-50"
                  : "border-l-red-500 hover:bg-red-50"
              } transition-colors`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left side - Category Icon, Category, Description, Date */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-1">
                    {/* Category Icon + Badge */}
                    <div className="flex items-center gap-2">
                      {/* Large Category Icon */}
                      <div className="w-8 h-8 flex items-center justify-center text-lg bg-gray-50 rounded-full border">
                        {categoryInfo.icon}
                      </div>

                      {/* Editable Category Badge */}
                      {editingRecord === record._id &&
                      editingField === "category" ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, record._id)}
                            onBlur={() => saveEdit(record._id)}
                            className="px-2 py-1 text-xs border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            autoFocus
                            disabled={updateLoading}
                          >
                            <option value="">Select Category</option>
                            {Object.entries(
                              record.type === "income"
                                ? incomeCategories
                                : expenseCategories
                            ).map(([key, category]) => (
                              <option key={key} value={key}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-1">
                            <button
                              onClick={() => saveEdit(record._id)}
                              disabled={updateLoading || !editingValue}
                              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                              title="Save (Enter)"
                            >
                              {updateLoading ? (
                                <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={updateLoading}
                              className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                              title="Cancel (Esc)"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all group ${categoryInfo.color}`}
                          onClick={() => startEditing(record, "category")}
                          title="Click to edit category"
                        >
                          {categoryInfo.label.replace(/^[^\s]+ /, "")}
                          <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            ✏️
                          </span>
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-gray-500">
                      {dayjs(record.date).format("MMM DD, YYYY")}
                    </span>
                  </div>

                  {/* Editable Description */}
                  {editingRecord === record._id &&
                  editingField === "description" ? (
                    <div className="flex items-center gap-2 ml-10">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, record._id)}
                        onBlur={() => saveEdit(record._id)}
                        className="flex-1 px-2 py-1 text-base font-medium border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                        disabled={updateLoading}
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => saveEdit(record._id)}
                          disabled={updateLoading || !editingValue.trim()}
                          className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                          title="Save (Enter)"
                        >
                          {updateLoading ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={updateLoading}
                          className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                          title="Cancel (Esc)"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className="text-base font-medium text-gray-900 break-words cursor-pointer hover:text-blue-600 transition-colors group ml-10"
                      onClick={() => startEditing(record, "description")}
                      title="Click to edit description"
                    >
                      {record.description}
                      <span className="ml-2 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity">
                        ✏️
                      </span>
                    </p>
                  )}
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
          );
        })}

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
              Ready to track your finances with categories!
            </h3>
            <p className="text-gray-600 text-sm">
              Add your first income or expense with categories above to get
              started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default IncomeExpensesPage;
