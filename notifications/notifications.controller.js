const express = require('express');
const router = express.Router();
const notificationService = require('./notifications.service');
const schema = require('./notifications.schemas');
const verify = require('../helpers/verify');

// routes
router.get('', verify, getAllNotifications);
router.post('/:notificationId/read', verify, readNotification)
router.get('/count', verify, getNotificationsCount)

module.exports = router;

async function getAllNotifications(req, res) {

    let result = await notificationService.notifications(req);

    if (result.hasOwnProperty('error')) {
        res.status(400).json(result);
    } else {
        res.status(200).json(result);
    }
}

async function readNotification(req, res) {
    let result = await notificationService.readNotification(req);
    if (result.hasOwnProperty('error')) {
        res.status(400).json(result);
    } else {
        res.status(200).json(result);
    }
}

async function getNotificationsCount(req, res) {
    let result = await notificationService.getNotificationsCount(req);
    if (result.hasOwnProperty('error')) {
        res.status(400).json(result);
    } else {
        res.status(200).json(result);
    }
}
