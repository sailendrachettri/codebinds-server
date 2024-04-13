const mongoose = require('mongoose')
const {Schema, model}  = mongoose

const NewslatterSchema = Schema({
    fullname : String,
    email : {
        type : String,
        unique : true
    }
})

const Newslatter = model('newslatter', NewslatterSchema);
module.exports = Newslatter;