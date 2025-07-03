const multer = require("multer")
const fs = require("fs");
const path = require('path');
const { v4: uuidv4 } = require('uuid');
function create(req, fieldname) {
        if (fieldname === "images") {
                fs.mkdirSync("uploads/" + req.body.uuid, { recursive: true }, function (err) {
                        if (err) {
                                console.log(err)
                                return err;
                        } else {
                                console.log("New directory successfully created.")
                                return "true";
                        }
                })
        }
        else if (fieldname === "invoice") {
                fs.mkdirSync("uploads/" + req.body.uuid, { recursive: true }, function (err) {
                        if (err) {
                                console.log(err)
                                return err;
                        } else {
                                console.log("New directory successfully created.")
                                return "true";
                        }
                })
        }
}
var storage = multer.diskStorage({
        destination: function (req, file, cb) {
                req.body.uuid = uuidv4();
                if (file.fieldname === "images") {
                        if (req.files.images.length <= 4) {
                              //  create(req, file.fieldname);
                                cb(null, "uploads/")

                        }
                }
                else if (file.fieldname === "invoice") {
                        if (req.files.invoice.length <= 4) {
                               // create(req, file.fieldname);
                                cb(null, 'uploads/' )
                        }

                }
                else if (file.fieldname === "videos") {
                        if (req.files.videos.length <= 4) {
                               // create(req, file.fieldname);
                                cb(null, 'uploads/' )
                        }
                }

        },
        filename: function (req, file, cb) {
                if (file.fieldname === "images") {
                        if (req.files.images.length <= 4) {
                                cb(null,  req.body.uuid+ '_' +file.originalname)
                        }
                }
                else if (file.fieldname === "invoice") {
                        if (req.files.invoice.length <= 4) {
                                cb(null,  req.body.uuid + '_' +file.originalname)
                        }
                }
                else if (file.fieldname === "videos") {
                        if (req.files.videos.length <= 4) {

                                cb(null,  req.body.uuid + '_' +file.originalname)
                        }
                }
        }

})
var upload = multer({ storage: storage })
module.exports = upload;