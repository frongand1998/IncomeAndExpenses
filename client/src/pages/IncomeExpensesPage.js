import React, { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { userState, incomeExpensesState } from "../state/atoms";
import { useCurrency } from "../hooks/useCurrency";

function IncomeExpensesPage() {
  const user = useRecoilValue(userState);
  const [records, setRecords] = useRecoilState(incomeExpensesState);
  const [newRecord, setNewRecord] = useState({
    type: "income",
    amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const { formatCurrency } = useCurrency();

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

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

  const totalIncome = records
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = records
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + r.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Income & Expenses</h2>
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
        {records.map((record) => (
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
              {new Date(record.date).toLocaleDateString()}
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
        {records.length === 0 && (
          <p style={{ color: "#666" }}>No records yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}

export default IncomeExpensesPage;
