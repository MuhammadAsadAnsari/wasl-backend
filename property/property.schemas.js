const Joi = require('@hapi/joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

const addPropertySchema = Joi.object({
    type: Joi.string().required(),
    location: Joi.string().required(),
    project: Joi.string().required(),
    bedrooms: Joi.number(),
    rent: Joi.number().required(),
    size: Joi.number().required(),
})
const updatePropertySchema = Joi.object({
    type: Joi.string().required(),
    location: Joi.string().required(),
    project: Joi.string().required(),
    bedrooms: Joi.number(),
    rent: Joi.number().required(),
    size: Joi.number().required(),
})

const paramsSchema = Joi.string().alphanum().max(24).min(24).required();
module.exports = {
    addPropertySchema,
    updatePropertySchema,
    paramsSchema
};