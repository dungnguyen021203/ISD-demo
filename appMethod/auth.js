const express = require('express');
const authController = require('../authControllers/auth');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post('/', authController.isLoggedIn, authController.addCustomer , (req, res) => { req.user });

router.post('/login', authController.login );

router.get('/logout', authController.logout);

module.exports = router;