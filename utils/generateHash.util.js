const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const generateHash = async (plainPassword) => {
  try {
    const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hashed;
  } catch (err) {
    throw new Error('Hashing failed: ' + err.message);
  }
};

module.exports = generateHash;