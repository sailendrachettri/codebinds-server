const express = require("express");
const db = require("./db")
const app = express();
const cors = require('cors')

const cookieParser = require("cookie-parser");
const PORT  = process.env.REACT_APP_PORT || 8000
app.use(cors({credentials: true, origin: 'http://localhost:3000'}))
app.use(cookieParser());
app.use(express.json());

// Available routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/post', require('./routes/post'));


app.listen(PORT, ()=>{
    console.log("Listening to port ", PORT);
})