import { useState } from "react";
import axios from "./server";

export default function Wallet({ setBalance, setAddress, setPrivateKey }) {
  const [loading, setLoading] = useState(false);

  async function createWallet() {
    setLoading(true);
    const res = await axios.post("/new-wallet");
    setPrivateKey(res.data.privateKey);
    setAddress(res.data.address);
    setBalance(res.data.balance);
    setLoading(false);
  }

  return (
    <div className="bg-darkCard p-8 rounded-3xl glow-card w-96 text-center mb-8 transform hover:scale-105 transition-transform duration-300">
      <h1 className="text-3xl mb-4 glitch-text">⚡ Futuristic Wallet</h1>
      <button
        onClick={createWallet}
        disabled={loading}
        className="px-6 py-3 mb-6 text-darkBg bg-neonBlue rounded-full font-bold hover:bg-neonPink transition-colors animate-pulse shadow-neonBlue/50"
      >
        {loading ? "Generating..." : "Generate Wallet"}
      </button>
    </div>
  );
}
