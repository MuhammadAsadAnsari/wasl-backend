const client = require('../helpers/mongodb');
const bcrypt = require('bcrypt');
const conf = require('../config.json');
const jwt = require('jsonwebtoken');
const refreshToken = require('../helpers/refresh-token')
const offsetlimit = require('../helpers/offset-limit');
const { ObjectId, Double, Int32 } = require('mongodb');
const errorMsgs = require('../error-msgs.json');
const { error } = require('console');

async function addProperty(value) {
    try {

        const result = await client.db("wasl").collection("services").insertOne(value);

        if (result.insertedId) {

            return {
                message : "added",
                property_id : result.insertedId
            };

        } else {
            return {
                error: "Something went wrong.",
            };
        }
    } catch (error) {
        return {
            error: "Unexpected error occured. " + error,
        };
    }
}

module.exports = {
    addProperty
};