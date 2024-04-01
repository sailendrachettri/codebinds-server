const mongoose = require("mongoose")
const dotenv = require("dotenv");

dotenv.config();

let connect;

if(process.env.REACT_APP_NODE_ENV == "production")
    connect = mongoose.connect(process.env.REACT_APP_MONGODB_URL_PROD)
else{
    connect = mongoose.connect(process.env.REACT_APP_MONGODB_URL_DEV)
}
    

connect.then(()=>{
    console.log("Database connected successfully!");
}).catch(()=>{
    console.log("Database CANNOT be connected!");
})