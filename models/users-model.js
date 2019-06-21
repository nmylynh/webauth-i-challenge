const db = require('../database/dbConfig.js');

module.exports = {
    find,
    findById,
    update,
    remove
}

function find() {
    return db('users');
}

function findById(id) {
    return db('users')
    .where({ id })
    .first()
}

function update(id, changes) {
    return db('users')
    .where({ id })
    .update(changes, '*')
}

function remove(id) {
    return db('users')
    .where({ id })
    .del();
}