/* This is the routing part. One controller should be enough to handle all the requests 
The way it works: the express webserver (in app.js) receives a request on a specific route, it calls the mainController in app.js that 
contains all the routing (here).
*/

var Products = require('../models/products.js');
var bodyParser = require('body-parser');
// multer handles uploading files
var multer = require('multer');
var fs = require('fs');

var upload = multer({
        dest: __dirname + '/../assets/uploads/' 
    }); 
var type = upload.single('image');

module.exports = function(app) {

// FROM HERE ARE ALL THE GET METHODS
    
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
        res.render('landingpage.ejs');
    });

    // renders the aboutus page
    app.get('/aboutus', function(req, res){
        res.render('aboutus.ejs')
    });

    // renders the contactpage
    app.get('/contactpage', function(req, res){
        res.render('contactpage.ejs')
    });

    //renders the browsepage
    app.get('/browsepage', function(req, res){
        res.render('browsepage.ejs')
    });

    app.get('/addproduct', function(req, res){
        res.render('addproduct.ejs')
    });

    // Err 404
    app.get('*', function (req, res){
        res.send('woops this doesnt exist')
    });

    // FROM HERE ARE ALL THE POST METHODS

    /* This post request handles the addition of a new product:
            1) multer middleware gets all the info concerning the file and puts it in "req.file"
            2) body-parser (or multer, not sure), gets the content of the other text inputs name/price and puts them in req.body.XX
            3) fs creates a "pipe", it will copy what it gets from the file and paste it in the uploads folder
            4) we create a new document in the database with the name of the product, the name of the poster, the first price, the path to the image etc ...
    */  
    app.post('/input_new_product', type, function(req, res){
        var target_path = __dirname + '/../assets/uploads/' + req.file.originalname

        Products.addProduct(req.body, target_path, function(err, cb){
            var src = fs.createReadStream(req.file.path);
            var dest = fs.createWriteStream(target_path);
            
            src.pipe(dest);
            
            src.on('end', function() {res.send('complete')})
            src.on('error', function(err){res.send('error')})
            
            console.log(req.file);
        })
    })


} // end of the module.exports