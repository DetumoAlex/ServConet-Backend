const Booking = require('../models/booking-model');
const Service = require('../models/service-model');

// Create a new booking (Customer books a service)
exports.createBooking = async (req, res) => {
  try {
    const { serviceId, date } = req.body;
    const customerId = req.user.id;

    const service = await Service.findById(serviceId).populate('provider');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const newBooking = new Booking({
      service: serviceId,
      customer: customerId,
      provider: service.provider._id,
      date,
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error });
  }
};

// Get a single booking
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('service customer provider');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error });
  }
};

// Get all bookings (For Admin or provider/customer-specific bookings)
exports.getBookings = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'provider') {
      filter.provider = req.user.id;
    } else if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    }

    const bookings = await Booking.find(filter).populate('service customer provider');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

// Update booking status (Only provider can accept/reject)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error });
  }
};
