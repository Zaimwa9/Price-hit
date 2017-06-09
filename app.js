/* This is the entry point of our application. It is the express webserver, in here we will call the middlewares and controllers etc*/

var express = require('express');
var mongoose = require('mongoose');
var mgconfig = require('./config/index.js')
var Products = require('./models/products.js');
var mainController = require('./controllers/mainController.js')
var bodyParser = require('body-parser');

var app = express();

mongoose.connect(mgconfig.getDbConnectionstring(), function() {
    console.log('successfuly connected')
});

// We declare the view engine, using ejs. This means that each time we want to render an ejs page it will look into the views folder
app.set('view engine', 'ejs');


// This middleware is used to serve the static files (images, css etc...) that are all stored in the assets folders.
// For example to serve the banana img we just have to have "src=img/banana3.jpg" in the ejs file, express will by itself look for this path in the assets folder
app.use(express.static('assets'));


app.use(bodyParser.urlencoded({ extended: false }));

// cf MainController description, we pass our app with all the requests received to the controller which will handle the requests
mainController(app);

app.listen(3000);
//C:\Users\Wadii\Desktop\Price-hit\img\Banana3.jpg