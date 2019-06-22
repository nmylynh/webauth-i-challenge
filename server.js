const express = require('express');
const server = express();
const configureMiddleware = require('./middleware/config-mw');
const auth = require('./routers/auth-router');
const users = require('./routers/users-router');

configureMiddleware(server);

server.get('/', (req, res) => {
    res.send(`<h2>HELLO THIS IS PATRICK</h2>`)
  });  

server.use("/api/auth", auth);
server.use("/api/users", users);

module.exports = server;