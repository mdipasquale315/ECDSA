import { useState } from "react";
import server from "./server";

export default function Transfer({ privateKey, address, setBalance }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  async function send(e) {
    e.preventDefault();
    try {
      const { data } = await server.post("/sign", { privateKey, recipient, amount });
      const sendRes = await server.post("/send", {
        message: data.message,
        signature: data.signature,
        recoveryBit: data.recoveryBit,
      });
      setBalance(sendRes.data.balance);
      alert("Transfer successful!");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }

  return (
    <form onSubmit={send}>
      <input placeholder="Recipient" value={recipient} onChange={e => setRecipient(e.target.value)} />
      <input placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
      <button type="submit">Send</button>
    </form>
  );
}
