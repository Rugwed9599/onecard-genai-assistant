// pages/index.js
import Head from "next/head";
import ChatBox from "../components/ChatBox";

export default function Home() {
  return (
    <>
      <Head>
        <title>OneCard — GenAI Credit Card Assistant</title>
        <meta name="description" content="Demo assistant for OneCard — mock mode" />
      </Head>

      <main className="page-root">
        <div className="top-hero">
          <div className="hero-inner">
            <h1>OneCard — GenAI Credit Card Assistant</h1>
            <p className="muted">Chat with your card. Freeze/unfreeze, view statements, convert transactions to EMI, and more — demo (mock) mode.</p>
          </div>
        </div>

        <div className="container">
          <ChatBox />
        </div>

        <footer className="page-footer">
          <div>Made for demo • In-memory mock backend • Voice features require Chrome</div>
        </footer>
      </main>
    </>
  );
}
