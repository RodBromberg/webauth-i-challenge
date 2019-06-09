module.exports = (req, res, next) => {
    if (req.session && res.session.user) {
        next();
    } else {
        res.status(400).json({ message: 'No creds provided!!' })
    }

}