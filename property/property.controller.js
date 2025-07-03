const express = require('express');
const router = express.Router();
const schema = require('./property.schemas');
const Joi = require('@hapi/joi');
const verify = require('../helpers/verify');
const conf = require('../config.json');
const errorMsgs = require('../error-msgs.json');
const { error } = require('jquery');
const propertiesService = require('./property.service');
// routes

router.get('/',verify, getAllProperties); //required
router.post('/',verify, property); //required
router.get('/count',verify, getCount); //required
router.get("/:propertyId", verify, getDetailsOfProperty); //required
router.put("/:propertyId", verify, updateProperty); //required
router.delete("/:propertyId", verify, deleteProperty);
module.exports = router;

async function getAllProperties(req, res) {

    console.log(req.user_id);
    let result = await propertiesService.allProperties();

    if (result.hasOwnProperty("error")) {
        res.status(400).json(result);
    } else {
        res.status(200).json(result);
    }
}


async function getCount(req, res) {

    let result = await propertiesService.count();

    if (result.hasOwnProperty("error")) {
        res.status(400).json(result);
    } else {
        res.status(200).json(result);
    }
}

async function property(req, res) {
    const { error, value } = schema.addPropertySchema.validate(req.body);
    if (!error) {

        let result = await propertiesService.addProperty(value);

        if (result.hasOwnProperty("error")) {
            res.status(400).json(result);
        } else {
            res.status(200).json(result);
        }
    } else {
        res.status(400).json({ error: error.message });
    }
}

async function getDetailsOfProperty(req, res) {
    const { error, value } = schema.paramsSchema.validate(req.params.propertyId);
    if (!error) {
        let result = await propertiesService.propertyDetails(value);

        if (result.hasOwnProperty("error")) {
            res.status(400).json(result);
        } else {
            res.status(200).json(result);
        }
    } else {
        res.status(400).json({ error: error.message });
    }
}

async function updateProperty(req, res) {
    const { error, value } = schema.paramsSchema.validate(req.params.propertyId);

    if (!error) {
        const { error, value } = schema.updatePropertySchema.validate(req.body);

        if (!error) {

            let result = await propertiesService.updateExistingProperty(value, req);
            if (result.hasOwnProperty("error")) {
                res.status(400).json(result);
            } else {
                res.status(200).json(result);
            }
        } else {
            res.status(400).json({ error: error.message });
        }
    } else {
        res.status(400).json({ error: error.message });
    }
}

async function deleteProperty(req, res){
    const { error, value } = schema.paramsSchema.validate(req.params.propertyId);

    if (!error) {
        let result = await propertiesService.removeProperty(value);

        if (result.hasOwnProperty("error")) {
            res.status(400).json(result);
        } else {
            res.status(200).json(result);
        }

    } else {
        res.status(400).json({ error: error.message });
    }
}