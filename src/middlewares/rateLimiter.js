require("dotenv").config();
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT || 100, // Limit each IP to 100 requests
  message: 'Too many requests from this IP, please try again later.',
});

module.exports = limiter;
