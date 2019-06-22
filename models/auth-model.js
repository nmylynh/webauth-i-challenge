const db = require('../database/dbConfig.js');

module.exports = {
    register: (newUser) => {
        return db('users')
            .insert(newUser)
    },
    login: (username) => {
        return db('users')
            .where({ username })
            .first()
    }  
}