const { string } = require('@hapi/joi')
const admin = require('firebase-admin')
const serviceAccount = require('../firebase-config.json')
let isAdminIntialized = false

class Firebasehelper {
  static init () {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
    }
    isAdminIntialized = true
  }

  static verifyToken (token) {
    const fake_message = {
      data: {
        greetings: 'Hello !'
      },
      token
    }

    return admin.messaging().send(fake_message, true)
  }

  static pushMessage (
    registration_token,
    notification_title,
    notification_body
  ) {
    if (!isAdminIntialized) throw new Error('First call init method !')

    if ((typeof registration_token === 'string') || (registration_token instanceof String))
      throw new Error('registration token is not valid!')

    if (!notification_title)
      throw new Error('Please provide notification title')

    if (!notification_body) throw new Error('Please provide notification body')

    const message = {
      tokens: registration_token,
      priority: 'high',
      notification: {
        title: notification_title,
        body: notification_body
      },
      android: {
        ttl: 60 * 60 * 24
      }
    };

    return new Promise((resolve, reject) => {
      admin
        .messaging()
        .sendMulticast(message)
        .then(response => {
          console.log('res', response)
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  }
}

module.exports = Firebasehelper
