const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/', limits: { fieldSize: 50 * 1024 * 1024 } }); // 50mb max size
const fs = require('fs');
const Post = require('../models/PostSchema');
const JWT_SECRET_KEY = process.env.REACT_APP_JWT_SECRET_KEY
const jwt = require("jsonwebtoken");

// ROUTE 1: SAVE DATA IN DATABASE
router.post('/create', uploadMiddleware.single('file'), async (req, res) => {
    let success = false;

    try {
        const { originalname, path } = req.file;

        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);


        // get the user data and send to client
        const { auth_token } = req.cookies;
        jwt.verify(auth_token, JWT_SECRET_KEY, {}, async (err, info) => {
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
    } catch (err) {
        res.status(500).json({success, message : "Internal server error", err});
    }
})

// ROUTE 2: FETCH ALL THE POSTS AS A CARD IN HOMEPAGE
router.get('/fetchpost', async (req, res) => {
    const posts = await Post.find()
        .populate('author', ['username'])
        .sort({ createdAt: -1 })
        .limit(20)
    res.json(posts)
})

// ROUTE 3: NOW  FETCH CARDS AS A SINGLE PAGE
router.get('/card/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', 'username');
    res.json(postDoc)
})

// ROUTE 4: EDIT THE EXISTING POST
router.put('/edit', uploadMiddleware.single('file'), async (req, res) => {

    let newPath = null;

    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }

    // get the user data and send to client
    const { auth_token } = req.cookies;
    jwt.verify(auth_token, JWT_SECRET_KEY, {}, async (err, info) => {
        // if (err) throw err;
        if (err)
            return res.status(500).json({ message: "Internal server error" })

        const { id, title, summary, content } = req.body;
        const postDoc = await Post.findById(id);

        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);

        if (!isAuthor) {
            return res.status(400).json({ message: "you are not an author" });
        }

        await postDoc.updateOne({
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover
        });

        res.json(postDoc);

    });

})

module.exports = router