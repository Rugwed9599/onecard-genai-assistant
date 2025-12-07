const KB = require("../lib/kb");
const mockApi = require("./mockApiService");

// Basic message parser
function findKBAnswer(message) {
  const msg = message.toLowerCase();
  for (let key in KB) {
    if (msg.includes(key)) return KB[key];
  }
  return null;
}

module.exports = async function handleAI(message) {
  message = message.toLowerCase();

  // Try KB lookup first
  const kbAnswer = findKBAnswer(message);
  if (kbAnswer) return { reply: kbAnswer };

  // ACTIONS
  if (message.includes("freeze") || message.includes("block my card")) {
    const r = await mockApi.freezeCard();
    return { reply: `Your card is now ${r.status}.`, action: "freeze" };
  }

  if (message.includes("unfreeze") || message.includes("activate card")) {
    const r = await mockApi.unfreezeCard();
    return { reply: `Your card is now ${r.status}.`, action: "unfreeze" };
  }

  if (message.includes("where is my card") || message.includes("track delivery") || message.includes("delivery")) {
    const r = await mockApi.checkDeliveryStatus();
    return {
      reply: `Your card is ${r.status}. Courier: ${r.courier}. ETA: ${r.eta}.`,
      action: "delivery"
    };
  }

  if (message.includes("transactions") || message.includes("history")) {
    const r = await mockApi.getTransactions();
    return {
      reply: "Here are your recent transactions:",
      list: r
    };
  }

  if (message.includes("pay") && message.match(/\d+/)) {
    const amount = parseInt(message.match(/\d+/)[0]);
    const r = await mockApi.payBill(amount);
    return {
      reply: `Payment successful. New balance: ₹${r.newBalance}.`,
      action: "payBill"
    };
  }

  if (message.includes("emi")) {
    const match = message.match(/(\d+)/g);
    const amount = match ? parseInt(match[0]) : 1000;
    const tenure = match && match[1] ? parseInt(match[1]) : 6;

    const r = await mockApi.convertToEMI(amount, tenure);
    return {
      reply: `Your EMI is ₹${r.emi}/month for ${r.tenure} months.`,
      action: "emi"
    };
  }

  if (message.includes("statement")) {
    const month = message.match(/[a-zA-Z]+/)?.[0] || "January";
    const r = await mockApi.generateStatement(month);

    return {
      reply: `Here is your statement for ${month}: ${r.url}`,
      action: "statement"
    };
  }

  if (message.includes("dispute") && message.match(/tx\d+/i)) {
    const txnId = message.match(/tx\d+/i)[0].toUpperCase();
    const reason = "user reported an issue";
    const r = await mockApi.raiseDispute(txnId, reason);
    return {
      reply: `Dispute raised. Ticket ID: ${r.ticketId}`,
      action: "dispute"
    };
  }

  return { reply: "I didn’t understand that. Can you rephrase?" };
};
