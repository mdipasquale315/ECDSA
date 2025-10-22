import { useState } from "react";
import server from "./server";
import { generateKeys } from "./generateKeys";

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const key = evt.target.value;
    setPrivateKey(key);

    try {
      const response = await server.get(`/balance/${key}`);
      setBalance(response.data.balance);
      setAddress(response.data.address);
    } catch (error) {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>
      <label>Private Key</label>
      <input placeholder="Enter your private key" value={privateKey} onChange={onChange} />

      <div>Address: {address || "N/A"}</div>
      <div>Balance: {balance}</div>

      <button onClick={() => {
        const keys = generateKeys();
        setPrivateKey(keys.privateKey);
        setAddress(keys.address);
        alert(`New Wallet Generated:\nAddress: ${keys.address}`);
      }}>
        Generate New Wallet
      </button>
    </div>
  );
}

export default Wallet;
