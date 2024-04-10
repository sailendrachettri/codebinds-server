const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Users = require("../models/UserSchema");
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken");


const salt = bcryptjs.genSaltSync(10);
const JWT_SECRET_KEY = process.env.REACT_APP_JWT_SECRET_KEY


// ROUTE 1: Create an api for registration page using post requrest : "api/auth/register"
router.post('/register', [
    body("username", "Username length should be more than 3 characters.").isLength({ min: 5 }),
    body("phone", "Invalid phone number").isLength({ min: 10, max: 10 }),
    body("password", "Weak Password, make it stronger by using Alphanumberic and symbols").isLength({ min: 6 })
], async (req, res) => {
    let success = false;

    try {
        // express validation
        const error = validationResult(req);
        if (!(error.isEmpty())) {
            return res.status(401).json({ success, message: error.array()[0]["msg"] });
        }

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

            res.status(200).json({ success, message: "Registration successful!", auth_token, username: user.username })
        }

    } catch (error) {
        res.status(500).json(error);
        // res.status(500).send("Internal server error");
    }
})

// ROUTE 2: Create an api for login page using post requrest : "api/auth/login"
router.post('/login', [
    body("username", "Invalid credentials").isLength({ min: 3 }),
    body("password", "Invalid credentials").isLength({ min: 3 })
], async (req, res) => {
    let success = false;

    try {
        // express validation
        const error = validationResult(req);
        if (!(error.isEmpty())) {
            return res.status(401).json({ success, message: error.array()[0]["msg"] });
        }

        let user = await Users.findOne({ username: req.body.username });

        // if user doesn't exist 
        if (!user)
            return res.status(404).json({ success, message: "User doesn't exist. Try registration first!" });

        // compare user entered password with hash password if it false the return
        if (!(bcryptjs.compareSync(req.body.password, user.password)))
            return res.status(400).json({ success, message: "Invalid username or password" });

        // jwt authentication 
        const data = {
            id: user.id,
            username: req.body.username
        }
        const auth_token = jwt.sign(data, JWT_SECRET_KEY);

        res.cookie('auth_token', auth_token).json({
            id: user._id, 
            username: req.body.username
        });

    } catch (error) {
        res.status(500).json({ success, message: "Internal server errrrror" });
    }
})

// ROUTE 3: Get all the user information (LOGGED IN)
router.get('/profile', (req, res) => {
    let success = false;
    const { auth_token } = req.cookies;

    try {
        success = true;
        const userInfo = jwt.verify(auth_token, JWT_SECRET_KEY);

        console.log("/profile ahth userinfo: ", userInfo);
        res.json(userInfo);

    } catch (err) {
        res.json({ success, message: "Internal server error" })
    }
})

// ROUTE 4: Handle logout
router.post('/logout', (req, res) => {
    try {
        res.cookie('auth_token', '').json('ok'); // removing auth_token from cookie
    } catch (err) {
        res.status(500).json(err);
    }
})

module.exports = router