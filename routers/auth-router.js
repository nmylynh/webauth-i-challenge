const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const userDB = require('../models/auth-model')
const mw = require('../middleware/users-mw');

router.post('/register', mw.validateUserBody, async (req, res) => {
    try {
        let newUser = req.body;

        const hash = bcrypt.hashSync(newUser.password, 14);
        newUser.password = hash;

        const savedUser = await userDB.register(newUser); 
        res.status(201).json(savedUser);
    } catch(err) {
        res.status(500).json({success: false, err});
    }
});

router.post('/login', mw.validateUserBody, async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await userDB.login(username);

        user && bcrypt.compareSync(password, user.password)
        ? (req.session.username = user.username,
        res.status(200).json({message: `Welcome ${user.username}!`}))
        : res.status(401).json({message: 'Invalid credentials.'});
    } catch(err) {
        res.status(500).json({ success: false, err })
    }
});

router.delete('/', (req, res) => {
    if (req.session) {
        req.session.destroy();
    }

    res.status(200).json({ message: 'You have now been logged out.' });
});

module.exports = router;