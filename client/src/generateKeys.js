import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex } from "ethereum-cryptography/utils";

// Create Ethereum-style address (0x + last 20 bytes of keccak(publicKey))
export function generateKeys() {
  const privateKey = secp.utils.randomPrivateKey();
  const publicKey = secp.getPublicKey(privateKey);
  const address = "0x" + toHex(keccak256(publicKey.slice(1)).slice(-20));
  return { privateKey: toHex(privateKey), publicKey: toHex(publicKey), address };
}
