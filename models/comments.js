/* To have the comments as we won't have a lot of people, let's have the message, product name and date to put them in the bootstrap boxes*/

var mongoose=require('mongoose');

var Schema=mongoose.Schema;

CommentSchema = new Schema({
    author_id: String,
    author_name: { type: String, required: true },
    facebookId: String,
    text: String,
    productId: String,
    posted_at: Date
});

var Comments = mongoose.model('Comments', CommentSchema);

global.Comments = Comments;

module.exports = Comments;