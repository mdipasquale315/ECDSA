import Wallet from "./Wallet";
import Transfer from "./Transfer";
import ParticleBackground from "./ParticleBackground";
import { useState } from "react";

export default function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <ParticleBackground />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="z-10 w-full max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center transform rotate-12 animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                ECDSA Exchange
              </h1>
            </div>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Secure digital asset transfers powered by Elliptic Curve Digital Signatures
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="animate-slide-in-left">
            <Wallet 
              setBalance={setBalance} 
              setAddress={setAddress} 
              setPrivateKey={setPrivateKey} 
            />
          </div>
          
          <div className="animate-slide-in-right">
            {privateKey && address ? (
              <Transfer 
                privateKey={privateKey} 
                address={address} 
                setBalance={setBalance} 
              />
            ) : (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-400 mb-2">Wallet Not Connected</h3>
                  <p className="text-gray-500">Enter your private key to start transferring</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
          <div className="bg-gradient-to-br from-purple-500/10 to-transparent backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Security</p>
                <p className="text-white font-bold">256-bit ECDSA</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-transparent backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Speed</p>
                <p className="text-white font-bold">Instant Transfers</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500/10 to-transparent backdrop-blur-sm rounded-xl p-6 border border-pink-500/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Network</p>
                <p className="text-white font-bold">Decentralized</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
