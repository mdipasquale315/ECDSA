import { useState } from "react";
import axios from "./server";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, toHex, hexToBytes } from "ethereum-cryptography/utils";
import * as secp from "ethereum-cryptography/secp256k1";

export default function Transfer({ privateKey, address, setBalance }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  async function send() {
    const senderKey = hexToBytes(privateKey);
    const nonceRes = await axios.get(`/balance/${address}`);
    const nonce = nonceRes.data.nonce;

    const message = JSON.stringify({ sender: address, recipient, amount, nonce });
    const msgHash = keccak256(utf8ToBytes(message));
    const [signature, recoveryBit] = await secp.sign(msgHash, senderKey, { recovered: true });

    const res = await axios.post("/send", {
      message,
      signature: toHex(signature),
      recoveryBit,
    });

    setBalance(res.data.balance);
  }

  return (
    <div className="bg-darkCard p-8 rounded-3xl glow-card w-96 text-center transform hover:scale-105 transition-transform duration-300">
      <h2 className="text-xl mb-4 glitch-text">Send Funds</h2>
      <input
        className="w-full p-2 mb-4 rounded bg-darkBg text-neonBlue"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        className="w-full p-2 mb-4 rounded bg-darkBg text-neonBlue"
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        onClick={send}
        className="w-full py-3 bg-neonPink text-darkBg font-bold rounded-full hover:bg-neonBlue transition-colors animate-pulse shadow-neonPink/50"
      >
        Send
      </button>
    </div>
  );
}
