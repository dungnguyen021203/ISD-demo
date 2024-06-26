const mysql = require('mysql2');
const express = require('express');
const authController = require('../authControllers/auth');
const path = require('path')
const router = express.Router();

const conn = mysql.createConnection({user: process.env.DATABASE_USER, password: process.env.DATABASE_PASSWORD, database: process.env.DATABASE});

const isAdmin = (req, res, next) => {
    if (req.user.role === 'admin') {
        return res.json({isAdmin: req.user.role})
    }
    else {
        return res.json({isAdmin: req.user.role})
    }
  };

router.get('/dashboard', authController.isLoggedIn, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'pages', 'dashboard.html'), {user: req.user});
});

router.get('/home', authController.isLoggedIn, authController.home, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'pages', 'home.html'), {user: req.user});
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'pages', 'login.html'));
});

router.get('/products', authController.isLoggedIn, authController.productsShowcase, (req, res) => {
    req.user
});

router.get('/trash/menu', authController.isLoggedIn, authController.trash);
router.get('/trash', authController.isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'pages', 'trash.html'), {user: req.user});
});

// Should remove this route
router.get('/orders', authController.isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'pages', 'orders.html'), {user: req.user});
});

router.get('/page/products', authController.isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'pages', 'products.html'), {user: req.user});
});

router.delete('/delete/:id', authController.isLoggedIn, authController.deleteCustomer, (req, res) => {
    req.user
});

router.get('/details/:id', authController.isLoggedIn, authController.details, (req, res) => {
    req.user
});

router.put('/recovery/:id', authController.isLoggedIn, authController.recoverCustomer, (req, res) => {
    req.user
});

router.patch('/update/:id', authController.isLoggedIn, authController.editCustomer, (req, res) => {
    req.user
});

router.get('/customerOrders/:id', authController.isLoggedIn, authController.customerOrders, (req, res) => {
    req.user
});

module.exports = router;