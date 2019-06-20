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

### Authentication (AuthN): "Who are you?"
- Authentication is about validating your credentials such as Username/User ID and password to verify your identity. 
- The system then checks whether you are what you say you are using your credentials. 
- Whether in public or private networks, the system authenticates the user identity through login passwords.
- Usually authentication is done by a username and password, although there are other various ways to be authenticated.

### Authorization (AuthZ): "What can you do?"
- Authorization verifies your rights to grant you access to resources only after determining your ability to access the system and up to what extent.
- Usually created by you
- Often role-based, like admin, user, moderator
- Permissions based on each role


### 0auth2 (AuthZ) + OpenID Connect (OIDC).
- Usually used together to provide authZ and authN.

In the case of Heroku asking for your GitHub information for access:

- Heroku would be your [Identity Server]
- GitHub would be your [Resource Server]

### Step 1: Heroku (requesting) --> GitHub (confirm?)

When Heroku asks for access to your github, you are given a confirmation screen that asks if it's okay for heroku to access your public information and your respositories. 

### Step 2: GitHub (gives token) --> Heroku (receives token)

When approved for access, Heroku receives an 0auth token, which GitHub identifies as a trusted source. 

### Step 3: Heroku (with token, requests access) --> GitHub (checks 0auth, gives access if valid)

That token, as long as it's valid, provides a key for Heroku to open the door to your information and repositories. 

## Bae-sic Auth

1.) First, install bcryptjs:

    npm i bcryptjs

2.) Second, add to global middleware (server.js):

    const bcrypt = require('bcryptjs');
    
3.) [Registration] Hash the password by inserting bcrypt in post operation, where the 14 means re-hashed 2 ^ 14 times:

In auth-helper.js would be:

    const db = require('../database/dbConfig.js');

    module.exports = {
        register: (newUser) => {
            return db('users').insert(newUser)
        }
    }

And inside auth-router.js:

    router.post('/register', async (req, res) => {
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

4.) [Login] As you post your password, it's validated with the same hash parameters in registration. Therefore, the database recieves the credentials and re-hashes it 2 ^ 14 times, and then authenticating the result.

Add your login function in auth-helper.js, where it selects the first result that matches the credential's username in the database:

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

Then inside auth-router.js:

    router.post('/login', async (req, res) => {
        try {
            const { username, password } = req.body;

            const user = await userDB.login(username);

            user && bcrypt.compareSync(password, user.password)
            ? res.status(200).json({message: `Welcome ${user.username}!`})
            : res.status(401).json({message: 'Invalid credentials.'});
        } catch(err) {
            res.status(500).json({ success: false, err })
        }
    })

5.) [Restrictions] To have a secure server, you must restrict access if they are not logged in. Use a middleware for this:

    const restricted = async (req, res, next) => {
        const { username, password } = req.headers;
        if (username && password) {
            try {
                const user = await usersDB.login(username);

                user && bcrypt.compareSync(password, user.password)
                ? next()
                : res.status(401).json({ message: 'Invalid credentials.' });
                
            } catch(err) {
                res.status(500).json({ success: false, err });
            }
        } else {
            res.status(400).json({ message: 'Please provide credentials.' });
        }
    }

You will also use sessions, but we'll deal with that on day 2.

-----------------------------------------------------------------------------------

# Day 2: Sessions and Cookies


