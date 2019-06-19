# Introduction to Authentication

SQLite doesn't automatically enforce foreign keys. What you must do is to add this code to your knexfile:

    pool: {
        afterCreate: (conn, done) => {
            conn.run('PRAGMA foreign_keys = ON', done);
        },
    },

If you want to add more PRAGMAs, just add a semicolon and add it after 'PRAGMA foreign_keys = ON'.

So your knexfile enforcing FKs would look like this:

    module.exports = {
        development: {
            client: 'sqlite3',
            useNullAsDefault: true,
            connection: {
                filename: './database/auth.db3',
            },
            pool: {
                afterCreate: (conn, done) => {
                    conn.run('PRAGMA foreign_keys = ON', done);
                },
            },
            migrations: {
                directory: './database/migrations',
            },
            seeds: {
                directory: './database/seeds',
            },
        },
    };

SQLite has PRAGMA functions [https://www.sqlite.org/pragma.html] you can use. You assemble them by adding them to the pool section.

-------------------------------------------------------------------------

## Code Smell --> Anti-Patterns

In a code review, if someone says "Code Smell", they mean that they detected an anti-pattern, but there's something that you can apply a little pattern to, that's going to make your code cleaner. 

### Some Patterns
- Model View Controller
- Model View Presenter
- Builder
- Factory
- Repository

-------------------------------------------------------------------------

## DRY --> Configurations for knexfiles and models

Since we are often repeating the knex configurations in our database models, it's better to have a separate file to avoid repeating code. This also helps you avoid changing each line of code when exporting knex to production, where we don't want our knex to be in development.

Therefore, dbConfig.js would be:

    const knex = require('knex');

    const knexConfig = require('../knexfile.js');

    module.exports = knex(knexConfig.development);

And in our database models, we would have only:

    const db = require('../database/dbConfig.js');

-------------------------------------------------------------------------

## Authentication vs. Authorization

Authentication (AuthN): "Who are you?"

Authorization (AuthZ): "What can you do?"
- Usually created by you
- Often role-based, like admin, user, moderator
- Permissions based on each role

0auth2 (AuthZ) + OpenID Connect (OIDC).
- Usually used together to provide authZ and authN.

In the case of Heroku asking for your GitHub information for access:

- Heroku would be your [Identity Server]
- GitHub would be your [Resource Server]

Therefore, when Heroku asks for access to your github, you are given a confirmation screen that asks if it's okay for heroku to access your public information and your respositories. 

### Step 1: Heroku (requesting) --> GitHub (confirm?)

When approved for access, Heroku receives an 0auth token, which GitHub identifies as a trusted source. 

### Step 2: GitHub (gives token) --> Heroku (receives token)

That token, as long as it's valid, provides a key for Heroku to open the door to your information and repositories. 

### Step 3: Heroku (with token, requests access) --> GitHub (checks 0auth, gives access if valid)


