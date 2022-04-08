var EC = require("elliptic").ec;

// Create and initialize EC context
// (better do it once and reuse it)
var ec = new EC("secp256k1");

// Generate keys
var key = ec.genKeyPair();

const privateKey = key.getPrivate("hex");
const publicKey = key.getPublic("hex");

console.log(privateKey, publicKey);
