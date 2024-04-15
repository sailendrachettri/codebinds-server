const mongoose = require('mongoose');
const {Schema, model} = mongoose

const BlogSchema = new Schema({
    title: String,
    summary : String,
    content : String,
    cover : String,
    author : {type: Schema.Types.ObjectId, ref: 'user'},
}, {
    timestamps: true
})

const BlogModel = model('Blog', BlogSchema);

module.exports = BlogModel