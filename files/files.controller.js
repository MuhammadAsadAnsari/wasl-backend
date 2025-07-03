const express = require("express");
const router = express.Router();
const fileupload = require("../helpers/file-upload");
const filevalidator = require("../helpers/file-validator");
const configuration = require("../config.json");
const verify = require("../helpers/verify");
const { max } = require("lodash");

router.post(
  "/upload/image",
  fileupload.fields([{ name: "images", maxCount: 4 }]),
  SaveImages
);
router.post(
  "/upload/invoice",
  fileupload.fields([{ name: "invoice", maxCount: 1 }]),
  SaveInvoice
);
router.post(
  "/upload/video",
  fileupload.fields([{ name: "videos", maxCount: 4 }]),
  SaveVideo
);

async function SaveImages(req, res) {
  console.log("🚀 ~ SaveImages ~ req:", req)
  const { err, files } = filevalidator(req);
  if (!err) {
    let result = await FilesUrl(files);
    if (result.status == 400) {
      res.status(400).json(result);
    } else {
      res.status(200).json(result);
    }
  } else {
    res.status(400).json({ error: err });
  }
}

async function SaveVideo(req, res) {
  const { err, files } = filevalidator(req);
  if (!err) {
    let result = await FilesUrl(files);
    if (result.status == 400) {
      res.status(400).json(result);
    } else {
      res.status(200).json(result);
    }
  } else {
    res.status(400).json({ error: err });
  }
}
async function SaveInvoice(req, res) {
  const { err, files } = filevalidator(req);
  if (!err) {
    let result = await FilesUrl(files);
    console.log(result);
    if (result.status == 400) {
      res.status(400).json(result);
    } else {
      res.status(200).json(result);
    }
  } else {
    res.status(400).json({ error: err });
  }
}

function FilesUrl(files) {
  try {
    var filesUrl = [];
    for (var i = 0; i < files.length; i++) {
      // path = "http://" + configuration.host_name + ":" + configuration.port + "/" + String(files[i].path)
      path = String(files[i].path).replace("\\", "/");
      filesUrl.push(path);
    }
    if (files[0].fieldname === "images") {
      var responseFinal = new Object({
        status: 200,
        images: filesUrl,
      });
      return responseFinal;
    } else if (files[0].fieldname === "invoice") {
      var responseFinal = new Object({
        status: 200,
        invoice: filesUrl,
      });
      return responseFinal;
    } else if (files[0].fieldname === "videos") {
      var responseFinal = new Object({
        status: 200,
        videos: filesUrl,
      });
      return responseFinal;
    } else {
      var responseFinal = new Object({
        status: 400,
        message: "Invalid filename",
      });
      return responseFinal;
    }
  } catch (ex) {
    console.log(ex.message);
    var responseFinal = new Object({
      status: 400,
      message: "Error occured while uploading images/invoice.",
    });

    return responseFinal;
  }
}
module.exports = router;
