import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../utils/auth";

function SettingsPage() {
  const { user } = useAuth();
  const [globalCurrency, setGlobalCurrency] = useState("USD");
  const [settings, setSettings] = useState({
    currency: "USD",
    currencySymbol: "$",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

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
      const res = await authService.authenticatedFetch(
        `${API_BASE}/api/users/settings`
      );
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setGlobalCurrency(data); // Update global currency state
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
      const res = await authService.authenticatedFetch(
        `${API_BASE}/api/users/settings`,
        {
          method: "PUT",
          body: JSON.stringify(settings),
        }
      );
      if (res.ok) {
        setMessage("Settings saved successfully!");
        // Update global currency state
        setGlobalCurrency(settings);
        // Update localStorage for immediate UI updates
        localStorage.setItem("userCurrency", JSON.stringify(settings));
        // Trigger a custom event to notify other components
        window.dispatchEvent(
          new CustomEvent("currencyChanged", { detail: settings })
        );

        // Clear success message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          ⚙️ Settings
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Customize your app preferences
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <form onSubmit={saveSettings} className="space-y-6">
          {/* Currency Settings Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              💰 Currency Settings
            </h2>

            <div className="space-y-4">
              {/* Currency Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white"
                  disabled={loading}
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency Preview */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Preview
                </h3>
                <div className="text-2xl font-bold text-green-600">
                  {settings.currencySymbol}100.00
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  This is how currency amounts will appear in your app
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base min-h-[48px] touch-manipulation"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : (
                "💾 Save Settings"
              )}
            </button>
          </div>
        </form>

        {/* Message Display */}
        {message && (
          <div
            className={`mt-4 p-4 rounded-lg border ${
              message.includes("Error")
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">
                {message.includes("Error") ? "❌" : "✅"}
              </span>
              <span className="text-sm font-medium">{message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Additional Settings Cards (for future features) */}
      <div className="mt-6 grid gap-4">
        {/* Appearance Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            🎨 Appearance
          </h3>
          <p className="text-gray-600 text-sm">
            Theme and display customization options coming soon...
          </p>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            🔔 Notifications
          </h3>
          <p className="text-gray-600 text-sm">
            Push notification preferences coming soon...
          </p>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            📊 Data Management
          </h3>
          <p className="text-gray-600 text-sm">
            Export, import, and backup options coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
