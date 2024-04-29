const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require('cookie-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cors = require('cors');

const app = express();

dotenv.config({path: './.env'});

app.use(cors())


app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use(cookieParser());


app.use('/', require('./appMethod/pages'));
app.use('/auth', require('./appMethod/auth'));

app.use(express.static(path.join(__dirname, 'views' )));

//TODO 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './views/pages/login.html'));
});

app.listen(8000, () => {
    console.log("Server started on port 8000");
});