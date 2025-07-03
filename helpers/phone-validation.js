const Joi = require("@hapi/joi");
const myCustomJoi = Joi.extend(require("joi-phone-number"));
const errorMsgs = require('../error-msgs.json');

function validate(phone) {
    let regExp = myCustomJoi.string().phoneNumber().min(10).max(35);

    if (!regExp.validate(phone).error) {
        if (phone[0] == "+") {
            phone = phone.split("+")[1];
            phone = phone.replace(/\D/g, "");
            if (phone.length > 9) {
                return phone
            } else {
                return {
                    error:
                        errorMsgs.phone_verification.phone['phoneNumber.invalid']
                };
            }
        } else if (phone[0] == "-") {
            phone = phone.split("-")[1];
            phone = phone.replace(/\D/g, "");
            if (phone.length > 9) {
                return phone;
            } else {
                return {
                    error:
                        errorMsgs.phone_verification.phone['phoneNumber.invalid']
                };
            }
        } else {
            phone = phone.replace(/\D/g, "");
            if (phone.length > 9) {
                return phone; 
            } else {
                return {
                    error:
                        errorMsgs.phone_verification.phone['phoneNumber.invalid']
                };
            }
        }
    } else {
        return {
            error:
                errorMsgs.phone_verification.phone['phoneNumber.invalid']
        };
    }
}

module.exports = validate;
