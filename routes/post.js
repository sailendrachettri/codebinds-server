const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs');
const Post = require('../models/PostSchema');
const JWT_SECRET_KEY = process.env.REACT_APP_JWT_SECRET_KEY
const jwt = require("jsonwebtoken");

// ROUTE 1: SAVE DATA IN DATABASE
router.post('/create', uploadMiddleware.single('file'), async (req, res) => {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);


    // get the user data and send to client
    const { auth_token } = req.cookies;
    jwt.verify(auth_token, JWT_SECRET_KEY, {}, async(err, info) => {
        // if (err) throw err;
        if (err)
            return res.status(500).json({ message: "Internal server error" })

        const { title, summary, content } = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id
        })

        res.json(postDoc)
    });
})

// ROUTE 2: FETCH ALL THE POSTS AS A CARD IN HOMEPAGE
router.get('/fetchpost', async (req, res) => {
    const posts = await Post.find()
    .populate('author', ['username'])
    .sort({createdAt: -1})
    .limit(20)
    res.json(posts)
})

// ROUTE 3: NOW  FETCH CARDS AS A SINGLE PAGE
router.get('/card/:id', async(req, res)=>{
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', 'username');
    res.json(postDoc)
})

module.exports = router