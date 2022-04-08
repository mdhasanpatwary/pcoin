let sha256 = require("crypto-js/sha256");
var EC = require("elliptic").ec;
var ec = new EC("secp256k1");

class Block {
  constructor(timestamp, transaction, prevHash = "") {
    this.timestamp = timestamp;
    this.transaction = transaction;
    this.prevHash = prevHash;
    this.hash = this.generateHash();
    this.nonce = 0;
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.generateHash();
    }
    console.log("Mining Done: " + this.hash);
  }

  generateHash() {
    return sha256(
      this.timestamp +
        JSON.stringify(this.transaction) +
        this.prevHash +
        this.nonce
    ).toString();
  }

  hashValidTransactions() {
    for (const tx of this.transaction) {
      if (!tx.isValid) {
        return false;
      }
      return true;
    }
  }
}

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  calculateHash() {
    return sha256(this.fromAddress + this.toAddress + this.amount).toString();
  }

  signTransaction(key) {
    if (key.getPublic("hex") !== this.fromAddress) {
      throw new Error("You do not have access!");
    }
    const hashTx = this.calculateHash();
    const signature = key.sign(hashTx, "base64");

    // Export DER encoded signature in Array
    this.signature = signature.toDER();
  }

  isValid() {
    if (this.fromAddress === null) true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error("No Signature Found!");
    }
    const key = ec.keyFromPublic(this.fromAddress, "hex");
    return key.verify(this.calculateHash(), this.signature);
  }
}

class BlockChain {
  constructor() {
    this.chain = [this.generateGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactios = [];
    this.miningReward = 10;
  }

  generateGenesisBlock() {
    return new Block(Date.now(), "GENESIS", "00000");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Cannot Process Transaction!");
    }

    if (!transaction.isValid()) {
      throw new Error("Invalid Transaction!");
    }

    if (transaction.amount < 0) {
      throw new Error("Invalid Transaction Amount!");
    }

    // if (transaction.amount > this.getBalanceAddress(transaction.fromAddress)) {
    //   throw new Error("Not Enough Balance!");
    // }

    this.pendingTransactios.push(transaction);
  }

  minePendingTransactions(minerAddress) {
    let block = new Block(Date.now(), this.pendingTransactios);
    block.mineBlock(this.difficulty);
    this.chain.push(block);
    this.pendingTransactios = [
      new Transaction(null, minerAddress, this.miningReward),
    ];
  }

  isBlockChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      let currentBlock = this.chain[i];
      let PreviousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.generateHash()) {
        return false;
      }

      if (currentBlock.prevHash !== PreviousBlock.hash) {
        return false;
      }

      if (!currentBlock.hashValidTransactions()) {
        return false;
      }
      return true;
    }
  }

  getBalanceAddress(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const trans of block.transaction) {
        //if sender
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        //if receiver
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }
    return balance;
  }
}

module.exports = {
  Block,
  Transaction,
  BlockChain,
};
