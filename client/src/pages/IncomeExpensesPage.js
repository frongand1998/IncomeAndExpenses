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
  });
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    fromDate: "",
    toDate: "",
    preset: "all",
  });
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

  // Filter records based on date range
  const filteredRecords = records.filter((record) => {
    if (!dateFilter.fromDate && !dateFilter.toDate) return true;

    const recordDate = dayjs(record.date);
    const fromDate = dateFilter.fromDate
      ? dayjs(dateFilter.fromDate).startOf("day")
      : null;
    const toDate = dateFilter.toDate
      ? dayjs(dateFilter.toDate).endOf("day")
      : null;

    if (fromDate && recordDate.isBefore(fromDate)) return false;
    if (toDate && recordDate.isAfter(toDate)) return false;

    return true;
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
        }),
      });
      const record = await res.json();
      setRecords([...records, record]);
      setNewRecord({ type: "income", amount: "", description: "" });
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>Income & Expenses</h2>

      {/* Date Filter Section */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #e9ecef",
        }}
      >
        <h3
          style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#495057" }}
        >
          📅 Filter by Date
        </h3>

        {/* Preset Buttons */}
        <div style={{ marginBottom: "15px" }}>
          <span
            style={{ marginRight: "10px", fontSize: "14px", color: "#6c757d" }}
          >
            Quick filters:
          </span>
          {["all", "today", "week", "month", "year"].map((preset) => (
            <button
              key={preset}
              onClick={() => applyDatePreset(preset)}
              style={{
                padding: "6px 12px",
                marginRight: "8px",
                backgroundColor:
                  dateFilter.preset === preset ? "#007bff" : "#ffffff",
                color: dateFilter.preset === preset ? "white" : "#495057",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                textTransform: "capitalize",
              }}
            >
              {preset === "all" ? "All Time" : `This ${preset}`}
            </button>
          ))}
        </div>

        {/* Custom Date Range */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <label style={{ fontSize: "14px", color: "#495057" }}>From:</label>
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
            style={{
              padding: "6px 8px",
              border: "1px solid #ced4da",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
          <label style={{ fontSize: "14px", color: "#495057" }}>To:</label>
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
            style={{
              padding: "6px 8px",
              border: "1px solid #ced4da",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
          {(dateFilter.fromDate || dateFilter.toDate) && (
            <button
              onClick={() =>
                setDateFilter({ fromDate: "", toDate: "", preset: "all" })
              }
              style={{
                padding: "6px 12px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Filter Results Info */}
        {(dateFilter.fromDate || dateFilter.toDate) && (
          <div
            style={{
              marginTop: "10px",
              fontSize: "12px",
              color: "#6c757d",
              fontStyle: "italic",
            }}
          >
            Showing {filteredRecords.length} of {records.length} records
            {dateFilter.fromDate &&
              ` from ${dayjs(dateFilter.fromDate).format("MMM DD, YYYY")}`}
            {dateFilter.toDate &&
              ` to ${dayjs(dateFilter.toDate).format("MMM DD, YYYY")}`}
          </div>
        )}
      </div>

      {/* Summary */}
      {/* Summary */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
        }}
      >
        <div style={{ display: "flex", gap: "20px" }}>
          <span style={{ color: "green" }}>
            Income: {formatCurrency(totalIncome)}
          </span>
          <span style={{ color: "red" }}>
            Expenses: {formatCurrency(totalExpenses)}
          </span>
          <span
            style={{
              color: balance >= 0 ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            Balance: {formatCurrency(balance)}
          </span>
        </div>
      </div>
      {/* Add Form */}
      <form onSubmit={addRecord} style={{ marginBottom: "20px" }}>
        <select
          value={newRecord.type}
          onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
          style={{ padding: "8px", marginRight: "10px" }}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          type="number"
          step="0.01"
          value={newRecord.amount}
          onChange={(e) =>
            setNewRecord({ ...newRecord, amount: e.target.value })
          }
          placeholder="Amount"
          style={{ padding: "8px", marginRight: "10px", width: "120px" }}
        />
        <input
          type="text"
          value={newRecord.description}
          onChange={(e) =>
            setNewRecord({ ...newRecord, description: e.target.value })
          }
          placeholder="Description"
          style={{ padding: "8px", marginRight: "10px", width: "200px" }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Record"}
        </button>
      </form>
      {/* Records List */}
      <div>
        {filteredRecords.map((record) => (
          <div
            key={record._id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              border: "1px solid #ddd",
              marginBottom: "5px",
              borderRadius: "4px",
              backgroundColor: record.type === "income" ? "#e8f5e8" : "#ffe8e8",
            }}
          >
            <span
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor: record.type === "income" ? "green" : "red",
                color: "white",
                fontSize: "12px",
                marginRight: "10px",
              }}
            >
              {record.type.toUpperCase()}
            </span>
            <span style={{ flex: 1 }}>{record.description}</span>
            <span style={{ fontWeight: "bold", marginRight: "10px" }}>
              {formatCurrency(record.amount)}
            </span>
            <small style={{ color: "#666", marginRight: "10px" }}>
              {dayjs(record.date).format("MMM DD, YYYY")}
            </small>
            <button
              onClick={() => deleteRecord(record._id)}
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
        ))}
        {filteredRecords.length === 0 && records.length > 0 && (
          <p style={{ color: "#666" }}>
            No records found for the selected date range.
            <button
              onClick={() =>
                setDateFilter({ fromDate: "", toDate: "", preset: "all" })
              }
              style={{
                marginLeft: "10px",
                color: "#007bff",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Clear filter
            </button>
          </p>
        )}
        {records.length === 0 && (
          <p style={{ color: "#666" }}>No records yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}

export default IncomeExpensesPage;
