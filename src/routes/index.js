const express = require('express');
const appointmentRoutes = require('./appointmentRoutes');
const serviceRoutes = require('./serviceRoutes');
const authRoutes = require('./authRoutes');
const chatRoutes = require('./chatRoutes');
const bookingRoutes = require('./bookingRoutes'); // Import chat routes


const router = express.Router();

router.use('/appointments', appointmentRoutes);
router.use('/services', serviceRoutes);
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/bookings', bookingRoutes)

module.exports = router;