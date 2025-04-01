const express = require('express')
const bookingController = require('../controllers/bookingController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router()

router.post('/', authMiddleware, bookingController.createBooking); // Customers create booking
router.get('/:id', authMiddleware, bookingController.getBooking); // Get a single booking
router.get('/', authMiddleware, bookingController.getBookings); // Get all bookings for user/admin
router.put('/:id/status', authMiddleware, bookingController.updateBookingStatus); // Provider updates booking status

module.exports = router;