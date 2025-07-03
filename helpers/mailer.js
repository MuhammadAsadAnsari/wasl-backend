const url = require('../config.json');
const nodemailer = require("nodemailer")
const handlebars = require("handlebars")
const fs = require("fs")
const path = require("path")
const express = require('express');
const app = express();

app.set('view engine', 'ejs')

module.exports = {
    sendUserVerificationEmail,
    sendForgotPasswordEmail
};

async function sendToEmail(name, to, subject, message, url) {

    var smtpConfig = {
        host: 'smtp.mailgun.org',
        port: 587,
        secure: false,
        auth: {
            user: '',
            pass: ''
        }
    };

    var transporter = nodemailer.createTransport(smtpConfig);

    const emailTemplateSource = fs.readFileSync('./views/confirmation.ejs', "utf8")
    const template = handlebars.compile(emailTemplateSource)
    const htmlToSend = template({ confirmation_url : url })

    var mailOptions = { 
        from: 'noreply@www.ticketpeers.com',
        to: to,
        subject: subject,
        html: htmlToSend
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

async function sendResetEmail(name, to, subject, message, url) {

    var smtpConfig = {
        host: 'smtp.mailgun.org',
        port: 587,
        secure: false,
        auth: {
            user: 'postmaster@sandbox517bdacb18b24aa9940b52165a7bc888.mailgun.org',
            pass: 'a1d90d75b76874610d768de661e0250b-6d1c649a-b8b7374a'
        }
    };

    var transporter = nodemailer.createTransport(smtpConfig);

    // const emailTemplateSource = fs.readFileSync('./views/forgetpassword.html', "utf8")
    // const template = handlebars.compile(emailTemplateSource)
    // const htmlToSend = template({ confirmation_url : url })

    var mailOptions = { 
        from: 'noreply@www.ticketpeers.com',
        to: to,
        subject: subject,
        html: message
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

async function sendForgotPasswordEmail(name, to, token) {
    try {
        const subject = "Reset your password";
        let uri = url.HTTP + url.host_name + ":" + url.port + "/auth/forgetpassword?email=" + to + "&token=" + token

        const message = "<!doctypehtml><table style=width:100%;background-image:url(http://209.126.81.76:3015/uploads/bg.png);max-width:600px;max-height:600px><thead style=text-align:center><tr rowspan=12><td colspan=12><img alt=Optimus Logo src=http://209.126.81.76:3015/optimus-logo.png style=padding-top:30px;padding-bottom:30px><tbody><tr><td ackground-color:#fff;font-size:1px;line-height:1px class=topBorder height=3> <tr><td 20px; 20px; adding-bottom: align=center class=mainTitle padding-left: padding-right: valign=top 5px;><h2 0px class=text style=color:#000;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:28px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;padding:0;margin:15px><b>Click the link below to change your password</b></h2><tr><td 20px; 20px; adding-bottom: align=center class=subTitle padding-left: padding-right: valign=top 30px;><h4 0px class=text style=color:#999;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:24px;text-transform:none;padding:0;margin:0><b><a href="+uri+"><b #817984; 15px; border-radius:10px; color:black; padding:10px>Click Here</b></a></b></h4></table>"

        await sendResetEmail(name, to, subject, message, uri);
    }
    catch (err) {
        console.log(err);
    }
}

async function sendUserVerificationEmail(name, to, user_id) {
    try {
        const subject = "Verify your email address";
        const message = "Click on the button to confirm your account";
        let uri = url.HTTP+url.host_name+":"+url.port+"/user/email/verify?id="+user_id

        await sendToEmail(name, to, subject, message, uri);
    }
    catch (err) {
        console.log(err);
    }
}