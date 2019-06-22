
exports.seed = function(knex, Promise) {
  return knex('users').truncate()
    .then(function () {
      return knex('users').insert([
        {id: 1, username: 'patrick', password: 'pass'},
        {id: 2, username: 'notpatrick', password: 'pass'},
        {id: 3, username: 'verypatrick', password: 'pass'}
      ]);
    });
};
