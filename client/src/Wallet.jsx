import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";
import { useState } from "react";

export default function Wallet({ setBalance, setAddress, setPrivateKey }) {
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [localAddress, setLocalAddress] = useState("");
  const [localBalance, setLocalBalance] = useState(0);

  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKeyInput(privateKey);
    setError("");

    if (privateKey.length === 0) {
      setAddress("");
      setBalance(0);
      setPrivateKey("");
      setLocalAddress("");
      setLocalBalance(0);
      return;
    }

    if (privateKey.length !== 64) {
      return;
    }

    setLoading(true);

    try {
      if (!/^[0-9a-fA-F]{64}$/.test(privateKey)) {
        setError("Invalid private key format. Must be 64 hex characters.");
        setLoading(false);
        return;
      }

      const privateKeyBytes = Uint8Array.from(
        privateKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );

      const publicKey = secp256k1.getPublicKey(privateKeyBytes);
      const derivedAddress = toHex(publicKey);

      setAddress(derivedAddress);
      setPrivateKey(privateKey);
      setLocalAddress(derivedAddress);

      try {
        const response = await server.get(`balance/${derivedAddress}`);
        setBalance(response.data.balance);
        setLocalBalance(response.data.balance);
      } catch (err) {
        console.error("Error fetching balance:", err);
        setBalance(0);
        setLocalBalance(0);
      }
    } catch (ex) {
      console.error(ex);
      setError("Error deriving address from private key");
      setAddress("");
      setBalance(0);
      setPrivateKey("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Your Wallet</h2>
      </div>
      
      <label className="block text-gray-300 mb-2 font-medium">
        Private Key
      </label>
      
      <div className="relative mb-4">
        <input
          className="w-full bg-gray-900/50 text-white border border-gray-600 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 font-mono text-sm"
          placeholder="Enter your 64 character private key..."
          value={privateKeyInput}
          onChange={onChange}
          type={showKey ? "text" : "password"}
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          {showKey ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-2 animate-shake">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      )}

      {localAddress && !loading && (
        <div className="space-y-4 animate-fade-in">
          {/* Address Section */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">Address</span>
              <button 
                onClick={() => navigator.clipboard.writeText(localAddress)}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="text-white font-mono text-xs break-all leading-relaxed">
              {localAddress}
            </div>
          </div>

          {/* Balance Section */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20 text-center">
            <div className="text-gray-400 text-sm mb-2 font-medium">Total Balance</div>
            <div className="text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1">
              {localBalance}
            </div>
            <div className="text-gray-400 text-sm">ETH</div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Wallet Connected</span>
          </div>
        </div>
      )}
    </div>
  );
}
