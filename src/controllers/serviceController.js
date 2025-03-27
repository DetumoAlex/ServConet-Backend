const Service = require('../models/service-model');


// create a new service (only vendors can create services)
const createService = async (req, res) => {
    try {
        const { title, description, price, category, providerId} = req.body;
        
        if (!providerId) {
          return res.status(400).json({ message: "Provider ID is required" });
      }
        const service = new Service({
            title,
            description,
            price,
            category,
            provider: providerId,
        });
        await service.save();
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

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
      const service = await Service.findById(req.params.id).populate('provider', 'name email');
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
  
  module.exports = {
    createService,
    getAllServices,
    getSingleService,
    updateService,
    deleteService,
  };
  
  