import { useState, useEffect } from "react";
import axios from "axios";

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return;
      const { data } = await axios.get(`https://your-backend-url.com/balance/${address}`);
      setBalance(data.balance);
    };
    fetchBalance();
  }, [address]);

  return (
    <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 w-96 text-center shadow-lg backdrop-blur-sm">
      <h2 className="text-xl font-semibold mb-3">Wallet Overview</h2>
      <input
        placeholder="Enter your address..."
        className="w-full p-2 bg-black/50 text-purple-300 border border-purple-700 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <p className="text-lg">Balance: <span className="font-bold text-purple-400">{balance}</span></p>
    </div>
  );
}
