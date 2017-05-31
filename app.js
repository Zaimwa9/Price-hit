var express = require('express');
var mongoose = require('mongoose');
var mgconfig = require('./config/index.js')
var Products = require('./models/products.js');

var app = express();

mongoose.connect(mgconfig.getDbConnectionstring(), function() {
    console.log('successfuly connected')
});

app.get('/testdb', function(req,res){
    var produittest ={
        name: "Produit3",
        description: "Cest le troisieme produit"
    };
    
    console.log('request received');
    Products.addproduct(produittest, function(err,result){
        if (err) return err;
        console.log('saved');
        res.send('Bah super saved'+ result);
    });
});

app.get('/', function(req,res){
    res.send('landingpage');
})

app.listen(3000);