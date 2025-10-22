import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";

export default function Transfer({ privateKey, address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Validate inputs
      if (!recipient || !sendAmount) {
        setError("Please fill in all fields");
        return;
      }

      const amount = parseInt(sendAmount);
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid amount");
        return;
      }

      // Create message to sign
      const message = JSON.stringify({
        recipient,
        amount,
        nonce: Date.now() // Prevent replay attacks
      });

      // Hash the message
      const messageHash = keccak256(utf8ToBytes(message));

      // Sign the message
      const privateKeyBytes = Uint8Array.from(Buffer.from(privateKey, 'hex'));
      const signature = await secp256k1.sign(messageHash, privateKeyBytes);

      // Send signed transaction to server
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        recipient,
        amount,
        message,
        signature: toHex(signature),
        recovery: signature.recovery
      });

      setBalance(balance);
      setSuccess(`Successfully sent ${amount} ETH to ${recipient.substring(0, 10)}...`);
      setSendAmount("");
      setRecipient("");
    } catch (ex) {
      const errorMessage = ex?.response?.data?.message || ex.message || "Transfer failed";
      setError(errorMessage);
      console.error(ex);
    }
  }

  return (
    <form onSubmit={transfer} className="bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-4">Send Transaction</h2>

      <label className="block text-gray-300 mb-2">
        Send Amount
      </label>
      <input
        className="w-full bg-gray-800 text-white border border-gray-600 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
        placeholder="Amount in ETH"
        value={sendAmount}
        onChange={setValue(setSendAmount)}
        type="number"
        min="1"
      />

      <label className="block text-gray-300 mb-2">
        Recipient Address
      </label>
      <input
        className="w-full bg-gray-800 text-white border border-gray-600 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500 font-mono text-sm"
        placeholder="Recipient's public key"
        value={recipient}
        onChange={setValue(setRecipient)}
      />

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-500 text-green-300 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200"
      >
        Transfer
      </button>
    </form>
  );
}
