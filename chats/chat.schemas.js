const Joi = require('@hapi/joi');


const createChatSchema = Joi.object({


    member: {
        userid: Joi.string().alphanum().max(24).required(),
    }
});


module.exports = {
    createChatSchema,
};