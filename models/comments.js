/* To have the comments as we won't have a lot of people, let's have the message, product name and date to put them in the bootstrap boxes*/

var mongoose=require('mongoose');

var Schema=mongoose.Schema;

CommentSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    facebookId: String,
    content: String,
    productId: String,
    posted_at: Date
});

var Comments = mongoose.model('Comments', CommentSchema);

global.Comments = Comments;

module.exports = Comments;