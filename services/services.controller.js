const express = require('express');
const router = express.Router();
const schema = require('./services.schemas');
const Joi = require('@hapi/joi');
const verify = require('../helpers/verify');
const conf = require('../config.json');
const errorMsgs = require('../error-msgs.json');
const { error } = require('jquery');
const Services = require('./services.service');
// routes

router.post('/',verify, service); //required

module.exports = router;


async function service(req, res) {
    const { error, value } = schema.addServiceSchema.validate(req.body);
    if (!error) {

        let result = await Services.addProperty(value);

        if (result.hasOwnProperty("error")) {
            res.status(400).json(result);
        } else {
            res.status(200).json(result);
        }
    } else {
        res.status(400).json({ error: error.message });
    }
}
