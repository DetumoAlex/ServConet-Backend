// routes/appointment.js
const express = require('express');
const Appointment = require('../models/appointment-model')

const router = express.Router();

// Book an appointment
const bookAppointment = async (req, res) => {
  try {
    const { serviceId, date, time } = req.body;
    const appointment = new Appointment({
      user: req.user.id,
      service: serviceId,
      date,
      time,
      status: 'pending'
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user appointments
const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id }).populate('service');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get provider's service appointments
const getProviderAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate({
      path: 'service',
      match: { provider: req.user.id },
    }).populate('user', 'name email');
    
    const providerAppointments = appointments.filter(a => a.service !== null);
    res.json(providerAppointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel an appointment
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await appointment.deleteOne();
    res.json({ message: 'Appointment canceled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  bookAppointment,
  getUserAppointments,
  getProviderAppointments,
  cancelAppointment
  };
