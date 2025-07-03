const fs = require("fs");
const path = require('path');

const imageValidation=["image/png","image/jpg","image/jpeg", "image/tiff", "image/jfif","image/gif","image/bmp","image/webp","image/avif","image/svg+xml"]
const invoiceValidation=[ "text/plain","application/pdf","image/png","image/jpg","image/jpeg", "image/tiff","image/gif","image/bmp","image/webp","image/avif","image/svg+xml"]
const videoValidation=["video/mp4","video/flv","video/mpeg","video/mkv","video/webm","video/mov"]
function FileValidator(req) {
  if (typeof req.files.images !== "undefined") {
    if (req.files.images.length > 4) {
      return {
        err: "You have entered more than four images. Top four images have been saved.",
      };
    }
    var Images = [];
    for (let i = 0; i <= req.files.images.length - 1; i++) {
      if (imageValidation.includes(req.files.images[i].mimetype)) {
        Images.push(req.files.images[i]);
      } else {
        return {
          err: "Invalid file type.",
        };
      }
    }
    return {
      files: Images,
    };
  } else if (typeof req.files.pdf !== "undefined") {
    var pdf = [];
    for (let i = 0; i <= req.files.pdf.length - 1; i++) {
      if (invoiceValidation.includes(req.files.pdf[i].mimetype)) {
        pdf.push(req.files.pdf[i]);
      } else {
        return {
          err: "Invalid file type.",
        };
      }
    }
    return {
      files: pdf,
    };
  } else if (typeof req.files.videos !== "undefined") {
    var Videos = [];
    for (let i = 0; i <= req.files.videos.length - 1; i++) {
      if (videoValidation.includes(req.files.videos[i].mimetype)) {
        Videos.push(req.files.videos[i]);
      } else {
        return {
          err: "Invalid file type.",
        };
      }
    }
    return {
      files: Videos,
    };
  } else {
    return {
      err: "Files not selected or invalid file type.",
    };
  }
}
module.exports = FileValidator
