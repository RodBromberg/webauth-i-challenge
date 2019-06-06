const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrpt = require('bcryptjs')
const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');
const restricted = require('./auth/restricted-middleware')

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
    res.send("It's alive!");
});

server.post('/api/register', (req, res) => {
    // grabbing the entire post

    let user = req.body;
    // grabbing the password from the post 
    // hashing the password
    const hash = bcrpt.hashSync(user.password, 10); //2^10 rounds
    // pass > hashit > hash > hashit > hash > hashit -- 2^10
    user.password = hash

    Users.add(user)
        .then(saved => {
            res.status(201).json(saved);
        })
        .catch(error => {
            res.status(500).json(error);
        });
});

//dsadsas

server.post('/api/login', (req, res) => {
    let { username, password } = req.body;

    Users.findBy({ username })
        .first()
        .then(user => {
            if (user) {
                res.status(200).json({ message: `Welcome ${user.username}!` });
            } else {
                res.status(401).json({ message: 'Invalid Credentials' });
            }
        })
        .catch(error => {
            res.status(500).json(error);
        });
});

function authorize(req, res, next) {

}

server.get('/api/users', restricted, (req, res) => {
    Users.find()
        .then(users => {
            res.json(users);
        })
        .catch(err => res.send(err));
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));