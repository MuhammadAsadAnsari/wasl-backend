const express = require("express");
const router = express.Router();
const tokenService = require("./token.service");
const schema = require("./token.schemas");
const verify = require("../helpers/verify");
const customePhoneValidator = require("../helpers/phone-validation");
const app = express();
const errorMsgs = require("../error-msgs.json");
// routes

router.post("/users/token", authenticateUser);
router.post("/token", authenticateAdmin);

router.put("/token/upgrade", verify, upgradeToken);
router.post("/user-signup", userSignup);
router.post("/add-providers",verify,addProviders)
router.post("/token/refresh", refreshToken);
router.post("/forgotpwd", forgotPassword);
router.get("/forgetpassword", forgetPassProcess);
router.post("/forgotpwd/reset", resetForgotPassword);
router.post("/logout", Logout);

module.exports = router;

app.set("view engine", "ejs");

async function forgetPassProcess(req, res) {
  res.render("forgetpassword");
}

async function authenticateAdmin(req, res, next) {
  try {
    const { error, value } = schema.loginRequestSchema.validate(req.body);
    if (!error) {
      try {
        var result = await tokenService.authenticateAdmin(req.body);

        if (result.hasOwnProperty("error")) {
          res.status(400).json(result);
        } else {
          res.status(200).json(result);
        }
      } catch (e) {
        console.log(e);

        if (err.name === "MongoError") {
          res.status(503).json({
            error: "Service unavailabe. Please try again.",
          });
        }
      }
    } else {
      // res.status(400).json({ error: error.message.toString().replace('\"', "").replace('\"', "") });
      // res.status(400).json({ error : JSON.parse(error.message) });

      if (
        errorMsgs.login[error.details[0].context.key][error.details[0].type] !==
        undefined
      ) {
        res
          .status(400)
          .json({
            error:
              errorMsgs.login[error.details[0].context.key][
                error.details[0].type
              ],
          });
      } else {
        res.status(400).json({ error: errorMsgs.default });
      }
    }
  } catch (error) {
    res.status(400).json({ error: errorMsgs.default });
  }

  next();
}

async function authenticateUser(req, res, next) {
  try {
    const { error, value } = schema.loginRequestSchema.validate(req.body);
    console.log("🚀 ~ authenticateUser ~ error:", error);

    if (!error) {
      try {
        var result = await tokenService.authenticate(req.body);

        if (result.hasOwnProperty("error")) {
          res.status(400).json(result);
        } else {
          res.status(200).json(result);
        }
      } catch (e) {
        console.log(e);

        if (err.name === "MongoError") {
          res.status(503).json({
            error: "Service unavailabe. Please try again.",
          });
        }
      }
    } else {
      // res.status(400).json({ error: error.message.toString().replace('\"', "").replace('\"', "") });
      // res.status(400).json({ error : JSON.parse(error.message) });

      if (
        errorMsgs.login[error.details[0].context.key][error.details[0].type] !==
        undefined
      ) {
        res.status(400).json({
          error:
            errorMsgs.login[error.details[0].context.key][
              error.details[0].type
            ],
        });
      } else {
        res.status(400).json({ error: errorMsgs.default });
      }
    }
  } catch (error) {
    res.status(400).json({ error: errorMsgs.default });
  }

  next();
}

async function userSignup(req, res, next) {
  try {
    const { error, value } = schema.signUpRequestSchema.validate(req.body);
    console.log("🚀 ~ userSignup ~ error:", error);

    if (!error) {
      try {
        var result = await tokenService.userSignup(req.body);

        if (result.hasOwnProperty("error")) {
          res.status(400).json(result);
        } else {
          res.status(200).json(result);
        }
      } catch (e) {
        console.log(e);

        if (err.name === "MongoError") {
          res.status(503).json({
            error: "Service unavailabe. Please try again.",
          });
        }
      }
    } else {
      // res.status(400).json({ error: error.message.toString().replace('\"', "").replace('\"', "") });
      // res.status(400).json({ error : JSON.parse(error.message) });

      if (
        errorMsgs.login[error.details[0].context.key][error.details[0].type] !==
        undefined
      ) {
        res.status(400).json({
          error:
            errorMsgs.login[error.details[0].context.key][
              error.details[0].type
            ],
        });
      } else {
        res.status(400).json({ error: errorMsgs.default });
      }
    }
  } catch (error) {
    res.status(400).json({ error: errorMsgs.default });
  }
  next();
}


async function addProviders(req, res, next) {
  try {
    const { error, value } = schema.addProviderSchema.validate(req.body);
    console.log("🚀 ~ addProviders ~ value:", value)

    if (!error) {
      try {
        var result = await tokenService.addProviders(value);

        if (result.hasOwnProperty("error")) {
          res.status(400).json(result);
        } else {
          res.status(200).json(result);
        }
      } catch (e) {
        console.log(e);

        if (err.name === "MongoError") {
          res.status(503).json({
            error: "Service unavailabe. Please try again.",
          });
        }
      }
    } else {
      // res.status(400).json({ error: error.message.toString().replace('\"', "").replace('\"', "") });
      // res.status(400).json({ error : JSON.parse(error.message) });

      if (
        errorMsgs.login[error.details[0].context.key][error.details[0].type] !==
        undefined
      ) {
        res.status(400).json({
          error:
            errorMsgs.login[error.details[0].context.key][
              error.details[0].type
            ],
        });
      } else {
        res.status(400).json({ error: errorMsgs.default });
      }
    }
  } catch (error) {
    res.status(400).json({ error: errorMsgs.default });
  }
  next();
}
async function upgradeToken(req, res, next) {
  const { error, value } = schema.upgradeTokenSchema.validate(req.body);

  if (!error) {
    try {
      var result = await tokenService.upgradeToken(
        req.body.sport,
        req.body.role,
        req.auth
      );

      if (result.hasOwnProperty("error")) {
        res.status(400).json(result);
      } else {
        res.json(result);
      }
    } catch (e) {
      console.log(e);

      res.status(400).json({
        error: "Something went wrong.",
      });
    }
  } else {
    res.status(400).json({ error: error.message });
  }

  next();
}

async function refreshToken(req, res, next) {
  const { error, value } = schema.refreshTokenRequestSchema.validate(req.body);

  if (!error) {
    try {
      var result = await tokenService.getRefreshToken(req.body);

      if (!result.hasOwnProperty("error")) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (e) {
      console.log(e);

      if (err.name === "MongoError") {
        res.status(503).json({
          error: "Service unavailabe. Please try again.",
        });
      }
    }
  } else {
    res.status(400).json({ error: error.message });
  }

  next();
}
//1. forgot_token send to EMAIL temp
async function forgotPassword(req, res, next) {
  try {
    const { error, value } = schema.forgotPasswordRequestSchema.validate(
      req.body
    );

    console.log("🚀 ~ forgotPassword ~ error:", error);
    if (!error) {
      try {
        var result = await tokenService.forgotPassword(req.body);

        if (result) {
          res.json(result);
        } else {
          res
            .status(400)
            .json({ error: "Could not generate forgot password token." });
        }
      } catch (e) {
        console.log(e);

        if (err.name === "MongoError") {
          res.status(503).json({
            error: "Service unavailabe. Please try again.",
          });
        }
      }
    } else {
      if (
        errorMsgs.forgot_password.email[error.details[0].type] !== undefined
      ) {
        res
          .status(400)
          .json({
            error: errorMsgs.forgot_password.email[error.details[0].type],
          });
      } else {
        res.status(400).json({ error: errorMsgs.default });
      }
    }
  } catch (error) {
    res.status(400).json({ error: errorMsgs.default });
  }

  next();
}

async function resetForgotPassword(req, res, next) {
  const { error, value } = schema.resetForgotPasswordRequestSchema.validate(
    req.body
  );

  if (!error) {
    try {
      var result = await tokenService.resetForgotPassword(req.body);

      if (result) {
        res.json(result);
      } else {
        res.status(400).json({ error: "Could not change password." });
      }
    } catch (err) {
      if (err.name === "MongoError") {
        res.status(503).json({
          error: "Service unavailabe. Please try again.",
        });
      }
    }
  } else {
    res.status(400).json({ error: error.message });
  }

  next();
}

//recheck

// Forgot phone verification:
// Cases:
// - If a user is not verify your phone num and goes for forgot password phone ?

//2. send otp to a registered PHONE NUM
async function forgotPasswordPhone(req, res, next) {
  const { error, value } = schema.forgotPasswordRequestPhoneSchema.validate(
    req.body
  );

  if (!error) {
    try {
      let phone = customePhoneValidator(value.phone);

      if (!phone.hasOwnProperty("error")) {
        value.phone = phone;
        var result = await tokenService.forgotPasswordPhone(value);

        if (result.hasOwnProperty("error")) {
          res
            .status(400)
            .json({
              error: "Could not generate forgot password token " + result.error,
            });
        } else {
          res.json(result);
        }
      } else {
        res.status(400).json({ error: phone.error });
      }
    } catch (e) {
      console.log(e);

      if (err.name === "MongoError") {
        res.status(503).json({
          error: "Service unavailabe. Please try again.",
        });
      }
    }
  } else {
    res.status(400).json({ error: error.message });
  }

  next();
}

//3. verify otp and returned forgot_token
async function verifyForgotPasswordPhone(req, res, next) {
  try {
    const { error, value } = schema.forgotPasswordVerifyPhoneSchema.validate(
      req.body
    );

    if (!error) {
      let phone = customePhoneValidator(value.phone);
      if (!phone.hasOwnProperty("error")) {
        value.phone = phone;
        let is_verified = await tokenService.verifyForgotPhoneNumber(value);

        if (is_verified.hasOwnProperty("error")) {
          res.status(400).json(is_verified);
        } else {
          res.json(is_verified);
        }
      } else {
        res.status(400).json({ error: phone.error });
      }
    } else {
      res.status(400).json({ error: error.message });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }

  next();
}

//4. verify forgot_token and reset new password
async function resetForgotPasswordPhone(req, res, next) {
  const { error, value } =
    schema.resetForgotPasswordRequestPhoneSchema.validate(req.body);

  if (!error) {
    try {
      var result = await tokenService.resetForgotPasswordPhone(value);

      if (result.hasOwnProperty("error")) {
        res.status(400).json({ error: "Could not change password." });
      } else {
        res.json(result);
      }
    } catch (e) {
      console.log(e);
      if (e.name === "MongoError") {
        res.status(503).json({
          error: "Service unavailabe. Please try again.",
        });
      }
    }
  } else {
    res.status(400).json({ error: error.message });
  }
}

//recheck

async function Logout(req, res) {
  const { error, value } = schema.logoutSchema.validate(req.body);

  if (!error) {
    var result = await tokenService.logout(req.auth.userid, req.body);
    if (!result.hasOwnProperty("error")) {
      res.status(200).json(result);
    } else {
      res.status(400).json({ error: result });
    }
  } else {
    res.status(400).json({ error: error.message });
  }
}
