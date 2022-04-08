const { Block, Transaction, BlockChain } = require("./index.js");

var EC = require("elliptic").ec;

// Create and initialize EC context
// (better do it once and reuse it)
var ec = new EC("secp256k1");

// Generate keys
var key1 = ec.genKeyPair();
const privateKey1 = key1.getPrivate("hex");
const walletNumber1 = key1.getPublic("hex");

var key2 = ec.genKeyPair();
const privateKey2 = key2.getPrivate("hex");
const walletNumber2 = key2.getPublic("hex");

const pcoin = new BlockChain();

const tx1 = new Transaction(walletNumber1, walletNumber2, 100);

tx1.signTransaction(key1);
pcoin.addTransaction(tx1);

pcoin.minePendingTransactions(walletNumber1);
console.log(pcoin.getBalanceAddress(walletNumber1));
console.log(pcoin.getBalanceAddress(walletNumber2));

const tx2 = new Transaction(walletNumber2, walletNumber1, 30);
tx2.signTransaction(key2);
pcoin.addTransaction(tx2);

pcoin.minePendingTransactions(walletNumber1);
console.log(pcoin.getBalanceAddress(walletNumber1));
console.log(pcoin.getBalanceAddress(walletNumber2));

// pcoin.chain[1].transaction[1] = "Hacked";
console.log(pcoin.isBlockChainValid());
