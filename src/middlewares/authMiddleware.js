const jwt = require("jsonwebtoken");
require("dotenv").config();

// const JWT_SECRET = process.env.SECRET;

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: "Access denied" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid token format" });
  }

  const token = parts[1];
  try {
    console.log("JWT_SECRET:", process.env.JWT_SECRET); // ✅ Debugging
    console.log("Token Received:", token); // ✅ Debugging
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded User:", decoded); // ✅ Check if role exists in token
    req.user = decoded;
    next();

  } catch (err) {
    console.error("JWT Verification Error:", err); // ✅ Log error details
    return res.status(401).json({ message: "Invalid token" });
  }
};


module.exports.adminOnly = (req, res, next) => {
  console.log("User in adminOnly:", req.user); // ✅ Debugging
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
