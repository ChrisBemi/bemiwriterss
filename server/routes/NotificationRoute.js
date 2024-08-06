const router = require("express").Router()

const NotificationsController = require("../controllers/NotificationsController");




router.post('/sent/notifications',NotificationsController.sendBulkEmail)





module.exports = router