const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    settings: {
      currency: { type: String, default: "USD" },
      currencySymbol: { type: String, default: "$" },
    },
  },
  { timestamps: true }
);

// Hide password when sending user as JSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
