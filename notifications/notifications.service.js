const client = require('../helpers/mongodb');
const bcrypt = require('bcrypt');
const conf = require('../config.json');
const jwt = require('jsonwebtoken');
const offsetlimit = require('../helpers/offset-limit');
const { ObjectId, Double, Int32 } = require('mongodb');
const { off } = require('..');
const firebaseHelper = require('../helpers/firebase-helper');

module.exports = {
    notifications,
    readNotification,
    notificationsettings,
    getnotificationsettings,
    getNotificationsCount,
    sendNotification
};


async function notifications(req) {

    var { offset, limit } = await offsetlimit(req.query.offset, req.query.limit)

    let notifications = await client.db("wasl").collection("notifications")
        .find({ reciever_id: req.auth.userid }).
        skip(offset).
        limit(limit).
        sort({ _id: 1 }).
        toArray();

    if (notifications) {
        return notifications
    }
    else {
        return []
    }
}

async function notificationsettings(userid, req) {
    try {
        let response = await client.db('wasl').collection('tokens').updateMany(
            {
                user_id: ObjectId(userid),
            },
            {
                $set: {
                    is_turnon: req.is_turnon,
                },
            }
        );

        if (response.modifiedCount > 0) {
            return {
                success: "notification settings updated"
            };
        }
        else {
            return {
                error: 'Could not update notification settings.',
            };

        }
    } catch (err) {
        console.log(err);

        return {
            error: 'Could not update notification settings.',
        };
    }
}

async function getnotificationsettings(userid) {
    try {

        let response = await client.db('wasl').collection('tokens').findOne({ user_id: ObjectId(userid) });

        if (response) {
            return {
                is_turnon: response.is_turnon
            };
        }
        else {
            return null
        }
    } catch (err) {
        console.log(err);

        return {
            error: 'Could not update notification settings.',
        };
    }
}

async function readNotification(req) {
    try {

        let result = await client.db('wasl').collection('notifications').updateOne({
            _id: ObjectId(req.params.notificationId),
        }, {
            $set: {
                'read': true
            }
        }
        );
        if (result.modifiedCount > 0) {
            return {
                read: true
            };
        } else if (result.matchedCount > 0) {
            return {
                read: true
            };
        } else {
            return {
                error: 'Could not read notification. Notification does not exist.',
            }
        }
    } catch (err) {
        console.log(err);

        return {
            error: 'Could not read notification. Something went wrong.',
        };
    }
}

async function getNotificationsCount(req) {
    try {

        let notificationcount = await client.db('wasl').collection('notifications').countDocuments({
            receiver: req.auth.userid,
            read: false
        });
        var result = new Object({
            notificationCount: notificationcount
        })
        return result
    } catch (err) {
        console.log(err);

        return {
            error: 'Could not read notifications count. Something went wrong.',
        };
    }
}

async function sendNotification(title, description, type, sub_type, reciever_id, notify_detail_id) {

    try {

        let notification_content = {
            reciever_id: reciever_id,
            title: title,
            description: description,
            t: new Date(new Date().toUTCString()),
            data: {
                type: type,
                sub_type: sub_type,
                id: notify_detail_id,
                is_read: false
            }
        }

        let notification_saved = await client.db('wasl').collection('notifications').insertOne(notification_content);

        if (notification_saved.acknowledged) {
            try {
                let receiver = await client.db('wasl').collection('tokens').find({ user_id: reciever_id }).toArray();
        
                if (receiver.length > 0) {
                    let tokens = receiver.map(device => device.device_token);
                    console.log('Tokens:', tokens);
        
                    if (tokens.length > 0) {
                        firebaseHelper.init();

                        await firebaseHelper.pushMessage(tokens, title, description);

                    } else {
                        console.warn('No valid tokens found.');
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                // Handle the error appropriately
            }
        }
        

    } catch (error) {
        return {
            error: "Could not add notification, Something went wrong!"
        }
    }

}