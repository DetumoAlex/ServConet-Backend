const express = require('express');
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
const authMiddleware = require('../middlewares/authMiddleware');
const serviceController = require('../../src/controllers/serviceController');
const router = express.Router();

router.put('/update/:id', authMiddleware, serviceController.updateService);
router.delete('/delete/:id', authMiddleware, serviceController.deleteService);
router.get('/all', serviceController.getAllServices);
router.get('/:id', serviceController.getSingleService);
router.post('/create', serviceController.createService);

module.exports = router;