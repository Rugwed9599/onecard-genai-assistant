const state = require("../lib/state");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = {
  freezeCard: async () => {
    await delay(800);
    state.isFrozen = true;
    return { status: "frozen" };
  },

  unfreezeCard: async () => {
    await delay(800);
    state.isFrozen = false;
    return { status: "active" };
  },

  checkDeliveryStatus: async () => {
    await delay(500);
    return {
      status: state.deliveryStatus,
      courier: "BlueDart",
      eta: "Today 6 PM",
    };
  },

  getTransactions: async () => {
    await delay(500);
    return state.transactions;
  },

  payBill: async (amount) => {
    await delay(1000);
    state.balance -= amount;
    return {
      success: true,
      newBalance: state.balance,
    };
  },

  convertToEMI: async (amount, tenure) => {
    await delay(1200);
    const rate = 0.15;
    const interest = amount * rate * (tenure / 12);
    const emi = (amount + interest) / tenure;

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(interest),
      tenure,
      rate: "15% p.a.",
    };
  },

  generateStatement: async (month) => {
    await delay(700);
    return {
      url: `https://onecard.app/statement/${month}.pdf`,
      period: month,
    };
  },

  raiseDispute: async (txnId, reason) => {
    await delay(1000);
    return {
      ticketId: `TKT-${Math.floor(Math.random() * 99999)}`,
      txnId,
      reason,
    };
  }
};
