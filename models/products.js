// C'est le module qui permet de créer le "Modèle" mongo. Il lie "product" à toutes les fonctions qu'on aura à utiliser
// On y crée également les fonctions customs et les champs dont on aura besoin

var mongoose=require('mongoose');

var Schema = mongoose.Schema;

// Ici on crée le schéma de référence pour le produit à l'aide du constructeur mongoose

var ProductSchema = new Schema({
    name: { type: String, required: true, index: { unique: true } },
    description: {type: String, required: true},
    author: String,
    vote_count: Number,
    price_array: Array,
    category: String,  //could be nice if it's a list
    img: String,
    posted_at: Date
});

ProductSchema.statics.addProduct = function(user, item, image_path, cb){
    console.log('in the function');
    var newprod = new Products({
        name: item.name,
        description: item.description,
        author: user.username,
        price_array: [item.price],
        category: item.category,
        img: image_path,
        posted_at: new Date() 
    });
    Products.findOne({name:newprod.name}, function(err, db_product){
        console.log('check doublon');
        if (err) return cb(err);
            
            if (db_product)
            {   
                console.log(db_product);
                console.log(newprod);
                if (db_product.name === newprod.name) 
                {
                    return cb(new Error('This product already exists ! Change the name please :)'));
                }
            }    
            Products.create(newprod, function(err,result){
                console.log('creating new product ' + result);
                if (err) return cb(err);
                return cb(null, result);
            })           
     });
};

var Products=mongoose.model('Products', ProductSchema);

global.Products=Products;

module.exports=Products;