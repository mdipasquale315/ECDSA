import Wallet from "./Wallet";
import Transfer from "./Transfer";
import ParticleBackground from "./ParticleBackground";
import { useState } from "react";

export default function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-black">
      <ParticleBackground />
      <Wallet setBalance={setBalance} setAddress={setAddress} setPrivateKey={setPrivateKey} />
      {privateKey && address && (
        <Transfer privateKey={privateKey} address={address} setBalance={setBalance} />
      )}
    </div>
  );
}
