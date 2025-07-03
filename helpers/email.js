const AWS = require('aws-sdk');
const url = require('../config.json');

const config = {
  accessKeyId: "AKIAJFQATZWJ6Q3OCGMA",
  secretAccessKey: "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",

  //region: 'us-east-1'
};

module.exports = {
    sendUserVerificationEmail,
    sendForgotPasswordEmail
};

AWS.config.update(config);

var ses = new AWS.SES({region: 'us-east-1'});

async function sendEmail(to, subject, message) {
    var params = {
        Destination: {
            ToAddresses: [
                to
            ]
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: message
                },
                Text: {
                    Charset: "UTF-8",
                    Data: message
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject
            }
        },
        Source: "noreply@www.ticketpeers.com"
    };

    ses.sendEmail(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);   
    });
}

async function sendUserVerificationEmail(to, token) {
    try {
        const subject = "Verify your email address";
        const message = `Your email verification token is ${token}`;

        await sendEmail(to, subject, message);
    }
    catch(err) {
        console.log(err);
    }
}

async function sendForgotPasswordEmail(to, token) {
    try {
        const subject = "Reset your password";
        // const message = url.HTTP+url.host_name+":"+url.port+"/auth/forgetpassword?email="+to+"&token="+token;
        let uri = url.HTTP+url.host_name+":"+url.port+"/auth/forgetpassword?email="+to+"&token="+token
        const message = "<!DOCTYPE html><html><body><table style = width:100%><tbody><tr><td style = background-color:#fff;font-size:1px;line-height:1px class=topBorder height=3>&nbsp;</td></tr><tr><td style = padding-top: 60px; padding-bottom: 20px; align=center valign=middle class=emailLogo><a href = # style=text-decoration:none target=_blank><img alt =  border=0 src=http://104.167.11.190:30000/www1\\images\\5d94cde8-b404-4e81-b39b-16684194d07b_Titanio.png style=margin-top:20px;width:100%;max-width:150px;height:auto;display:block width=150></a></td></tr><tr><td style = padding-bottom: 5px; padding-left: 20px; padding-right: 20px; align=center valign=top class=mainTitle><h2 class=text style=color:#000;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:28px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;padding:0;margin:15px 0px><b>Click the link below to change your password</b></h2></td></tr><tr><td style = padding-bottom: 30px; padding-left: 20px; padding-right: 20px; align=center valign=top class=subTitle><h4 class=text style=color:#999;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:24px;text-transform:none;padding:0;margin:0px 0px><b><a href="+uri+"><b style=background-color: #817984; padding:10px 15px; border-radius:10px; color:black;>Click Here</b></a></b></h4></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style = font-size:1px;line-height:1px height= 20 > &nbsp;</td></tr></tbody></table></body></html>";

        await sendEmail(to, subject, message);
    }
    catch(err) {
        console.log(err);
    }
}