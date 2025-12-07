// components/ChatBox.js
import React, { useEffect, useRef, useState } from "react";

/* Small SVG icons */
function IconMicrophone({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 11v1a7 7 0 0 1-14 0v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 21v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSend({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2l-7 20  -3-9-9-3 19-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ChatBox() {
  const [userId, setUserId] = useState("user123");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { who: "bot", text: "Hello — I’m OneCard Assistant. Ask me about your card, transactions, statements or say 'Block my card' to freeze it." }
  ]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [cardSummary, setCardSummary] = useState({
    status: "Active",
    balance: 15000,
    limit: 200000,
    dueDate: "2025-01-20",
    delivery: "Out for Delivery"
  });
  const [transactions, setTransactions] = useState([]);
  const messagesRef = useRef(null);
  const lastBotRef = useRef("");

  // Auto-scroll on new messages
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight + 200;
    }
  }, [messages, loading]);

  // Append message helpers
  function append(who, text, meta) {
    setMessages((prev) => [...prev, { who, text, meta }]);
  }

  // Simple TTS for last bot reply
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    try {
      const ut = new SpeechSynthesisUtterance(text);
      ut.lang = "en-IN";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(ut);
    } catch (e) {
      console.warn("TTS failed", e);
    }
  }

  // Send message to backend API
  async function sendMessage(msg) {
    const text = (msg ?? input).trim();
    if (!text) return;
    append("user", text);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();

      const botText = data.reply || data.text || data.response || "Done.";
      append("bot", botText, data);
      lastBotRef.current = botText;

      if (data.list && Array.isArray(data.list)) {
        setTransactions(data.list);
      }
      if (data.card) {
        setCardSummary((s) => ({ ...s, ...data.card }));
      }
      if (data.actionData) {
        const ad = data.actionData;
        if (ad.newBalance !== undefined) setCardSummary((s) => ({ ...s, balance: ad.newBalance }));
        if (ad.status) setCardSummary((s) => ({ ...s, status: ad.status }));
      }

      speak(botText);
    } catch (err) {
      append("bot", "Network error: could not reach backend. Make sure your dev server is running.");
    } finally {
      setLoading(false);
    }
  }

  // Start voice recognition
  function startListening() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      append("bot", "Speech recognition is not supported in this browser. Use Chrome.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (ev) => {
      const transcript = ev.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognition.onerror = (e) => {
      console.warn("STT error", e);
      append("bot", "Voice recognition error: " + (e.error || "unknown"));
      setListening(false);
    };

    recognition.start();
  }

  // Quick action helpers
  async function handleFreeze() {
    append("user", "Freeze my card");
    setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "freeze card" })
      });
      const d = await r.json();
      append("bot", d.reply || d.text || "Card frozen (mock).");
      if (d.actionData && d.actionData.status) setCardSummary((s) => ({ ...s, status: d.actionData.status }));
      speak(d.reply || "Card frozen (mock).");
    } catch (e) {
      append("bot", "Network error while freezing.");
    } finally {
      setLoading(false);
    }
  }

  async function handleShowTx() {
    append("user", "Show recent transactions");
    setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "show recent transactions" })
      });
      const d = await r.json();
      append("bot", d.reply || "Here are recent transactions.");
      if (d.list) setTransactions(d.list);
    } catch (e) {
      append("bot", "Network error while fetching tx.");
    } finally {
      setLoading(false);
    }
  }

  // keyboard send
  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function fmt(n) {
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
    } catch (e) {
      return "₹" + n;
    }
  }

  return (
    <div className="onecard-chat-root">
      <div className="left-panel">
        <div className="brand">
          <div className="brand-logo">OC</div>
          <div>
            <h2>OneCard Assistant</h2>
            <p className="muted">Your GenAI card assistant (mock)</p>
          </div>
        </div>

        <div className="card-summary card">
          <div className="card-top">
            <div>
              <div className="label">Card status</div>
              <div className="value">{cardSummary.status}</div>
            </div>
            <div>
              <div className="label">Balance</div>
              <div className="value">{fmt(cardSummary.balance)}</div>
            </div>
          </div>

          <div className="card-bottom">
            <div>
              <div className="label">Limit</div>
              <div className="value">{fmt(cardSummary.limit)}</div>
            </div>
            <div>
              <div className="label">Due</div>
              <div className="value">{cardSummary.dueDate}</div>
            </div>
          </div>

          <div className="delivery">
            <div className="label">Delivery</div>
            <div className="muted">{cardSummary.delivery}</div>
            <div className="actions">
              <button className="btn small" onClick={handleFreeze}>Freeze Card</button>
              <button className="btn small ghost" onClick={handleShowTx}>Show Transactions</button>
            </div>
          </div>
        </div>

        <div className="transactions card">
          <div className="card-head">
            <strong>Recent Transactions</strong>
            <button className="link-btn" onClick={handleShowTx}>Refresh</button>
          </div>
          <div className="tx-list">
            {transactions.length === 0 ? (
              <div className="muted small">No transactions loaded. Try "Show recent transactions".</div>
            ) : (
              transactions.map((t) => (
                <div className="tx-row" key={t.id}>
                  <div>
                    <div className="tx-merchant">{t.merchant}</div>
                    <div className="muted small">{t.date} • {t.category}</div>
                  </div>
                  <div className="tx-amt">{fmt(t.amount)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="help card">
          <div className="card-head"><strong>Quick Tips</strong></div>
          <ul className="tips">
            <li>Ask: <code>Where is my card?</code></li>
            <li>Say: <code>Block my card</code> to freeze</li>
            <li>Try: <code>Convert TX104 to EMI for 6 months</code></li>
            <li>Use the 🎙️ button to speak</li>
          </ul>
        </div>
      </div>

      <div className="right-panel">
        <div className="chat-area card">
          <div className="messages" ref={messagesRef}>
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.who === "user" ? "mine" : "bot"}`}>
                <div className="bubble">
                  <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, "<br/>") }} />
                </div>
              </div>
            ))}
            {loading && (
              <div className="msg bot">
                <div className="bubble small muted">Thinking…</div>
              </div>
            )}
          </div>

          <div className="composer">
            <textarea
              placeholder="Type a message or press 🎙️ to speak..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <div className="composer-actions">
              <button className={`mic ${listening ? "active" : ""}`} title="Speak" onClick={startListening}>
                <IconMicrophone />
              </button>
              <button className="send" onClick={() => sendMessage()}>
                <IconSend />
              </button>
            </div>
          </div>
        </div>

        <div className="footer card">
          <div className="footer-left">
            <small className="muted">Connected as</small>
            <div><strong>{userId}</strong></div>
          </div>
          <div className="footer-right">
            <button className="btn" onClick={() => {
              setMessages([{ who: "bot", text: "Hello — I’m OneCard Assistant. Ask me about your card, transactions, statements or say 'Block my card' to freeze it." }]);
              setTransactions([]);
            }}>Reset Chat</button>
          </div>
        </div>
      </div>
    </div>
  );
}
