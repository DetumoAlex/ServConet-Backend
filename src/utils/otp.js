const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const generateOTP = (length = 6) => {
  return crypto.randomInt(100000, 999999).toString().slice(0, length);
};

const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

module.exports = { generateOTP, hashOTP };
