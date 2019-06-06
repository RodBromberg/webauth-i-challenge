const bcrpt = require('bcryptjs');

const Users = require('../users/users-model');

module.exports = function restricted(req, res, next) {
    const { username, password } = req.headers;

    if (username && password) {
        Users.findBy({ username })
            .first()
            .then(user => {
                if (user) {
                    next();
                } else {
                    res.status(401).json({ message: 'Invalid Credentials' });
                }
            })
            .catch(error => {
                res.status(500).json(error);
            });

    } else {
        res.status(401).json({ messgae: "Invalid Credentials" })
    }
}