const express = require("express");
const router = express.Router();
const userService = require("./user.service");
const schema = require("./user.schemas");
const errorMsgs = require("../error-msgs.json");
const verify = require("../helpers/verify");

// routes
router.post("/", verify, createUser); //required

router.get("/", verify, allUsers); //required
router.get("/stats", verify, stats); 
router.get("/:userid", verify, userDetails); //required
router.delete("/:userid", verify, removeUser); //required
router.put("/:userid", verify, updateUser); //required

router.put("/password/reset/:id", verify, resetPassword);



async function resetPassword(req, res,next) {
  try {
    const { error, value } = schema.resetPasswordRequestSchema.validate(
      req.body
    );

    if (!error) {
      try {
        var result = await userService.resetPassword(req.params.id, value);

        if (!result.hasOwnProperty("error")) {
          res.json(result);
        } else {
          res.status(400).json({ error: "Could not change password." });
        }
      } catch (e) {
        console.log(e);

        if (err.name === "MongoError") {
          res.status(503).json({
            error: "Service unavailabe. Please try again.",
          });
        }
        res.status(400).json({ error: "Could not change password." });
      }
    } else {
      if (error.stack.includes("phone")) {
        res.status(400).json({ error: "phone number validation failed." });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  } catch (e) {
    res.status(400).json({ error: "Could not change password." });
  }
  next;
}
async function createUser(req, res, next) {
  try {
    const { error, value } = schema.userSchema.validate(req.body);
    if (!error) {
      let usr = await userService.register(value, req.user_id);

      if (usr.hasOwnProperty("error")) {
        res.status(400).json(usr);
      } else {
        res.json(usr);
      }
    } else {
      res.status(400).json({ error: error.details[0]["message"] });
    }
  } catch (error) {
    res.status(400).json({ error: errorMsgs.default });
  }

  next();
}

async function userDetails(req, res) {
    let result = await userService.userDetails(req.params.userid);

    if (result.hasOwnProperty("error")) {
      res.status(400).json(result);
    } else {
      res.status(200).json(result);
    }
}

async function updateUser(req, res) {
console.log("req.body", req.body);
    const { error, value } = schema.updateUserSchema.validate(req.body);

    if (!error) {
      let result = await userService.updateExistingUser(
        value,
        req.params.userid 
      );
      if (result.hasOwnProperty("error")) {
        res.status(400).json(result);
      } else {
        res.status(200).json(result);
      }
    } else {
      res.status(400).json({ error: error.message });
    }
 
}

async function removeUser(req, res) {
  let usr = await userService.removeUser(req.params.userid);

  if (usr.hasOwnProperty("error")) {
    res.status(400).json(usr);
  } else {
    res.json(usr);
  }
}

async function allUsers(req, res) {
  let result = await userService.allUsers();

  if (result.hasOwnProperty("error")) {
    res.status(400).json(result);
  } else {
    res.status(200).json(result);
  }
}

async function stats(req, res) {
  let result = await userService.usersStats();

  if (result.hasOwnProperty("error")) {
    res.status(400).json(result);
  } else {
    res.status(200).json(result);
  }
}



module.exports = router;