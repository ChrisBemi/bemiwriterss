// routes/authRoutes.js
const router = require('express').Router();
const AuthenticationController = require('../controllers/AuthenticationController');


router.post('/signup', AuthenticationController.signup);

router.post('/login', AuthenticationController.login);

router.get('/logout', AuthenticationController.logout);

router.get('/status', AuthenticationController.checkAuthStatus);

router.post('/forgot-password', AuthenticationController.forgotPassword);

router.post('/change-password', AuthenticationController.changePassword);


module.exports = router;
