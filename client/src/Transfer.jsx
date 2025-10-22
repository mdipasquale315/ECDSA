import { useState } from "react";
import axios from "axios";

export default function Transfer() {
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("https://your-backend-url.com/send", {
        sender,
        recipient,
        amount,
      });
      setStatus(data.message || "✅ Transaction sent!");
    } catch {
      setStatus("❌ Transfer failed.");
    }
  };

  return (
    <form
      onSubmit={handleTransfer}
      className="mt-6 bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 w-96 text-center shadow-lg backdrop-blur-sm"
    >
      <h2 className="text-xl font-semibold mb-3">Send Tokens</h2>
      <input
        placeholder="Sender address"
        className="w-full p-2 mb-2 bg-black/50 text-purple-300 border border-purple-700 rounded-lg"
        value={sender}
        onChange={(e) => setSender(e.target.value)}
      />
      <input
        placeholder="Recipient address"
        className="w-full p-2 mb-2 bg-black/50 text-purple-300 border border-purple-700 rounded-lg"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        placeholder="Amount"
        className="w-full p-2 mb-3 bg-black/50 text-purple-300 border border-purple-700 rounded-lg"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition"
      >
        🚀 Send
      </button>
      {status && <p className="mt-3 text-sm text-purple-400">{status}</p>}
    </form>
  );
}
