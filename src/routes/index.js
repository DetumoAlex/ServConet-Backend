const express = require('express');
const appointmentRoutes = require('./appointmentRoutes');
const serviceRoutes = require('./serviceRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

router.use('/appointments', appointmentRoutes);
router.use('/services', serviceRoutes);
router.use('/auth', authRoutes);

module.exports = router;