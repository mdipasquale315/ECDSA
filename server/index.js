const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { hexToBytes, utf8ToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

// Balances keyed by public key (address)
const balances = {
  // You'll need to generate these with generate.js
  // Example public keys (you should generate your own):
  "": 100, // Replace with actual public key
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  try {
    const { sender, recipient, amount, message, signature, recovery } = req.body;

    // Validate inputs
    if (!sender || !recipient || !amount || !message || !signature) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    // Hash the message
    const messageHash = keccak256(utf8ToBytes(message));

    // Convert signature from hex to bytes
    const signatureBytes = hexToBytes(signature);

    // Recover public key from signature
    const recoveredPublicKey = secp256k1.Signature
      .fromCompact(signatureBytes)
      .addRecoveryBit(recovery)
      .recoverPublicKey(messageHash)
      .toHex();

    // Verify the sender matches the recovered public key
    if (recoveredPublicKey !== sender) {
      return res.status(400).send({ message: "Invalid signature! Sender mismatch." });
    }

    // Check if sender has sufficient balance
    if (!balances[sender] || balances[sender] < amount) {
      return res.status(400).send({ message: "Insufficient funds!" });
    }

    // Perform the transfer
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + amount;

    res.send({ balance: balances[sender], message: "Transfer successful!" });
  } catch (error) {
    console.error("Error processing transaction:", error);
    res.status(400).send({ message: "Transaction failed: " + error.message });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  console.log("\nAvailable addresses:");
  Object.keys(balances).forEach(address => {
    console.log(`${address}: ${balances[address]} ETH`);
  });
});
