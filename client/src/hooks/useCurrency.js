import { useState, useEffect } from "react";

// Custom hook to manage currency settings
export const useCurrency = () => {
  const [currency, setCurrency] = useState({
    currency: "USD",
    currencySymbol: "$",
  });

  useEffect(() => {
    // Load from localStorage on mount
    const savedCurrency = localStorage.getItem("userCurrency");
    if (savedCurrency) {
      setCurrency(JSON.parse(savedCurrency));
    }

    // Listen for currency changes
    const handleCurrencyChange = (event) => {
      setCurrency(event.detail);
    };

    window.addEventListener("currencyChanged", handleCurrencyChange);
    return () =>
      window.removeEventListener("currencyChanged", handleCurrencyChange);
  }, []);

  const formatCurrency = (amount) => {
    return `${currency.currencySymbol}${amount.toFixed(2)}`;
  };

  return { currency, formatCurrency };
};
