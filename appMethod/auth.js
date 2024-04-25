const express = require('express');
const authController = require('../authControllers/auth');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// ADD  authController.isLoggedIn
router.post('/', authController.addCustomer );

// router.post('/register', authController.register )

// router.post('/login', authController.login );

// router.get('/logout', authController.logout);

module.exports = router;