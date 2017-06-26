/* This is the routing part. One controller should be enough to handle all the requests 
The way it works: the express webserver (in app.js) receives a request on a specific route, it calls the mainController in app.js that 
contains all the routing (here).
*/

// mongoose models
var Products = require('../models/products.js');
var Users = require ('../models/users.js');
var Comments = require('../models/comments.js');

// express bodyParser (to get the req.body)
var bodyParser = require('body-parser');
// multer handles uploading files
var multer = require('multer');
// native module to make operations on files
var fs = require('fs');

// Authentification + session + passport modules
var FacebookStrategy = require('passport-facebook').Strategy;
var config = require('../config/config.json');
var passport = require('passport');
const session = require('express-session');

// Sending emails
var configMg = require('../config/mailgun.json');
var mailgun = require('mailgun-js') ({apiKey: configMg.active_key, domain: 'humantour.ist'});

// Time format
var moment = require('moment');

var upload = multer({
        dest: __dirname + '/../assets/uploads/' 
    }); 
var type = upload.single('image');


passport.use(new FacebookStrategy({
    clientID: config.facebook_id,
    clientSecret: config.facebook_secret,
    callbackURL: "http://localhost:3033/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)']
    },
    function(accessToken, refreshToken, profile, cb) {
        Users.findOrCreatefb(profile, function (err, user) {
            return cb(err, user);
        });
    }    
));

function ensureAuthenticated(req, res, next) {
    console.log(req.session);
    if (req.isAuthenticated()) { console.log('authenticated'); return next(); }
    console.log('denied');
    res.redirect('/');
}

module.exports = function(app) {

// FROM HERE ARE ALL THE GET METHODS

    // Facebook authentication
    app.get('/auth/facebook', passport.authenticate('facebook'));

    app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/aboutus' }),
    function (req, res) {
        res.redirect('/');
    })

    // to logout
    
    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });
    
    // This is a test URL to check if the database is properly working 
    app.get('/testdb', function(req,res){
        var produittest ={
            name: "Produit3",
            description: "Cest le troisieme produit"
        };
        
        console.log('request received');
        // This part saves a "test document" each time we visit the given URL
        Products.addproduct(produittest, function(err, record){
            if (err) return err;
            console.log('saved:  '+ record);
        });
        // This part displays all the documents we have in the Products collection
        Products.find({}, function (err, db_records){
            res.send('All our records are:  '+ db_records);
        });
    });

    // renders the landingpage
    app.get('/', function(req, res){
        console.log(JSON.stringify(req.session.passport) + ' navigating')
        if (req.isAuthenticated()){
        return res.render('landingpage.ejs', {auth: req.isAuthenticated(), user: req.session.passport.user});
        }
        res.render('landingpage.ejs', {auth: req.isAuthenticated(), user: ''});
    });

    // renders the aboutus page
    app.get('/aboutus', function(req, res){
        res.render('aboutus.ejs', {auth: req.isAuthenticated()})
    });

    // renders the contactpage
    app.get('/contactus', function(req, res){
        res.render('contactpage.ejs', {auth: req.isAuthenticated()})
    });

    //renders the browsepage
    app.get('/browsepage', function(req, res){
        Products.find({})
        .sort({posted_at: -1})
        .limit(50)
        .exec(function(err, db_products){
            if (err) return err;
            console.log(db_products.length);
            res.render('browsepage.ejs', {auth: req.isAuthenticated(), products: db_products, count: db_products.length})
        });
    });

    app.get('/addproduct', function(req, res){
        res.render('addproduct.ejs', {auth: req.isAuthenticated()})
    })

    // ROUTES REQUIRING PARAMS
    app.get('/product/:productId', function(req, res){
        Products.findOne({_id: req.params.productId}, function(err, db_product){
            if (err) return err;
            if (!db_product) return new Error("Woops couldn't find the product");
            
            var sumprice = db_product.price_array.reduce(function (a,b) {
                return parseInt(a) + parseInt(b);
            }, 0);

                Comments.find({productId: req.params.productId})
                .sort({posted_at: -1})
                .limit(15)
                .exec(function(err, allcomments){  
                        if (req.isAuthenticated()) 
                    {    
                        res.render('singleproduct.ejs', {auth: req.isAuthenticated(), user: req.session.passport.user, product: db_product, comments: allcomments, sum: sumprice, moment: moment});
                    }
                    else 
                    {   
                        var visitor = new Users ({username: "test", _id:"111"})
                        res.render('singleproduct.ejs', {auth: req.isAuthenticated(), product: db_product, comments: allcomments, sum: sumprice, moment: moment, user: visitor});
                    }
            })
        })
    })

    // Err 404
    app.get('*', function (req, res){
        res.send('woops this doesnt exist')
    });


    // FROM HERE ARE ALL THE POST METHODS

    /*      "/input_new_product" 
    
    This post request handles the addition of a new product:
            1) multer middleware gets all the info concerning the file and puts it in "req.file"
            2) body-parser (or multer, not sure), gets the content of the other text inputs name/price and puts them in req.body.XX
            3) fs creates a "pipe", it will copy what it gets from the file and paste it in the uploads folder
            4) we create a new document in the database with the name of the product, the name of the poster, the first price, the path to the image etc ...
    */  
    app.post('/input_new_product', type, function(req, res){
        // We just assign to target_path the destination folder of the file
        var target_path = __dirname + '/../assets/uploads/' + req.file.originalname
        var db_image = '/uploads/' + req.file.originalname;
        // We call the method attached to the model and coded there
        Products.addProduct(req.session.passport.user,req.body, db_image, function(err, cb){
            // We create a pipe (that will copy from req.file.path to target_path)
            var src = fs.createReadStream(req.file.path);
            var dest = fs.createWriteStream(target_path);
            
            src.pipe(dest);
            
            // Listening on 'end' or 'error' event to reroute 
            src.on('end', function(
                
            ) {res.redirect('/product/' + cb._id)})
            src.on('error', function(){res.send('Woops there was an error, please retry later')})
            
            console.log(req.file);
        });
    });

    // add a price

    app.post('/add_price/:productId', function(req, res) {
        Products.findOne({_id: req.params.productId}, function (err, db_project){
            if (err) return err;
            if ((db_project) && (req.body.price))
                db_project.price_array.push(req.body.price);
                db_project.save(function(err, result){
                    console.log(db_project)
                    return res.redirect('/product/' + req.params.productId)
                });
                
            });
    });

// Post method to add a comment on a given product

    app.post('/add_comment/:productId', function(req, res) {
        var com = new Comments({
            author_id: req.session.passport.user._id,
            author_name: req.session.passport.user.username,
            text: req.body.new_comment,
            productId: req.params.productId,
            posted_at: new Date()
        });

        com.save(function(err, result){
            if (err) return err;
            return res.redirect('/product/' + req.params.productId)
        })
    })


// Post method to send the contact email to the "Customer service"

    app.post('/contactform', function(req, res){
        console.log(req.body);
        console.log('Email about to be sent');
        var data= {
            from: 'Price-Hit <b00549848@essec.edu>',
            to: 'b00549848@essec.edu',
            subject: 'New contact from: ' + req.body.mail,
            text: 'Name: ' + req.body.name + '\r\n message: ' + req.body.message
        }
        
        mailgun.messages().send(data, function(err, body){
            if (err) return (err);
            console.log('Mail sent was: ' + JSON.stringify(body))
            return res.render('contact_thanks.ejs', {auth: req.isAuthenticated})
        })
    });

// Post method to remove a product when you are the owner

    app.post('/removeproduct/:productId', function(req, res) {
        Products.findOneAndRemove({_id: req.params.productId}, function(err, db_project){
            if (err) return err;
            if (!db_project) return  new Error("Weird, couldn't find the product");
        
            console.log(db_project + ' succesfully removed');
            res.redirect('/')
        })
    })

} // end of the module.exports