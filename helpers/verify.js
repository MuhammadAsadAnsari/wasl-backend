const jwt = require('jsonwebtoken')
const conf = require('../config.json')


async function verify(req, res, next) {
    console.log("req.auth?.userid", req.auth?.userid);
    try {

        if (req.auth?.userid) {
                req.user_id = req.auth.userid
        } else {
            req.user_id = '';
        }

        next();
    }
    catch (error) {
        res.status(400).json(error)
    }
}

module.exports = verify;