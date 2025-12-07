let state = {
  isFrozen: false,
  balance: 15000,
  limit: 200000,
  dueDate: "2025-01-20",
  deliveryStatus: "Out for Delivery",

  transactions: [
    { id: "TX101", merchant: "Netflix", amount: 499, date: "2025-01-10", category: "Entertainment" },
    { id: "TX102", merchant: "Swiggy", amount: 349, date: "2025-01-09", category: "Food" },
    { id: "TX103", merchant: "Amazon", amount: 1999, date: "2025-01-06", category: "Shopping" },
    { id: "TX104", merchant: "Uber", amount: 240, date: "2025-01-05", category: "Travel" }
  ],
};

module.exports = state;
