import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { userState, currencyState } from "../state/atoms";

function SettingsPage() {
  const user = useRecoilValue(userState);
  const [globalCurrency, setGlobalCurrency] = useRecoilState(currencyState);
  const [settings, setSettings] = useState({
    currency: "USD",
    currencySymbol: "$",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "BRL", symbol: "R$", name: "Brazilian Real" },
    { code: "THB", symbol: "฿", name: "Thai Baht" },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${user._id}/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setGlobalCurrency(data); // Update global Recoil state
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/users/${user._id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage("Settings saved successfully!");
        // Update global Recoil state
        setGlobalCurrency(settings);
        // Update localStorage for immediate UI updates
        localStorage.setItem("userCurrency", JSON.stringify(settings));
        // Trigger a custom event to notify other components
        window.dispatchEvent(
          new CustomEvent("currencyChanged", { detail: settings })
        );
      } else {
        setMessage("Error saving settings");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setMessage("Error saving settings");
    }
    setLoading(false);
  };

  const handleCurrencyChange = (currencyCode) => {
    const currency = currencies.find((c) => c.code === currencyCode);
    setSettings({
      currency: currency.code,
      currencySymbol: currency.symbol,
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>Settings</h2>

      <form onSubmit={saveSettings}>
        <div style={{ marginBottom: "20px" }}>
          <h3>Currency Settings</h3>
          <label style={{ display: "block", marginBottom: "10px" }}>
            Select Currency:
          </label>
          <select
            value={settings.currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            style={{
              padding: "8px",
              width: "300px",
              fontSize: "16px",
              marginBottom: "10px",
            }}
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name} ({currency.code})
              </option>
            ))}
          </select>

          <div
            style={{
              padding: "10px",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              marginTop: "10px",
            }}
          >
            <strong>Preview:</strong> {settings.currencySymbol}100.00
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>

      {message && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: message.includes("Error") ? "#ffebee" : "#e8f5e8",
            color: message.includes("Error") ? "red" : "green",
            borderRadius: "4px",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
