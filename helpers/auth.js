
const jwt = require('jsonwebtoken')

async function auth(tokenData) {
  if (!tokenData) {
    return null
  }
  else {
    return {
      error: 'Invalid token and token type'
    }
  }
}

module.exports = auth;
