const Joi = require('@hapi/joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

const paramsSchema = Joi.string().alphanum().max(24).min(24).required();

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const updateStatusSchema = Joi.object({
    status: Joi.string().required(),
})

const addRequestSchema = Joi.object({
  category: Joi.required(),
  sub_category: Joi.required(),
  address: Joi.string().required(),
  description: Joi.string().required(),
  phoneNumber : Joi.string().required(),
  user_availability: Joi.object({
    date: Joi.string().pattern(datePattern).required(),
    slot: Joi.string().required(),
  }),
});
module.exports = {
    paramsSchema,
    updateStatusSchema,
    addRequestSchema
};