const Joi = require('@hapi/joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

const categorySchema = Joi.object({
    name: Joi.string().required(),
})

const paramsSchema = Joi.string().alphanum().max(24).min(24).required();

module.exports = {
    categorySchema,
    paramsSchema
};