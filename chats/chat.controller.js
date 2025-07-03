const express = require('express');
const router = express.Router();
const chatService = require('./chat.service');
const chatSchema =require('./chat.schemas')
const Joi = require('@hapi/joi');
const verify = require('../helpers/verify')


router.get('/',verify, getAllChats);
router.post('/',verify, createNewChat);
router.get('/available/admin',verify, getAllAdmins);
//router.delete('/:chatId',verify, deletechatMessages);
router.get('/:chatId/details',verify, getChatDetailsById);
router.get('/:chatId/messages',verify, getChatMessages);


module.exports = router;


async function getAllChats(req, res, next) {
        let allChats = await chatService.getAllChats(req,req.user_id);
       
        if (allChats.hasOwnProperty("error")) {
            res.status(400).json(allChats);
        } else {
            res.json({
                data: allChats
            });
        }


    next();
}

async function getAllAdmins(req, res, next) {
    let allAdmins = await chatService.admins(req.user_id);
   
    if (allAdmins.hasOwnProperty("error")) {
        res.status(400).json(allAdmins);
    } else {
        res.status(200).json(allAdmins);
    }


next();
}

async function createNewChat(req, res, next) {



     
        let createChatRes = await chatService.createChat(req);

        if (createChatRes.hasOwnProperty("error")) {
            res.status(400).json(createChatRes);
        }
        else {
            res.json(createChatRes);
        }


    next();
}

async function deletechatMessages(req, res, next) {



    const { error, value } = Joi.string().alphanum().max(24).required().validate(req.params.chatId);

    if (!error) {

        let createChatRes = await chatService.deleteChat(req.user_id, req.params.chatId);

        if (createChatRes.hasOwnProperty("error")) {
            res.status(400).json(createChatRes);
        }
        else {
            res.json(createChatRes);
        }
    }
    else {
        res.status(400).json({ error: error.message });
    }


    next();
}

async function markAsRead(req, res, next) {

    const { error, value } = Joi.string().alphanum().max(24).required().validate(req.params.chatId);

    if (!error) {

        let createChatRes = await chatService.markAsRead(req.user.userid, req.params.chatId);

        if (createChatRes.hasOwnProperty("error")) {
            res.status(400).json(createChatRes);
        }
        else {
            res.json(createChatRes);
        }
        
        
    } else {
        res.status(400).json({ error: 'Invalid Chat Id' });
    }

}


async function getChatDetailsById(req, res, next) {

    const { error, value } = Joi.string().alphanum().max(24).required().validate(req.params.chatId);

    if (!error) {
        let chatDetail = await chatService.getChatDetailsById(req.user_id, value);

        if (chatDetail.hasOwnProperty("error")) {
            res.status(400).json(chatDetail);
        }
        else {
            res.json(chatDetail);
        }
    }
    else {
        res.status(400).json({ error: error.message });
    }


    next();
}

async function getChatMessages(req, res, next) {
    const { error, value } = Joi.string().alphanum().max(24).required().validate(req.params.chatId);

    console.log("🚀 ~ getChatMessages ~ value:", value)
    if (!error) {
        let chatMessages = await chatService.getChatMessages( value, req);

        if (chatMessages.hasOwnProperty("error")) {
            res.status(400).json(chatMessages);
        }
        else {
            res.json({
                data: chatMessages
            });
        }
    }
    else {
        res.status(400).json({ error: error.message });
    }

    next();
}