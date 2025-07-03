const { expressjwt: jwt } = require('express-jwt');
const config = require('../config.json');

module.exports = jwtAuthentication;

function jwtAuthentication() {

    const { secret } = config;

    return jwt({ secret: secret, algorithms: ["HS256"] }).unless({
        path: [
            //public routes that don't require authentication
            '/auth/token',
            '/auth/token/refresh',
            '/auth/forgotpwd',
            '/auth/forgotpwd/reset',
            '/auth/forgotpwd/phone',
            '/auth/forgotpwd/phone/verify',
            '/auth/forgotpwd/reset/phone',
            '/auth/forgetpassword',
            '/user/register',
            '/user/verify',
            '/user/email/verify',
            '/forgetpassword',
            '/docs',
            '/docs/',
            '/docs/swagger-ui.css',
            '/docs/swagger-ui-bundle.js',
            '/docs/swagger-ui-standalone-preset.js',
            '/docs/swagger-ui-init.js',
            '/docs/favicon-32x32.png',
            '/docs/favicon-16x16.png',
            '/files/upload/image',
        ]
    });
}