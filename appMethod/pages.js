const mysql = require('mysql2');
const express = require('express');
const authController = require('../authControllers/auth');
const path = require('path')
const router = express.Router();

const conn = mysql.createConnection({
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});


router.get('/home', authController.home)

router.get('/trash/menu', authController.trash);
router.get('/trash', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'pages', 'trash.html'));
});


router.delete('/delete/:id', authController.deleteCustomer);

router.get('/details/:id', authController.details);

router.put('/recovery/:id', authController.recoverCustomer);

module.exports = router;