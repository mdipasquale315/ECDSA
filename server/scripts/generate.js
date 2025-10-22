const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const privateKey = secp256k1.utils.randomPrivateKey();

console.log('\n=== Generated Keypair ===\n');
console.log('Private key:', toHex(privateKey));

const publicKey = secp256k1.getPublicKey(privateKey);

console.log('Public key:', toHex(publicKey));
console.log('\n========================\n');
console.log('Save the private key securely!');
console.log('Use the public key as the address in server/index.js balances');
