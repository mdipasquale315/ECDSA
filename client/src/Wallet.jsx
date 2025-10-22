import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";
import { useState } from "react";

export default function Wallet({ setBalance, setAddress, setPrivateKey }) {
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [error, setError] = useState("");

  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKeyInput(privateKey);
    setError("");

    if (privateKey.length === 0) {
      setAddress("");
      setBalance(0);
      setPrivateKey("");
      return;
    }

    try {
      // Convert hex string to bytes
      const privateKeyBytes = privateKey.length === 64 
        ? Uint8Array.from(Buffer.from(privateKey, 'hex'))
        : null;

      if (!privateKeyBytes || privateKeyBytes.length !== 32) {
        setError("Invalid private key format. Must be 64 hex characters.");
        return;
      }

      // Generate public key
      const publicKey = secp256k1.getPublicKey(privateKeyBytes);
      const address = toHex(publicKey);

      setAddress(address);
      setPrivateKey(privateKey);

      // Get balance from server
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      
      setBalance(balance);
    } catch (ex) {
      console.error(ex);
      setError("Error deriving address from private key");
      setAddress("");
      setBalance(0);
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-700 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">Your Wallet</h2>
      
      <label className="block text-gray-300 mb-2">
        Private Key (64 hex characters)
      </label>
      <input
        className="w-full bg-gray-800 text-white border border-gray-600 rounded px-4 py-2 mb-2 focus:outline-none focus:border-blue-500"
        placeholder="Enter your private key"
        value={privateKeyInput}
        onChange={onChange}
        type="password"
      />
      
      {error && (
        <div className="text-red-400 text-sm mb-2">{error}</div>
      )}

      {address && (
        <div className="mt-4">
          <div className="text-gray-400 text-sm mb-1">Address:</div>
          <div className="text-white font-mono text-xs break-all bg-gray-800 p-2 rounded">
            {address}
          </div>
          
          <div className="text-gray-400 text-sm mt-3 mb-1">Balance:</div>
          <div className="text-2xl font-bold text-green-400">
            {balance} ETH
          </div>
        </div>
      )}
    </div>
  );
}
