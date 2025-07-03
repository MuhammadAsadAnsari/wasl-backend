const client = require('../helpers/mongodb');
const { ObjectId, Double, Int32 } = require('mongodb');
const conf = require('../config.json');
const jwt = require('jsonwebtoken');
const refreshToken = require('../helpers/refresh-token')


async function sendOTP(phone) {
    try {

        try {

            var verifyResult = await twillioClient.verify.v2.services(conf.twillio_sid).verifications.create({
                to: `+${phone}`,
                channel: 'sms',
            });

            if (verifyResult.status == 'pending') {

                return {
                    result:"sent",
                    phone: verifyResult.to,
                    codesent: true,
                };

            } else {

                return {
                    error: 'Invalid Phone Number.',
                };

            }
        } catch (err) {
            console.log(err);

            if (err.status === 400) {
                return {
                    error: 'Invalid Phone Number.',
                };
            } else {
                return {
                    error: err,
                };
            }
        }
    } catch (err) {
        console.log(err);

        if (err.code === 11000 && err.name === 'MongoError') {
            return {
                error: 'Phone Number does not exist',
            };
        } else {
            return {
                error: err,
            };
        }
    }
}

async function verifyOTP(phone, otp_code) {
    try {

        var verifyResult = await twillioClient.verify.services(conf.twillio_sid).verificationChecks.create({
            to: `+${phone}`,
            code: otp_code,
        });

        if (verifyResult.status === "approved") {
           return {
                result:"approved"
           }
        }

        else {
            return {
                error: 'Could not verify phone number. Something went wrong.',
            };
        }
    } 
    catch (err) {
        console.log(err);

        return {
            error: 'Could not verify phone number. Something went wrong.',
        };
    }
}

module.exports = {
    sendOTP,
    verifyOTP
}