import * as secp from "ethereum-cryptography/secp256k1";
import { hashMessage } from "./hashMessage.js";

export async function signMessage(message, privateKey) {
  const hashed = hashMessage(message);
  const [signature, recoveryBit] = await secp.sign(hashed, privateKey, { recovered: true });
  return { signature: signature.toHex(), recoveryBit };
}
