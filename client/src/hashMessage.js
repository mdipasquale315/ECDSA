import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";

export function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}
