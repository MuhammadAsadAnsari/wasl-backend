const MongoClient = require('mongodb').MongoClient;
// const { ConfigurationServicePlaceholders } = require('aws-sdk/lib/config_service_placeholders');
const config = require('../config.json');

const client = new MongoClient(config.MONGO_URL);

client.connect(function (err, client) {
    console.log(config.MONGO_URL);
    console.log("[MONGODB] Connected to server");
});

module.exports = client;