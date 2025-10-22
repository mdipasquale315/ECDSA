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
  const [loading, setLoading] = useState(false);

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validate inputs
      if (!recipient || !sendAmount) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      const amount = parseInt(sendAmount);
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid amount");
        setLoading(false);
        return;
      }

      // Validate recipient address
      if (!/^[0-9a-fA-F]+$/.test(recipient)) {
        setError("Invalid recipient address format");
        setLoading(false);
        return;
      }

      // Create message to sign
      const message = JSON.stringify({
        sender: address,
        recipient: recipient,
        amount: amount,
        nonce: Date.now()
      });

      // Hash the message
      const messageHash = keccak256(utf8ToBytes(message));

      // Sign the message
      const privateKeyBytes = Uint8Array.from(
        privateKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );
      
      const signature = await secp256k1.sign(messageHash, privateKeyBytes);

      // Send signed transaction to server
      const response = await server.post(`send`, {
        sender: address,
        recipient: recipient,
        amount: amount,
        message: message,
        signature: toHex(signature.toCompactRawBytes()),
        recovery: signature.recovery
      });

      setBalance(response.data.balance);
      setSuccess(`Successfully sent ${amount} ETH to ${recipient.substring(0, 10)}...`);
      setSendAmount("");
      setRecipient("");
    } catch (ex) {
      const errorMessage = ex?.response?.data?.message || ex.message || "Transfer failed";
      setError(errorMessage);
      console.error(ex);
    } finally {
      setLoading(false);
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
        disabled={loading}
      />

      <label className="block text-gray-300 mb-2">
        Recipient Address
      </label>
      <input
        className="w-full bg-gray-800 text-white border border-gray-600 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500 font-mono text-sm"
        placeholder="Recipient's public key"
        value={recipient}
        onChange={setValue(setRecipient)}
        disabled={loading}
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
        disabled={loading}
        className={`w-full font-bold py-3 px-4 rounded transition duration-200 ${
          loading 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {loading ? 'Processing...' : 'Transfer'}
      </button>
    </form>
  );
}
