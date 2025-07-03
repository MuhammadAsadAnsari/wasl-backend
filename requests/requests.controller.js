const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const schema = require("./requests.schemas");
const verify = require("../helpers/verify");
const conf = require("../config.json");
const errorMsgs = require("../error-msgs.json");
const { error } = require("jquery");
const requestsService = require("./requests.service");
// routes


router.delete("/:requestId", verify, deleteRequest); //


router.get("/user", verify, getAllRequestsOfUser);
router.post("/", verify, createRequest);





//admin
router.put("/:requestId", verify, updateRequest);
router.get("/stats", verify, getAllRequestStats);
router.get("/", verify, getAllRequests);


module.exports = router;

async function getAllRequestsOfUser(req, res) {
  let result = await requestsService.getAllRequestsOfUser(req);

  if (result.hasOwnProperty("error")) {
    res.status(400).json(result);
  } else {
    res.status(200).json(result);
  }
}

async function getAllRequestStats(req, res) {
  let result = await requestsService.requestStats(req);

  if (result.hasOwnProperty("error")) {
    res.status(400).json(result);
  } else {
    res.status(200).json(result);
  }
}

async function updateRequest(req, res) {
  const { error, value } = schema.paramsSchema.validate(req.params.requestId);

  if (!error) {
    const { error, value } = schema.updateStatusSchema.validate(req.body);

    if (!error) {
      let result = await requestsService.updateRequestStatus(value, req);
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

async function getAllRequests(req, res) {
  let result = await requestsService.allRequests();

  if (result.hasOwnProperty("error")) {
    res.status(400).json(result);
  } else {
    res.status(200).json(result);
  }
}

async function createRequest(req, res) {
  const { error, value } = schema.addRequestSchema.validate(req.body);
  if (!error) {
    let result = await requestsService.newRequest(value, req);

    if (result.hasOwnProperty("error")) {
      res.status(400).json(result);
    } else {
      res.status(200).json(result);
    }
  } else {
    res.status(400).json({ error: error.message });
  }
}

async function deleteRequest(req, res) {
  const { error, value } = schema.paramsSchema.validate(req.params.requestId);

  if (!error) {
    let result = await requestsService.deleteRequest(req);
    if (result.hasOwnProperty("error")) {
      res.status(400).json(result);
    } else {
      res.status(200).json(result);
    }
  } else {
    res.status(400).json({ error: error.message });
  }
}


