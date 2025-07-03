const Joi = require('@hapi/joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

const registerSchema = Joi.object({

    full_name : Joi.string().max(30).pattern(/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/, 'Human names').required(),

    email: Joi.string().email().required(),

    password: Joi.string().min(8).max(20).required(),

    password_confirmation: Joi.any().equal(Joi.ref('password')).required().label('Confirm password').messages({ 'any.only': '{{#label}} does not match' }),
    
    device_token:Joi.string()

});

const FCMToken = Joi.object({

    token : Joi.string().required()
})

const verifyEmailSchema = Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().uuid().required()
});

const createVerificationSchema = Joi.object({
    phone: myCustomJoi.string().phoneNumber().required()
});

const phoneVerificationSchema = Joi.object({
    phone:   myCustomJoi.string().phoneNumber().required(),
    code: Joi.string().min(6).max(6).required(),
});

const registerSocialSchema = Joi.object({
    token: Joi.string().required(),
    tokenType: Joi.string().required(),
});

const userProfileSchema=Joi.object({
    full_name:Joi.string().required(),
})
const userProfileImageSchema=Joi.object({
    image:Joi.string().pattern(/\.(jpg|jpeg|gif|png|jfif)$/).message("Either the file name or the extension is invalid. Allowed extensions are :  jpg,jpeg,gif,png").allow('',null).required(),
})

const reportusSchema = Joi.object({
    subject: Joi.string().required(),
    message: Joi.string().required(),

});

const notificaitonSchema = Joi.object({
    is_turnon: Joi.boolean().required(),
   

});

module.exports = {
    registerSchema,
    verifyEmailSchema,
    createVerificationSchema,
    phoneVerificationSchema,
    registerSocialSchema,
    userProfileSchema,
    userProfileImageSchema,
    reportusSchema,
    notificaitonSchema,
    FCMToken
};