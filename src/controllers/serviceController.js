const Service = require('../models/service-model');
const mongoose = require('mongoose');
const Notification = require('../models/notification');


// create a new service (only vendors can create services)
const createService = async (req, res) => {
    try {
        const { title, description, price, category, providerId, location} = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(providerId)) {
          return res.status(400).json({ message: "Provider ID is required" });
      }
        const service = new Service({
            title,
            description,
            price,
            category,
            provider: providerId,
            location,
        });
        await service.save();
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getServices = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, location, sortBy } = req.query;
    let filter = {approved:true};

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (location) filter.location = { $regex: location, $options: 'i' };

    let sortOptions = {};
    if (sortBy) {
      if (sortBy === 'priceAsc') sortOptions.price = 1;
      else if (sortBy === 'priceDesc') sortOptions.price = -1;
      else if (sortBy === 'newest') sortOptions.createdAt = -1;
    }

    const services = await Service.find(filter).sort(sortOptions);
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error });
  }
};

exports.createBookingNotification = async (booking) => {
  try {
    const notification = new Notification({
      user: booking.providerId, // Notify provider
      message: `New booking for your service: ${booking.serviceTitle}`,
    });
    await notification.save();
  } catch (error) {
    console.error("Error creating booking notification:", error);
  }
};

exports.createStatusNotification = async (booking) => {
  try {
    const notification = new Notification({
      user: booking.customerId, // Notify customer
      message: `Your booking for ${booking.serviceTitle} has been ${booking.status}`,
    });
    await notification.save();
  } catch (error) {
    console.error("Error creating status notification:", error);
  }
};

// get all services

 const getAllServices = async (req, res)=>{
    try {
        const services = await Service.find().populate('provider', 'name email');
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// get a single service
// Get all services
// router.get('/', async (req, res) => {
//     try {
//       const services = await Service.find().populate('provider', 'name email');
//       res.json(services);
//     } catch (error) {
//       res.status(500).json({ message: 'Server error' });
//     }
//   });
  
  // Get a single service by ID
  const getSingleService= async (req, res) => {
    try {
      const service = await Service.findById(req.params.id).populate('provider', 'name email').exec();
      if (!service) return res.status(404).json({ message: 'Service not found' });
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Update a service (only provider who created it can update)
  const updateService= async (req, res) => {
    try {
      const service = await Service.findById(req.params.id);
      if (!service) return res.status(404).json({ message: 'Service not found' });
      if (service.provider.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const { title, description, category, price } = req.body;
      // if (req.file) service.image = req.file.path;
        // const images = req.files ? req.files.map((file) => file.path) : service.images;
      Object.assign(service, { title, description, category, price});
      await service.save();
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Delete a service (only provider who created it can delete)
  const deleteService= async (req, res) => {
    try {
      const service = await Service.findById(req.params.id);
      if (!service) return res.status(404).json({ message: 'Service not found' });
      if (service.provider.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      await service.deleteOne();
      res.json({ message: 'Service deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };

  const approveService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service not found' });

        service.approved = true;
        await service.save();

          // Send notification to provider
          const notification = new Notification({
            user: service.provider,
            message: `Your service "${service.title}" has been approved.`,
        });
        await notification.save();

        res.json({ message: 'Service approved', service });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

  
  module.exports = {
    createService,
    getServices,
    getAllServices,
    getSingleService,
    updateService,
    deleteService,
    approveService
  };
  
  