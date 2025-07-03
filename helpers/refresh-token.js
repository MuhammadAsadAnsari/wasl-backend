const client = require('../helpers/mongodb');
const conf = require('../config.json')
const { v4: uuidv4 } = require('uuid');


async function upsertRefreshToken(userId, _refreshtoken) {

    try {

        if (!_refreshtoken) {

            var id = userId;
            var refreshToken = uuidv4()
            var newRefreshToken = { user_id: id, refresh_token: refreshToken }
            let result = await client.db('wasl').collection('refresh_tokens').insertOne(newRefreshToken);

            if (result.insertedId) {
                return {
                    refresh_token: refreshToken
                }
            }
            else {
                return {
                    error: "Something went wrong. Error occurred"
                }
            }
        }
        else {

            var id = userId;
            var refreshtoken = uuidv4()
            var query = { user_id: id, refresh_token: _refreshtoken }
            var newValue = { $set: { user_id: id, ipv: ipv, refresh_token: refreshtoken } }
            let result = await client.db('wasl').collection('refresh_tokens').findOneAndUpdate(query, newValue, { returnNewDocument: true })
            console.log(result);
            if (result.value) {
                return {
                    refresh_token: refreshtoken
                }
            }
            else {
                return {
                    error: "Invalid refresh token."
                }
            }

        }
    }
    catch (error) {

        console.log('saadsadsa');
        return {
            error: error.message
        }
    }
}

module.exports = upsertRefreshToken;