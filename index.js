// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./src/config/db');
const path = require('path');
const { initiateSocket } = require('./src/controllers/socketController');
const { redisClient } = require("./src/services/redis-service");


const app = express();
connectDB()

const server = http.createServer(app);

const io = initiateSocket(server);


// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use((req, res, next) => {
  req.io = io;
  next();
});

const routes = require('./src/routes/index');
app.use('/api', routes)

// Default Route
app.get('/', (req, res) => {
  res.send('Service App API is running');
});

// Verify Redis connection
redisClient
  .ping()
  .then((result) => console.log("✅ Redis Ping Response:", result))
  .catch((err) => console.error("❌ Redis Ping Failed:", err));


// Start Server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


module.exports = {app, server}