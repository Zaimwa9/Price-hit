// C'est le module qui permet de créer le "Modèle" mongo. Il lie "users" à toutes les fonctions qu'on aura à utiliser
// On y crée également les fonctions customs et les champs dont on aura besoin

var mongoose=require('mongoose');

var Schema=mongoose.Schema;

var UserSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    facebookId: String,
    picture: String,
    created_at: Date
});

UserSchema.statics.findOrCreatefb = function(profile, cb){

    console.log('Checking facebook authentication');

    Users.findOne({facebookId: profile.id}, function (err, user){
        if (err) return cb(err);

        if (user) {console.log('user found'); return cb(null,user)};

        user = new Users ({
            username: profile.displayName,
            facebookId: profile.id,
            picture: profile.photos[0].value,
            created_at: new Date().getTime()
        });

        user.save(function (err){
            if (err) return err;
            console.log(user + ' saved')
        });
    });
};

var Users = mongoose.model('Users', UserSchema);

global.Users=Users;

module.exports=Users;