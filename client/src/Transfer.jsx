import { useState } from "react";
import server from "./server";
import { signMessage } from "./signMessage";

function Transfer({ address, setBalance, privateKey }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  async function transfer(evt) {
    evt.preventDefault();

    const message = JSON.stringify({ sender: address, amount, recipient });
    const { signature, recoveryBit } = await signMessage(message, privateKey);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        message,
        signature,
        recoveryBit,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>Send Amount</label>
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1, 2, 3..." />

      <label>Recipient Address</label>
      <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." />

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
