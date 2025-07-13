const Joi = require("@hapi/joi");
const myCustomJoi = Joi.extend(require("joi-phone-number"));

const loginRequestSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(15).required(),
  device_token: Joi.string(),
});

const signUpRequestSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(15).required(),
});

const addProviderSchema = Joi.object({
  personal_info: Joi.object()
    .keys({
      name: Joi.string().required(),
      serviceType: Joi.string().required(),
      role: Joi.string().required(),

      cnic: Joi.string().required(),
      phoneNumber: Joi.string().required(),
    })
    .required(),

  preferences: Joi.object()
    .keys({
      preferred_language: Joi.string().required(),
    })
    .required(),

  contact_info: Joi.object()
    .keys({
      address: Joi.string().required(),
      city: Joi.string().required(),
    })
    .required(),
});

const refreshTokenRequestSchema = Joi.object({
  refresh_token: Joi.string().required(),
});

const forgotPasswordRequestSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetForgotPasswordRequestSchema = Joi.object({
  email: Joi.string().email().required(),

  forgot_pwd_token: Joi.string().length(36).required(),

  new_password: Joi.string().min(8).max(15).required(),
  confirm_new_password: Joi.string().min(8).max(15).required(),
});

const forgotPasswordRequestPhoneSchema = Joi.object({
  phone: Joi.string().required(),
});

const forgotPasswordVerifyPhoneSchema = Joi.object({
  phone: Joi.string().required(),
  code: Joi.string().min(6).max(6).required(),
});
const resetForgotPasswordRequestPhoneSchema = Joi.object({
  forgot_pwd_token: Joi.string().length(36).required(),

  new_password: Joi.string().min(8).max(15).required(),

  confirm_password: Joi.string().min(8).max(15).required(),
});

const resetPasswordRequestSchema = Joi.object({
  old_password: Joi.string().min(8).max(15).required(),

  new_password: Joi.string().min(8).max(15).required(),

  confirm_password: Joi.string().min(8).max(15).required(),
});

const upgradeTokenSchema = Joi.object({
  sport: Joi.string().valid("basketball", "baseball").required(),

  role: Joi.string()
    .valid("fan", "executive", "player", "coach", "referee")
    .required(),
});

const loginSocialSchema = Joi.object({
  token: Joi.string().required(),
  tokenType: Joi.string().required(),
  device_token: Joi.string(),
});

const loginAppleSchema = Joi.object({
  name: Joi.string().required(),
  token: Joi.string().required(),
  device_token: Joi.string(),
});

const logoutSchema = Joi.object({
  refresh_token: Joi.string().required(),
  device_token: Joi.string().required(),
});

module.exports = {
  loginRequestSchema,
  refreshTokenRequestSchema,
  forgotPasswordRequestSchema,
  resetForgotPasswordRequestSchema,
  resetPasswordRequestSchema,
  upgradeTokenSchema,
  loginSocialSchema,
  loginAppleSchema,
  forgotPasswordRequestPhoneSchema,
  forgotPasswordVerifyPhoneSchema,
  resetForgotPasswordRequestPhoneSchema,
  logoutSchema,
  signUpRequestSchema,

  addProviderSchema
};
