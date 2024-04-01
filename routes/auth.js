const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Users = require("../models/UserSchema");
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken");


const salt = bcryptjs.genSaltSync(10);
const JWT_SECRET_KEY = process.env.REACT_APP_JWT_SECRET_KEY


// ROUTE 1: Create an api for registration page using post requrest : "api/auth/register"
router.post('/register', async (req, res) => {
    let success = false;

    try {
        let user = await Users.findOne({ username: req.body.username });

        // compare password with compirm password
        if (!(req.body.password == req.body.cpassword))
            return res.status(400).json({ success, message: "Password doesn't match" })

        // if user exist the send the response that user already exist
        if (user) {
            res.status(400).json({ success, message: " username already exist" });

        } else {
            success = true;

            user = await Users.create({
                username: req.body.username,
                password: bcryptjs.hashSync(req.body.password, salt),
                phone: req.body.phone
            })

            // jwt token generation
            const data = {
                user: {
                    id: user.id
                }
            }
            const auth_token = jwt.sign(data, JWT_SECRET_KEY);

            res.status(200).json({ success, message: "Registration successful!", auth_token, username : user.username })
        }

    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

// ROUTE 3: Create an api for login page using post requrest : "api/auth/login"
router.post('/login', async (req, res) => {
    let success = false;

    try {
        let user = await Users.findOne({ username: req.body.username });

        // if user doesn't exist 
        if (!user)
            return res.status(404).json({ success, message: "User doesn't exist. Try registration first!" });

        // compare user entered password with hash password if it false the return
        if (!(bcryptjs.compareSync(req.body.password, user.password)))
            return res.status(400).json({ success, message: "Invalid username or password" });

        // jwt authentication 
        const data = {
            user: {
                id: user.id
            }
        }
        const auth_token = jwt.sign(data, JWT_SECRET_KEY);


        success = true;
        res.status(200).json({ success, message: "Logged In successful!", auth_token, username : user.username });

    } catch (error) {
        res.status(500).json({ success, message: "Internal server error" });
    }
})

module.exports = router