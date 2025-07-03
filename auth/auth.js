const jwt = require('jsonwebtoken')
const conf = require('../config.json')


const response = new Object({
  status: '',
  message: '',
});

async function auth(tokenData) {
  if (!tokenData) {
    response.status = 401;
    response.message = "token is invalid or null";
    return response
  }
}

module.exports = auth;
