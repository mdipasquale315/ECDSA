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
    <form onSubmit={transfer} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
      <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Send Transaction</h2>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-gray-300 mb-2 font-medium text-sm sm:text-base">
            Amount (ETH)
          </label>
          <div className="relative">
            <input
              className="w-full bg-gray-900/50 text-white border border-gray-600 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 pr-14 sm:pr-16 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm sm:text-base"
              placeholder="0.00"
              value={sendAmount}
              onChange={setValue(setSendAmount)}
              type="number"
              min="1"
              step="1"
              disabled={loading}
            />
            <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs sm:text-sm">
              ETH
            </div>
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-medium text-sm sm:text-base">
            Recipient Address
          </label>
          <input
            className="w-full bg-gray-900/50 text-white border border-gray-600 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 font-mono text-xs sm:text-sm"
            placeholder="Enter recipient's public key..."
            value={recipient}
            onChange={setValue(setRecipient)}
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/50 rounded-lg sm:rounded-xl flex items-start space-x-2 sm:space-x-3 animate-shake">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="text-red-400 font-semibold mb-1 text-sm sm:text-base">Transaction Failed</div>
            <div className="text-red-300 text-xs sm:text-sm">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-500/10 border border-green-500/50 rounded-lg sm:rounded-xl flex items-start space-x-2 sm:space-x-3 animate-slide-in">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="text-green-400 font-semibold mb-1 text-sm sm:text-base">Success!</div>
            <div className="text-green-300 text-xs sm:text-sm">{success}</div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`mt-4 sm:mt-6 w-full font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-200 transform text-sm sm:text-base ${
          loading 
            ? 'bg-gray-700 cursor-not-allowed scale-95' 
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50'
        } text-white flex items-center justify-center space-x-2`}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
<span>Send Transaction</span>
</>
)}
</button>
  {/* Transaction Preview */}
  {sendAmount && recipient && !loading && (
    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg sm:rounded-xl">
      <div className="text-gray-400 text-[10px] sm:text-xs mb-2 uppercase tracking-wide">Transaction Preview</div>
      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Amount:</span>
          <span className="text-white font-bold">{sendAmount} ETH</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-gray-400 flex-shrink-0">To:</span>
          <span className="text-white font-mono text-[10px] sm:text-xs text-right break-all ml-2">
            {recipient.substring(0, 10)}...{recipient.substring(recipient.length - 10)}
          </span>
        </div>
      </div>
    </div>
  )}
</form>
);
}
