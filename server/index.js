const express = require("express");
const cors = require("cors");
const app = express();
const port = 3042;

const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");
const secp = require("ethereum-cryptography/secp256k1");

app.use(cors());
app.use(express.json());

const balances = {};

function toAddress(publicKey) {
  return "0x" + toHex(keccak256(publicKey.slice(1)).slice(-20));
}

app.get("/balance/:privateKey", (req, res) => {
  try {
    const privateKey = req.params.privateKey;
    const publicKey = secp.getPublicKey(privateKey);
    const address = toAddress(publicKey);
    const balance = balances[address] || 0;
    res.send({ balance, address });
  } catch (err) {
    res.status(400).send({ message: "Invalid private key" });
  }
});

app.post("/send", async (req, res) => {
  const { message, signature, recoveryBit } = req.body;

  try {
    const hashed = keccak256(utf8ToBytes(message));
    const recoveredPublicKey = secp.recoverPublicKey(hashed, signature, recoveryBit);
    const sender = toAddress(recoveredPublicKey);

    const { sender: senderAddr, recipient, amount } = JSON.parse(message);
    if (sender !== senderAddr) throw new Error("Invalid signature!");

    if (!balances[sender]) balances[sender] = 100;
    if (!balances[recipient]) balances[recipient] = 0;

    if (balances[sender] < amount) throw new Error("Insufficient funds!");

    balances[sender] -= Number(amount);
    balances[recipient] += Number(amount);

    res.send({ balance: balances[sender] });
  } catch (e) {
    res.status(400).send({ message: e.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
