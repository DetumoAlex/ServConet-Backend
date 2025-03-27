const express = require('express');
const authMiddleware = require('../../src/middlewares/authMiddleware');
const appointmentController = require('../../src/controllers/appointmentController')

const router = express.Router();
// console.log('Appointment Controller:', appointmentController);

router.post('/', authMiddleware, appointmentController.bookAppointment);
router.get('/my', authMiddleware, appointmentController.getUserAppointments);
router.get('/provider', authMiddleware, appointmentController.getProviderAppointments);
router.delete('/:id', authMiddleware, appointmentController.cancelAppointment);

module.exports = router;