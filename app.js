/* This is the entry point of our application. It is the express webserver, in here we will call the middlewares and controllers etc*/

var express = require('express');
var mongoose = require('mongoose');
var mgconfig = require('./config/index.js')
var Products = require('./models/products.js');
var mainController = require('./controllers/mainController.js')
var bodyParser = require('body-parser');
var passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

var app = express();

// connecting to mongodb (mlab cloud service)
var db = mongoose.connect(mgconfig.getDbConnectionstring(), function() {
    console.log('successfully connected')
});
/*
mongoose.connect(mgconfig.getDbConnectionstring(), function() {
    console.log('successfuly connected')
});
*/
passport.serializeUser(function(user, cb) {
  Users.findOne({facebookId: user.facebookId}, function(err, db_user){
    if (err) return err;
    console.log('user serialized is: ' + user)
    cb(null, user);
  })
  
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

app.use(session({
        key: 'session',
        secret: 'helloworld123',
        resave: true,
        saveUninitialized: true,
        store: new MongoStore({
          mongooseConnection: db.connection
      })
}));

app.use(passport.initialize());

app.use(passport.session());



// We declare the view engine, using ejs. This means that each time we want to render an ejs page it will look into the views folder
app.set('view engine', 'ejs');


// This middleware is used to serve the static files (images, css etc...) that are all stored in the assets folders.
// For example to serve the banana img we just have to have "src=img/banana3.jpg" in the ejs file, express will by itself look for this path in the assets folder
app.use(express.static('assets'));


app.use(bodyParser.urlencoded({ extended: false }));

// cf MainController description, we pass our app with all the requests received to the controller which will handle the requests
mainController(app);

app.listen(3033);
//C:\Users\Wadii\Desktop\Price-hit\img\Banana3.jpg