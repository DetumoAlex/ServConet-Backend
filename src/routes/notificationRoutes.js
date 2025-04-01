const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const noficationController = require('../controllers/notificationController')

const router = express.Router()

router.use('/', authMiddleware, noficationController.getNotification)
router.use('/delete/:id', authMiddleware, noficationController.deleteNotification)
router.use('/read/:id', authMiddleware, noficationController.markAsRead)

module.exports = router

