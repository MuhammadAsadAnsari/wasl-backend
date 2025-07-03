const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const schema = require("./visitor.schemas");
const verify = require("../helpers/verify");
const conf = require("../config.json");
const errorMsgs = require("../error-msgs.json");
const { error } = require("jquery");
const visitorService = require("./visitor.service");
// routes

router.put('/:visitorId',verify, updateStatus);
router.put('/:visitorId/checkedin',verify, checkedIn);
router.get("/", verify, getVisitors);
router.get("/stats", verify, getVisitorsStats);
router.post("/", verify, newVisitor);
router.get("/:status", verify, getUserVisitorsByStatus);
module.exports = router;


async function getVisitors(req, res) {
  let result = await visitorService.visitors(req.user_id);

  if (result.hasOwnProperty("error")) {
    res.status(400).json(result);
  } else {
    res.status(200).json(result);
  }
}

async function getVisitorsStats(req, res) {
  let result = await visitorService.stats();

  if (result.hasOwnProperty("error")) {
    res.status(400).json(result);
  } else {
    res.status(200).json(result);
  }
}

async function getUserVisitorsByStatus(req, res) {
    let result = await visitorService.visitorsByStatus(req.user_id,req.params.status);
  
    if (result.hasOwnProperty("error")) {
      res.status(400).json(result);
    } else {
      res.status(200).json(result);
    }
  }


  async function updateStatus(req, res) {
    const { error, value } = schema.paramsSchema.validate(req.params.visitorId);

    if (!error) {
        const { error, value } = schema.updateStatusSchema.validate(req.body);

        if (!error) {

            let result = await visitorService.updateVisitorStatus(value, req);
            if (result.hasOwnProperty("error")) {
                res.status(400).json(result);
            } else {
                res.status(200).json(result);
            }
        } else {
            res.status(400).json({ error: error.message });
        }
    } else {
        res.status(400).json({ error: error.message });
    }
}

async function checkedIn(req, res) {
  const { error, value } = schema.paramsSchema.validate(req.params.visitorId);

  if (!error) {
      const { error, value } = schema.updateCheckedInSchema.validate(req.body);

      if (!error) {

          let result = await visitorService.isCheckedIn(value, req);
          if (result.hasOwnProperty("error")) {
              res.status(400).json(result);
          } else {
              res.status(200).json(result);
          }
      } else {
          res.status(400).json({ error: error.message });
      } 
  } else {
      res.status(400).json({ error: error.message });
  }
}

async function newVisitor(req, res) {
  const { error, value } = schema.addVisitorSchema.validate(req.body);
  if (!error) {
    let result = await visitorService.createVisitor(value, req);

    if (result.hasOwnProperty("error")) {
      res.status(400).json(result);
    } else {
      res.status(200).json(result);
    }
  } else {
    res.status(400).json({ error: error.message });
  }
}
