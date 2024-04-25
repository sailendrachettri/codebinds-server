const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/blog', limits: { fieldSize: 50 * 1024 * 1024 } }); // 50mb max size
const fs = require('fs');
const Blog = require('../models/BlogSchema');
const JWT_SECRET_KEY = process.env.REACT_APP_JWT_SECRET_KEY
const jwt = require("jsonwebtoken");

const TOPFIVEPOSTS = 5;

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
            const postDoc = await Blog.create({
                title,
                summary,
                content,
                cover: newPath,
                author: info.id
            })

            res.json(postDoc)
        });
    } catch (err) {
        res.status(500).json({ success, message: "Internal server error", err });
    }
})

// ROUTE 2: FETCH ALL THE POSTS AS A CARD IN HOMEPAGE
router.get('/fetchpost', async (req, res) => {
    let success = false;
    try {
        const posts = await Blog.find()
            .populate('author', ['username'])
            .sort({ createdAt: -1 })
            .limit(5)

        res.json(posts)
    } catch (err) {
        res.status(404).json({success, message: "Failed to fetch posts"})
        console.log(err);
     };
})

// ROUTE 3: NOW  FETCH CARDS AS A SINGLE PAGE
router.get('/blogpost/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Blog.findById(id).populate('author', 'username');
    res.json(postDoc)
})

// These ROUTE 4 & 5 is to fetch all the blog posts in homepage
// ROUTE 4: FETCH TOP 5 THE POSTS AS A CARD IN HOMEPAGE
router.get('/allfetchpost', async (req, res) => {
    let success = false;
    try {
        const posts = await Blog.find()
            .populate('author', ['username'])
            .sort({ createdAt: -1 })
            .limit(30)
        res.json(posts)
    } catch (err) {
        res.status(404).json({success, message: "Failed to fetch posts"})
        console.log(err);
     };
})

// ROUTE 5: NOW  FETCH BLOG POST AS A SINGLE PAGE
router.get('/allblogpost/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', 'username');
    res.json(postDoc)
})

// ROUTE 6: EDIT THE EXISTING POST
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
        const postDoc = await Blog.findById(id);

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

// ROUTE 7: Fetch top 5 articles for similar read section
router.get('/fetchtopfiveblog', async (req, res) => {
    let success = false;
    try {
        const posts = await Blog.find()
            .populate('author', ['username'])
            .sort({ createdAt: -1 })
            .limit(TOPFIVEPOSTS)
        res.json(posts)
    } catch (err) {
        res.status(404).json({success, message: "Failed to fetch posts"})
        console.log(err);
     };
})

module.exports = router