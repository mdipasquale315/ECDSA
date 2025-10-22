import ParticleBackground from "./ParticleBackground";
import Wallet from "./Wallet";
import Transfer from "./Transfer";

export default function App() {
  return (
    <div className="relative min-h-screen text-purple-200 font-mono">
      <ParticleBackground />
      <div className="flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-6 tracking-widest">
          ⚡ ECDSA Futuristic Wallet
        </h1>
        <Wallet />
        <Transfer />
      </div>
    </div>
  );
}
