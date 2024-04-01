
const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username : {
        type : String,
        unique : true,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    }
})
const Users = new mongoose.model("user", UserSchema);
module.exports = Users
