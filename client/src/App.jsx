import { useState } from "react";
import Wallet from "./Wallet";
import Transfer from "./Transfer";
import ParticleBackground from "./ParticleBackground";

export default function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      <ParticleBackground />
      <div className="absolute top-0 left-0 w-full h-full neon-grid -z-10"></div>

      <Wallet setBalance={setBalance} setAddress={setAddress} setPrivateKey={setPrivateKey} />
      {privateKey && address && (
        <Transfer privateKey={privateKey} address={address} setBalance={setBalance} />
      )}
    </div>
  );
}
