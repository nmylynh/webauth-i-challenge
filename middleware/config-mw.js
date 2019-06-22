const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

const sessionConfig = {
    name: 'THISISPATRICK',
    secret: 'who is Victoria and what is her secret',
    resave: false, 
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 10,
        secure: false,
        httpOnly: true,
    },
    store: new KnexSessionStore({
        knex: require('../database/dbConfig.js'),
        tablename: 'sessions',
        sidfieldname: 'sid',
        createtable: true,
        clearInterval: 1000 * 60 * 30,
    })
};

module.exports = server => {
    server.use(express.json()); 
    server.use(cors()); 
    server.use(helmet()); 
    server.use(morgan('tiny'));
    server.use(session(sessionConfig)); 
}