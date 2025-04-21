const jwt = require("jsonwebtoken");

// ✅ Generate Access Token (15 minutes)
// const generateAccessToken = (userId, email) => {
//   return jwt.sign({ _id:user._id, email:user.email }, process.env.JWT_SECRET, { expiresIn: "15m" });
// };
const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// ✅ Generate Refresh Token (24 hours)
const generateRefreshToken = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ✅ Generate Password Reset Token (5 minutes)
const generateResetToken = (userId) => {
  return jwt.sign({ userId, type: "password-reset" }, process.env.JWT_SECRET, { expiresIn: "5m" });
};

// ✅ Verify Any JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("🚨 JWT Verification Error:", error.message);
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyToken,
};
