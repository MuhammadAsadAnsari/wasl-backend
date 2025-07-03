const client = require('../helpers/mongodb');
const { ObjectId, Double, Int32 } = require('mongodb');
const config = require('../config.json');
const stripe = require("stripe")(config.stripe_secret_key);

module.exports = {    
    getPaymentIntent,
    getPaymentIntentById,
    updatePaymentIntent,
    updatePaymentIntentById,
    createPaymentIntent
};

async function createPaymentIntent(payer, payerStripeId, amount, orderId) {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "USD",
            customer : payerStripeId,
            metadata : { order_id : orderId }
        });       
        
        //TODO: REMOVE IN PROD
        console.log(paymentIntent);

        let insertResult = await client.db('flyt').collection('payment_details').insertOne(
            {
                payer : payer,
                payee : payee,
                amount : Double(amount),
                type : type,
                details : details,
                payment_intent : paymentIntent.id,
                sys : {
                    cf : false,
                    aa : false
                }
            }
        );

        if (insertResult.insertedCount === 1) {
            return paymentIntent;
        }
        else {
            return {
                error : "Could not create payment intent."
            }
        }        
    }
    catch(err) {
        console.log(err);

        return {
            error : "Could not create payment intent."
        }
    }
}

async function getPaymentIntent(payer, type, details, payee) {
    try {
        let paymentIntent = await client.db('flyt').collection('payment_details').findOne(
            {
                payer : payer,
                type : type,
                details : details,
                payee : payee
            }
        );

        if (paymentIntent) {
            return paymentIntent;
        }
        else {
            return {
                error : "Could not fetch payment intent for the given invite."
            }
        }
    }
    catch(err) {
        console.log(err);

        return {
            error : "Could not fetch the payment intent."
        }
    }
}

async function getPaymentIntentById(paymentIntentId) {
    try {
        let paymentIntent = await client.db('flyt').collection('payment_details').findOne(
            {
                payment_intent : paymentIntentId
            }
        );

        if (paymentIntent) {
            return paymentIntent;
        }
        else {
            return {
                error : "Could not fetch payment intent."
            }
        }
    }
    catch(err) {
        console.log(err);

        return {
            error : "Could not fetch the payment intent."
        }
    }
}

async function updatePaymentIntent(paymentId, confirmed, apiAction) {
    try {
        let result = await client.db('flyt').collection('payment_details').updateOne(
            {
                _id : ObjectId(paymentId)
            },
            {
                $set : {
                    'sys.cf' : confirmed,
                    'sys.aa' : apiAction
                }
            }
        );

        if (result.modifiedCount === 1) {
            return {
                message : "Payment intent has been updated successfully."
            }
        }
        else {
            return {
                error : "Could not update the payment intent."
            }   
        }
    }
    catch(err) {
        console.log(err);

        return {
            error : "Could not update the payment intent."
        }
    }
}

async function updatePaymentIntentById(paymentIntentId, confirmed, apiAction) {
    try {
        let result = await client.db('flyt').collection('payment_details').updateOne(
            {
                payment_intent : paymentIntentId
            },
            {
                $set : {
                    'sys.cf' : confirmed,
                    'sys.aa' : apiAction
                }
            }
        );

        if (result.modifiedCount === 1) {
            return {
                message : "Payment intent has been updated successfully."
            }
        }
        else {
            return {
                error : "Could not update the payment intent."
            }   
        }
    }
    catch(err) {
        console.log(err);

        return {
            error : "Could not update the payment intent."
        }
    }
}

/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 *                          ==========    
 *                          PARAMETERS
 *                          ==========
 * 
 *  "payer" : The profileId of the user who is expected to pay.
 * 
 *  "type"    : One of =>
 *              [
 *                          "game_fee",
 *                          "season_fee",
 *                          "season_offer",
 *                          "game_offer",
 *                          "rec_event_fee"                          
 *              ]
 * 
 *  "details" : The details Object which points to the cause of payment.
 *              (Could be: invite(game,season), rec_event)
 * 
 *  "amount"  : The amount of payment (in STRIPE format)
 *  
 *  "payee"   : The profileId of the user who is expected to receive the payment.
 * 
 *  "sys" : Object contains two keys => [ "cf", "aa"]
 *      
 *      - "cf" (pronounced as "Confirmed") : (Boolean) represents whether the payment has been verified
 *                                           either via webhook from STRIPE OR the API server (e.g: during a request).
 * 
 *      - "aa" (pronounced as "API Action"): (Boolean) represents whether the resulting action (e.g: addPlayerToTeam())
 *                                           which was supposed to be performed on the API Server has happened
 *                                           or not.
 *  
 *  "metadata":  The Object which you want to send to stripe. (often contains the "type"). Useful for payment type
 *               identification.
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *  
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 */

