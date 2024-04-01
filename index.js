const express = require("express");
const db = require("./db")

const PORT  = process.env.REACT_APP_PORT || 8000
const app = express();
const cors = require('cors')

app.use(express.json())
app.use(cors())

// Available routes
app.use('/api/auth', require('./routes/auth.js'));


app.listen(PORT, ()=>{
    console.log("Listening to port ", PORT);
})