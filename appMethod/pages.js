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

router.get('/home', authController.isLoggedIn, authController.home, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'pages', 'home.html'), { user: req.user });
});

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'pages', 'login.html'));
});

router.get('/products', authController.isLoggedIn, authController.productsShowcase, (req, res) => { req.user });

router.get('/trash/menu', authController.isLoggedIn, authController.trash);
router.get('/trash', authController.isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'pages', 'trash.html'), { user: req.user });
});

// Should remove this route
router.get('/orders', authController.isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'pages', 'orders.html'), { user: req.user });
});

router.get('/page/products', authController.isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'pages', 'products.html'), { user: req.user });
});

router.delete('/delete/:id', authController.isLoggedIn, authController.deleteCustomer, (req, res) => { req.user });

router.delete('/permanentDelete/:id', authController.isLoggedIn, authController.permanentDelete, (req, res) => { req.user });

router.get('/details/:id', authController.isLoggedIn, authController.details, (req, res) => { req.user });

router.put('/recovery/:id', authController.isLoggedIn, authController.recoverCustomer, (req, res) => { req.user });

router.get('/salespersonDetails', authController.isLoggedIn, authController.salespersonDetails, (req, res) => { req.user });

router.patch('/update/:id', authController.isLoggedIn, authController.editCustomer, (req, res) => { req.user });

router.get('/customerOrders/:id', authController.isLoggedIn, authController.customerOrders, (req, res) => { req.user });

router.get('/customerSearch', authController.isLoggedIn, authController.customerSearch, (req, res) => { req.user });

router.get('/customerSorting', authController.isLoggedIn, authController.customerSorting, (req, res) => { req.user });

router.get('/customerFilterCategory', authController.isLoggedIn, authController.customerFilterCategory, (req, res) => { req.user });

router.get('/salespersonDetails', authController.isLoggedIn, authController.salespersonDetails, (req, res) => { req.user });

module.exports = router;