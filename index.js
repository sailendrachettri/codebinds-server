const express = require("express");
const db = require("./db")
const app = express();
const cors = require('cors')

const cookieParser = require("cookie-parser");
const PORT  = process.env.REACT_APP_PORT || 8000
app.use(cookieParser());
app.use(express.json());

const DEVELOPMENT_URL = process.env.REACT_APP_DEVELOPMENT_CLIENT_URL;

app.use(cors({credentials: true, origin: DEVELOPMENT_URL}))

// server static files
app.use('/uploads', express.static(__dirname + '/uploads'))

// Available routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/post', require('./routes/post'));
app.use('/api/blog', require('./routes/blog'))


app.listen(PORT, ()=>{
    console.log("Listening to port ", PORT);
})