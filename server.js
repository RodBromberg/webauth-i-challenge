const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs')
const Users = require('./data/dbMethods')
const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
    res.send("yes!");
});

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

server.get("/api/users", async(req, res) => {
    try {
        const getUsers = await Users.get();
        // sets the current users to a variable getUsers
        // when getUsers is empty its falsy and wont execute the if statement
        // when values are sent through its true
        if (getUsers) {
            res.status(200).json(getUsers);
        } else {
            res.status(400).json({ message: 'cant get users' });
        }
    } catch (err) {
        res.status(500).json({ message: "Error." });
    }
});
server.post('/api/login', (req, res) => {
    let { username, password } = req.body;

    Users.login({ username })
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


module.exports = server