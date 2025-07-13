const client = require("../helpers/mongodb");
const config = require("../config.json");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const emailHelper = require("../helpers/mailer.js");
const verify = require("../helpers/auth");
const refreshToken = require("../helpers/refresh-token");
const phoneHelper = require("../helpers/phone-verification");
const { ObjectId, Double, Int32 } = require("mongodb");
const errorMsgs = require("../error-msgs.json");
const event = require("events");
class _emitter extends event.EventEmitter {}
const emitter = new _emitter();

module.exports = {
  authenticate,
  getRefreshToken,
  forgotPassword,
  resetForgotPassword,
  forgotPasswordPhone,
  verifyForgotPhoneNumber,
  resetForgotPasswordPhone,
  addProviders,
  logout,
  authenticateAdmin,
  userSignup,
};

async function authenticateAdmin({ email, password, device_token }) {
  try {
    let foundUser = await client
      .db("wasl")
      .collection("admin")
      .findOne({ email: email });

    if (!foundUser) return { error: "Invalid email or password " };

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) return { error: "Password Invalid" };

    const token = jwt.sign(
      {
        userid: foundUser._id,
      },
      config.secret
    );

    var res = await refreshToken(foundUser._id.toString(), null);

    if (res.hasOwnProperty("error")) {
      return {
        error: res.error,
      };
    } else {
      foundUser.token = {
        access_token: token,
        refresh_token: res.refresh_token,
        ttl: 3600,
      };
      return foundUser;
    }
  } catch (ex) {
    if (ex.code === 11000 || ex.name === "MongoError") {
      return {
        error: "Login failed. Error occured. " + ex,
      };
    }

    return {
      error: "abcd",
    };
  }
}

async function getRefreshToken({ refresh_token }) {
  try {
    let doc = await client
      .db("wasl")
      .collection("refresh_tokens")
      .findOne({ refresh_token: { $in: [refresh_token] } });

    if (doc) {
      const token = jwt.sign(
        {
          userid: doc.user_id,
        },
        config.secret
      );

      var res = await refreshToken(doc.user_id, doc.ipv, refresh_token);

      if (res.hasOwnProperty("error")) {
        return {
          error: res.error,
        };
      } else {
        return {
          access_token: token,
          refresh_token: res.refresh_token,
          ttl: 3600,
        };
      }
    } else {
      return {
        error: "Token does not exist.",
      };
    }
  } catch (e) {
    return {
      error: "something went wrong.",
    };
  }
}
async function authenticate({ email, password }) {
  console.log("🚀 ~ authenticate ~ email:", email);
  try {
    let foundUser = await client
      .db("wasl")
      .collection("users")
      .findOne({ "personal_info.email": email.toLowerCase() });

    console.log("🚀 ~ authenticate ~ foundUser:", foundUser);

    if (!foundUser)
      return {
        error: errorMsgs.login.password.invalid,
      };
    console.log("password", foundUser.app_settings.password);

    const isPasswordValid = await bcrypt.compare(
      password,
      foundUser.app_settings.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      {
        userid: foundUser._id,
      },
      config.secret
    );

    var res = await refreshToken(foundUser._id.toString(), null);

    if (res.hasOwnProperty("error")) {
      return {
        error: res.error,
      };
    } else {
      delete foundUser.app_settings;
      console.log("user", foundUser);
      return {
        status: "success",
        data: {
          user: {
            _id: foundUser?._id,
            address: foundUser?.personal_info.address,
            name: foundUser?.personal_info.name,
            email: foundUser?.personal_info.email,
            image: foundUser?.personal_info.image,
            phoneNumber: foundUser?.personal_info.phoneNumber,
            role: foundUser?.personal_info.role,
          },
        },
        token,
      };
    }
  } catch (ex) {
    if (ex.code === 11000 || ex.name === "MongoError") {
      return {
        error: "Login failed. Error occured. " + ex,
      };
    }

    return {
      error: errorMsgs.login.password.invalid,
    };
  }
}
async function userSignup({ name, email, password }) {
  try {
    const usersCollection = client.db("wasl").collection("users");

    const foundUser = await usersCollection.findOne({
      "personal_info.email": email.toLowerCase(),
    });

    if (foundUser) {
      return {
        error: "User already exists. Please login!",
      };
    }

    const hashedPassword = await bcrypt.hash(
      password,
      await bcrypt.genSalt(10)
    );

    const newUser = await usersCollection.insertOne({
      personal_info: {
        email: email.toLowerCase(),
        role: "user",
        image: "default.png",
        name,
      },
      app_settings: {
        password: hashedPassword,
        active: true,
      },
    });

    return {
      message: "Account has been created successfully. Please login!",
    };
  } catch (ex) {
    return {
      error: "Signup failed. " + (ex?.message || "Unexpected error"),
    };
  }
}

async function forgotPassword({ email }) {
  let doc = await client
    .db("wasl")
    .collection("users")
    .findOne({ email: email });

  if (doc) {
    /*
     * User found
     * Now generate a 'forgot password token'
     * Save the hash in the db
     * Send it to the user via registered email address.
     */

    let forgotPwdToken = uuidv4();
    let forgotPwdToken_hash = await bcrypt.hash(
      forgotPwdToken,
      await bcrypt.genSalt(10)
    );

    let result = await client
      .db("wasl")
      .collection("forgotpwd")
      .updateOne(
        {
          email: doc.email,
        },
        {
          $set: {
            forgot_token: forgotPwdToken_hash,
          },
        },
        {
          upsert: true,
        }
      );

    //To be replaced with FlytUtils.sendEmail(user_email, forgotPwdToken); later on.
    console.log("ok forget ", forgotPwdToken);
    emailHelper.sendForgotPasswordEmail(
      doc.full_name,
      doc.email,
      forgotPwdToken
    );
    console.log(`Sent password reset email to ${doc.email}`);

    return {
      message: "You have been sent a password reset email.",
    };
  } else {
    return null;
  }
}

async function resetForgotPassword({
  email,
  forgot_pwd_token,
  new_password,
  confirm_new_password,
}) {
  try {
    let doc = await client
      .db("wasl")
      .collection("forgotpwd")
      .findOne({ email: email });

    if (doc && (await bcrypt.compare(forgot_pwd_token, doc.forgot_token))) {
      /*
       *   Check if forgot password token is present in the db
       *   Compare Hash(forgot_pwd_token) (from the http request) and forgot_pwd_token (already hashed) (from the db)
       *   If true change the user password (follow same standards as registration)
       *   *   Delete the record from "forgotpwd" collection
       *   If not reject the request
       */
      if (new_password === confirm_new_password) {
        let result = await client
          .db("wasl")
          .collection("users")
          .updateOne(
            {
              email: doc.email,
            },
            {
              $set: {
                password: await bcrypt.hash(
                  new_password,
                  await bcrypt.genSalt(10)
                ),
              },
            }
          );

        if (result.modifiedCount === 1) {
          let delResult = await client
            .db("wasl")
            .collection("forgotpwd")
            .deleteOne({
              email: doc.email,
            });

          if (delResult.deletedCount == 1) {
            return {
              // message: 'Your password has been reset successfully. Please login with your new credentials.'
              message: true,
            };
          } else {
            return {
              message: "Could not change password.",
            };
          }
        } else {
          return {
            message: "Could not change password.",
          };
        }
      } else {
        return {
          message: "Password mismatch",
        };
      }
    } else {
      return {
        message: "Could not change password.",
      };
    }
  } catch (e) {
    return {
      error: "Something went wrong.",
    };
  } finally {
  }
}

async function forgotPasswordPhone({ phone }) {
  let doc = await client
    .db("wasl")
    .collection("users")
    .findOne({ phone: phone });

  if (doc) {
    /*
     * User found
     * Now generate a 'forgot password token'
     * Save the hash in the db
     * Send it to the user via registered email address.
     */

    let otp_sent = await phoneHelper.sendOTP(doc.phone);

    if (otp_sent.result === "sent") {
      console.log(`Sent password reset otp to ${doc.phone}`);

      return {
        message: `Sent password reset otp to ${doc.phone}`,
      };
    } else {
      return {
        error: `OTP sent failed phone to ${doc.phone}`,
      };
    }
  } else {
    return {
      error: "User does not exist.",
    };
  }
}

async function verifyForgotPhoneNumber(req) {
  try {
    let doc = await client
      .db("wasl")
      .collection("users")
      .findOne({ phone: req.phone });

    if (doc) {
      var verifyResult = await twillioClient.verify
        .services(config.twillio_sid)
        .verificationChecks.create({
          to: `+${req.phone}`,
          code: req.code,
        });

      if (verifyResult.status === "approved") {
        let forgotPwdToken = uuidv4();

        let forgotPwdToken_hash = await bcrypt.hash(
          forgotPwdToken,
          await bcrypt.genSalt(10)
        );

        let result = await client
          .db("wasl")
          .collection("forgotpwdphone")
          .updateOne(
            {
              phone: doc.phone,
            },
            {
              $set: {
                forgot_token: forgotPwdToken_hash,
              },
            },
            {
              upsert: true,
            }
          );
        if (result.modifiedCount > 0 || result.upsertedCount > 0) {
          return {
            message: "otp verified " + doc.phone,
            forgot_token: forgotPwdToken,
          };
        } else {
          return {
            error: "Could not verify phone number. Something went wrong.",
          };
        }
      } else {
        return {
          error: "otp verification failed" + doc.phone,
        };
      }
    } else {
      return {
        error: "User does not exist.",
      };
    }
  } catch (err) {
    console.log(err);

    return {
      error: "Could not verify phone number. Something went wrong.",
    };
  }
}

async function resetForgotPasswordPhone({
  phone,
  forgot_pwd_token,
  new_password,
  confirm_password,
}) {
  try {
    let doc = await client
      .db("wasl")
      .collection("forgotpwdphone")
      .findOne({ phone: phone });

    let verify_resettoken = await bcrypt.compare(
      forgot_pwd_token,
      doc.forgot_token
    );

    if (verify_resettoken) {
      /*
       *   Check if forgot password token is present in the db
       *   Compare Hash(forgot_pwd_token) (from the http request) and forgot_pwd_token (already hashed) (from the db)
       *   If true change the user password (follow same standards as registration)
       *   *   Delete the record from "forgotpwd" collection
       *   If not reject the request
       */

      if (new_password === confirm_password) {
        let result = await client
          .db("wasl")
          .collection("users")
          .updateOne(
            {
              phone: doc.phone,
            },
            {
              $set: {
                password: await bcrypt.hash(
                  new_password,
                  await bcrypt.genSalt(10)
                ),
              },
            }
          );

        if (result.modifiedCount === 1) {
          let delResult = await client
            .db("wasl")
            .collection("forgotpwdphone")
            .deleteOne({
              phone: doc.phone,
            });

          if (delResult.deletedCount == 1) {
            return {
              message:
                "Your password has been reset successfully. Please login with your new credentials.",
            };
          } else {
            return {
              error: "Could not change password.",
            };
          }
        } else {
          return {
            error: "Could not change password.",
          };
        }
      } else {
        return {
          error: "password mismatch",
        };
      }
    } else {
      return {
        error: "Could not change password.",
      };
    }
  } catch (e) {
    return {
      error: "something went wrong.",
    };
  }
}

/*
 *   This is an authenticated call.
 *   Extract user id from the jwt token and compare with "email" (parameter). Needs to be implemented in the controller.
 *   Then hash(old_password) with existing password from the database.
 *       *   IF they match, hash(new_password) and update it in the database.
 *               *   Send Success message to the user.
 *               *   Do not log out the user.
 *       *   ELSE Reject the request.
 */

async function thirdPartyLogin(data, token, device_token) {
  let userRecord = await client
    .db("wasl")
    .collection("users")
    .findOne({ email: data.email });

  if (!userRecord) {
    let ipv = false;
    var newUser = new Object({
      socialid: data.userId,
      full_name: data.name,
      email: data.email,
      ipv: ipv,
      iev: false,
      loyalty_points: {
        earned: 0,
        avaiable: 0,
      },
      role_id: 2,
      user_type: "customer",
    });

    let result = await client.db("wasl").collection("users").insertOne(newUser);

    if (result.insertedId) {
      let id = result.insertedId.toString();
      let user_cart = await client
        .db("wasl")
        .collection("cart")
        .findOne({ user_id: id });
      if (!user_cart) {
        // create user cart
        //var cart = createCart(0, 0);
        cart.user_id = result.insertedId.toString();

        // Creating cart when user signup
        await client.db("wasl").collection("cart").insertOne(cart);
      }

      // Register customer on stripe
      emitter.emit("create_stripe_customer", id);

      if (device_token) {
        var query = { user_id: result._id, device_token: device_token };
        var newValue = {
          $set: {
            user_id: result._id,
            device_token: device_token,
            logged_in: true,
          },
        };
        await client
          .db("wasl")
          .collection("tokens")
          .updateOne(query, newValue, { upsert: true });
      }

      const token = jwt.sign(
        {
          userid: result.insertedId,
          ipv: ipv,
        },
        config.secret
      );

      var res = await refreshToken(result.insertedId.toString(), ipv);

      if (res.hasOwnProperty("error")) {
        return {
          error: res.error,
        };
      } else {
        return {
          registered: true,
          message: "Please verify your phone number",
          verifyPhoneNumber: true,
          full_name: data.name,
          token: {
            access_token: token,
            refresh_token: res.refresh_token,
            ttl: 3600,
          },
        };
      }
    } else {
      return { error: "Login failed! Please sign up" };
    }
  } else {
    if (userRecord.role_id !== 1) {
      if (device_token) {
        var query = { user_id: userRecord._id, device_token: device_token };
        var newValue = {
          $set: {
            user_id: userRecord._id,
            device_token: device_token,
            logged_in: true,
          },
        };

        await client
          .db("wasl")
          .collection("tokens")
          .updateOne(query, newValue, { upsert: true });
      }
      if (userRecord.ipv) {
        const token = jwt.sign(
          { userid: userRecord._id, ipv: true },
          config.secret
        );

        let { password, ...userWithoutPassword } = userRecord;

        var res = await refreshToken(userRecord._id.toString(), userRecord.ipv);

        if (res.hasOwnProperty("error")) {
          return {
            error: res.error,
          };
        } else {
          userWithoutPassword.token = {
            access_token: token,
            refresh_token: res.refresh_token,
            ttl: 3600,
          };
          return userWithoutPassword;
        }
      } else {
        const token = jwt.sign(
          {
            userid: userRecord._id,
            ipv: false,
          },
          config.secret
        );

        var res = await refreshToken(userRecord._id.toString(), false);

        if (res.hasOwnProperty("error")) {
          return {
            error: res.error,
          };
        } else {
          return {
            registered: true,
            message: "Please verify your phone number",
            verifyPhoneNumber: true,
            full_name: data.name,
            token: {
              access_token: token,
              refresh_token: res.refresh_token,
              ttl: 3600,
            },
          };
        }
      }
    } else {
      return {
        error: {
          en: "Admin's account is not allowed to login",
          ar: "",
        },
      };
    }
  }
}

async function logout(userid, req) {
  try {
    var refresh_token = await client
      .db("wasl")
      .collection("refresh_tokens")
      .findOneAndDelete({ user_id: userid, refresh_token: req.refresh_token });

    if (!refresh_token.value) {
      return {
        error: "User does not exists. Error occurred",
      };
    } else {
      await client
        .db("wasl")
        .collection("tokens")
        .findOneAndDelete({
          user_id: ObjectId(userid),
          device_token: req.device_token,
        });

      return {
        message: "logout successfully",
      };
    }
  } catch (err) {
    console.log(err);

    if (err.code === 11000 && err.name === "MongoError") {
      return {
        error: "Cannot register user. User already exists.",
      };
    }
  }
}

async function addProviders(body) {
  const { personal_info, preferences, contact_info } = body;
  console.log("🚀 ~ addProviders ~ personal_info:", personal_info)

    const usersCollection = client.db("wasl").collection("users");
  
  const newUser = await usersCollection.insertOne({
    personal_info,
    preferences,
    contact_info,
  });

  return {
    status: "success",
    message: "service provider has been added successfully",
    user:newUser
  };
}
emitter.on("create_stripe_customer", async (user_id) => {
  try {
    const customer = await stripe.customers.create({
      metadata: {
        user_id: user_id,
      },
    });

    if (customer.id) {
      let updateResult = await client
        .db("wasl")
        .collection("users")
        .updateOne(
          { _id: ObjectId(user_id) },
          { $set: { stripe_id: customer.id } }
        );
      console.log(updateResult);
    }
  } catch (err) {
    console.log(err.message);
  }
});
