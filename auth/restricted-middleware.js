<<<<<<< HEAD
module.exports = (req, res, next) => {
    if (req.session && res.session.user) {
        next();
    } else {
        res.status(400).json({ message: 'No creds provided!!' })
    }

=======
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
>>>>>>> 8310c1daf7744924bc10dba4cc2b196106f7b6a7
}