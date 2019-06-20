const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs')
const Users = require('./data/dbMethods')
const server = express();
const session = require('express-session')
const SessionStore = require('connect-session-knex')(session)
const authRouter = require('./auth/restricted-middleware')

const sessionConfig = {
    name: 'monkey', // sid,
    secret: 'Keep it secret, stupid!',
    cookie: {
        maxAge: 1000 * 10 * 60,
        secure: false,
        httpOnly: true,
    },
    resave: false,
    saveUninitialized: false, // GDPR laws against setting cookies automatically
    store: new SessionStore({
        knex: require('./data/dbConfig.js'),
        tablename: 'sessions',
        sidfieldname: 'sid',
        createtable: true,
        clearInterval: 60 * 60 * 1000 // 1 hour
    })
}


server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig))

const restricted = (req, res, next) => {
    const { username, password } = req.headers;

    if (req.session && req.session.user) {
        next();
    } else {
        res.status(418).json({ message: 'No credentials provided' });
    }
};

server.get('/api/users', restricted, (req, res) => {
    Users.get()
        .then(users => {
            res.json(users);
        })
        .catch(err => res.send(err));
});


// server.use('/api/users', authRouter)

// server.get("/api/users", async(req, res) => {
//     //get the cohorts from database
//     try {
//         //Not using db helper functions
//         const users = await Users.get()
//         res.status(200).json(users);
//     } catch (err) {
//         res.status(500).json(err);
//     }
// })


server.post("/api/register", (req, res) => {
    const user = req.body;
    if (!user.username || !user.password) {
        res.status(404).json({ message: "missing user or pass" });
    } else {
        //Hashes current password and sets it as new password
        const hash = bcrypt.hashSync(user.password, 12);
        user.password = hash;
        Users.add(user)
            .then(saved => {
                res.status(201).json(saved);
            })
            .catch(err => {
                res.status(500).json(err);
            })
    }
});


server.post('/ap')


//fds

// server.get("/api/users", async(req, res) => {
//     try {
//         const getUsers = await Users.get();
//         // sets the current users to a variable getUsers
//         // when getUsers is empty its falsy and wont execute the if statement
//         // when values are sent through its true
//         if (getUsers) {
//             res.status(200).json(getUsers);
//         } else {
//             res.status(400).json({ message: 'cant get users' });
//         }
//     } catch (err) {
//         res.status(500).json({ message: "Error." });
//     }
// });


server.get("/api/users", async(req, res) => {
    try {
        const users = await Users.get();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

server.post('/api/login', (req, res) => {
    let { username, password } = req.body;

    Users.login({ username })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                req.session.user = user;
                res.status(200).json({ message: `Welcome ${user.username}!` });
            } else {
                res.status(401).json({ message: 'Invalid Credentials' });
            }
        })
        .catch(error => {
            res.status(500).json(error);
        });
});

server.get('/api/logout', restricted, (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.json({ message: 'error', err })
            } else {
                res.status(200).json({ message: 'success logging out' })
            }
        })
    } else {
        res.status(500).json({ message: 'couldnt happpen' })
    }
})

module.exports = server

//fdd