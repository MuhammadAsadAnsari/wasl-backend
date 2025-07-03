const Joi = require('@hapi/joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

const addServiceSchema = Joi.object({
    request_on: Joi.string().required(),
    request_type: Joi.string().required(),
    category: Joi.string().required(),
    sub_category: Joi.string().required(),
    code: Joi.string().required(),
    email: Joi.string().required(),
    doc_name: Joi.string().required(),
    doc_url: Joi.string().required(),
    message: Joi.string().required(),
})


const paramsSchema = Joi.string().alphanum().max(24).min(24).required();
module.exports = {
    addServiceSchema,
    paramsSchema
};