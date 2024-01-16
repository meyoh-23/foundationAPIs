const mongoose = require("mongoose");

const postSchema = new mongoose.Schema( {

});

const Post = mongoose.models("Post", postSchema);
module.exports = Post;