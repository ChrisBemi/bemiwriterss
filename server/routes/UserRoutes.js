 const router = require("express").Router()


 const UserController = require("../controllers/UsersController")




 router.get('/:id',UserController.getUserById)





 module.exports = router