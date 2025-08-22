const mongoose = require("mongoose");

const incomeExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        // Income categories
        "salary",
        "freelance",
        "business",
        "investment",
        "rental",
        "bonus",
        "gift",
        "refund",
        "side_hustle",
        "other",
        // Expense categories
        "food",
        "transport",
        "utilities",
        "shopping",
        "entertainment",
        "health",
        "education",
        "bills",
        "travel",
      ],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
incomeExpenseSchema.index({ user: 1, date: -1 });
incomeExpenseSchema.index({ user: 1, type: 1, category: 1 });

module.exports = mongoose.model("IncomeExpense", incomeExpenseSchema);
