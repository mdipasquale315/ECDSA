import { useState } from "react";
import server from "./server";

export default function Wallet({ setAddress, setBalance, setPrivateKey }) {
  const [loading, setLoading] = useState(false);

  async function createWallet() {
    setLoading(true);
    const res = await server.post("/new-wallet");
    setPrivateKey(res.data.privateKey);
    setAddress(res.data.address);
    setBalance(res.data.balance);
    setLoading(false);
  }

  return (
    <div>
      <button onClick={createWallet} disabled={loading}>
        {loading ? "Generating..." : "Generate Wallet"}
      </button>
    </div>
  );
}
