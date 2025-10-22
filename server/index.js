const express = require("express");
const cors = require("cors");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex, hexToBytes } = require("ethereum-cryptography/utils");
const secp = require("ethereum-cryptography/secp256k1");

const app = express();
const port = process.env.PORT || 3042;

app.use(cors());
app.use(express.json());

// -------------------- helpers --------------------
function getAddressFromPublicKey(publicKey) {
  // Remove prefix byte and hash with keccak256
  const pubNoPrefix = publicKey.slice(1);
  const hash = keccak256(pubNoPrefix);
  return "0x" + toHex(hash.slice(-20));
}

// -------------------- in-memory store --------------------
const balances = {}; // { address: balance }
const nonces = {};   // { address: nonce }

// Create new wallet (returns private key, public key, and address)
app.post("/new-wallet", (req, res) => {
  const privateKey = secp.utils.randomPrivateKey();
  const publicKey = secp.getPublicKey(privateKey);
  const address = getAddressFromPublicKey(publicKey);

  // Initialize balances & nonce
  balances[address] = 100;
  nonces[address] = 0;

  res.send({
    privateKey: toHex(privateKey),
    publicKey: toHex(publicKey),
    address,
    balance: balances[address],
  });
});

// Get balance
app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  balances[address] = balances[address] || 0;
  nonces[address] = nonces[address] || 0;
  res.send({ balance: balances[address], nonce: nonces[address] });
});

// Sign a transaction on the server
// Client provides private key, recipient, amount
app.post("/sign", async (req, res) => {
  try {
    const { privateKey, recipient, amount } = req.body;
    const senderKey = hexToBytes(privateKey);
    const publicKey = secp.getPublicKey(senderKey);
    const senderAddress = getAddressFromPublicKey(publicKey);

    // Increment nonce for the sender
    nonces[senderAddress] = nonces[senderAddress] || 0;
    const nonce = nonces[senderAddress];

    const message = JSON.stringify({ sender: senderAddress, recipient, amount, nonce });
    const msgHash = keccak256(utf8ToBytes(message));

    // Sign message
    const [signature, recoveryBit] = await secp.sign(msgHash, senderKey, { recovered: true });

    res.send({
      message,
      signature: toHex(signature),
      recoveryBit,
      sender: senderAddress,
      nonce,
    });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// Send funds (verify signature and update balances)
app.post("/send", async (req, res) => {
  try {
    const { message, signature, recoveryBit } = req.body;
    const messageHash = keccak256(utf8ToBytes(message));
    const signatureBytes = hexToBytes(signature);

    // Recover public key
    const recoveredPubKey = secp.recoverPublicKey(messageHash, signatureBytes, recoveryBit);
    const senderAddress = getAddressFromPublicKey(recoveredPubKey);

    // Parse message
    const { sender, recipient, amount, nonce } = JSON.parse(message);

    if (sender !== senderAddress) throw new Error("Signature mismatch!");
    if ((nonces[sender] || 0) !== nonce) throw new Error("Invalid nonce!");

    balances[sender] = balances[sender] || 0;
    balances[recipient] = balances[recipient] || 0;

    if (balances[sender] < amount) throw new Error("Insufficient funds!");

    // Execute transfer
    balances[sender] -= Number(amount);
    balances[recipient] += Number(amount);
    nonces[sender] += 1;

    res.send({ balance: balances[sender], nonce: nonces[sender] });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
