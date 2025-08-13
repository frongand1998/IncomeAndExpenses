import { atom } from "recoil";

// User atom for global user state
export const userState = atom({
  key: "userState",
  default: null,
});

// Currency settings atom (can be synced with user settings)
export const currencyState = atom({
  key: "currencyState",
  default: {
    currency: "USD",
    currencySymbol: "$",
  },
});

// Loading states
export const loadingState = atom({
  key: "loadingState",
  default: false,
});

// Todos atom
export const todosState = atom({
  key: "todosState",
  default: [],
});

// Notes atom
export const notesState = atom({
  key: "notesState",
  default: [],
});

// Income/Expenses atom
export const incomeExpensesState = atom({
  key: "incomeExpensesState",
  default: [],
});
