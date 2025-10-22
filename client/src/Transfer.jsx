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

      if (!/^[0-9a-fA-F]+$/.test(recipient)) {
        setError("Invalid recipient address format");
        setLoading(false);
        return;
      }

      const message = JSON.stringify({
        sender: address,
        recipient: recipient,
        amount: amount,
        nonce: Date.now()
      });

      const messageHash = keccak256(utf8ToBytes(message));

      const privateKeyBytes = Uint8Array.from(
        privateKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );
      
      const signature = await secp256k1.sign(messageHash, privateKeyBytes);

      const response = await server.post(`send`, {
        sender: address,
        recipient: recipient,
        amount: amount,
        message: message,
        signature: toHex(signature.toCompactRawBytes()),
        recovery: signature.recovery
      });

      setBalance(response.data.balance);
      setSuccess(`Successfully transferred ${amount} ETH!`);
      setSendAmount("");
      setRecipient("");
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (ex) {
      const errorMessage = ex?.response?.data?.message || ex.message || "Transfer failed";
      setError(errorMessage);
      console.error(ex);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={transfer} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Send Transaction</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2 font-medium">
            Amount (ETH)
          </label>
          <div className="relative">
            <input
              className="w-full bg-gray-900/50 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              placeholder="0.00"
              value={sendAmount}
              onChange={setValue(setSendAmount)}
              type="number"
              min="1"
              step="1"
              disabled={loading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
              ETH
            </div>
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-medium">
            Recipient Address
          </label>
          <input
            className="w-full bg-gray-900/50 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 font-mono text-sm"
            placeholder="Enter recipient's public key..."
            value={recipient}
            onChange={setValue(setRecipient)}
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start space-x-3 animate-shake">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="text-red-400 font-semibold mb-1">Transaction Failed</div>
            <div className="text-red-300 text-sm">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/50 rounded-xl flex items-start space-x-3 animate-slide-in">
          <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="text-green-400 font-semibold mb-1">Success!</div>
            <div className="text-green-300 text-sm">{success}</div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`mt-6 w-full font-bold py-4 px-6 rounded-xl transition-all duration-200 transform ${
          loading 
            ? 'bg-gray-700 cursor-not-allowed scale-95' 
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50'
        } text-white flex items-center justify-center space-x-2`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Send Transaction</span>
          </>
        )}
      </button>

      {/* Transaction Preview */}
      {sendAmount && recipient && !loading && (
        <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
          <div className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Transaction Preview</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Amount:</span>
              <span className="text-white font-bold">{sendAmount} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">To:</span>
              <span className="text-white font-mono text-xs">{recipient.substring(0, 16)}...</span>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
