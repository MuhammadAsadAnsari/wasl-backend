const Joi = require('@hapi/joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

const datePattern = /^\d{2}-\d{2}-\d{4}$/;


const paramsSchema = Joi.string().alphanum().max(24).min(24).required();


const updateStatusSchema = Joi.object({
    status: Joi.string().required(),
})

const updateCheckedInSchema = Joi.object({
    is_checked_in: Joi.boolean().required(),
})


const addVisitorSchema = Joi.object({
    admin_id: Joi.string().id().alphanum().max(24).min(24).required(),
    address_id: Joi.string().id().alphanum().max(24).min(24).required(),
    name: Joi.string().required(),
    mobile_no: Joi.string().required(),
    email: Joi.string().email().required(),
    passport: Joi.string().required(),
    number_of_visitors : Joi.number().required(),
    start_day : Joi.string().pattern(datePattern).required(),
    end_day : Joi.string().pattern(datePattern).required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    doc_url: Joi.string().required(),
})
module.exports = {
    paramsSchema,
    updateStatusSchema,
    addVisitorSchema,
    updateCheckedInSchema
};