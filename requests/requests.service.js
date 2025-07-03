const client = require("../helpers/mongodb");
const bcrypt = require("bcrypt");
const conf = require("../config.json");
const jwt = require("jsonwebtoken");
const refreshToken = require("../helpers/refresh-token");
const offsetlimit = require("../helpers/offset-limit");
const { ObjectId, Double, Int32 } = require("mongodb");
const errorMsgs = require("../error-msgs.json");
const { error } = require("console");
const now = new Date();
const notification = require("../notifications/notifications.service");

async function getAllRequestsOfUser(req) {
  try {
    var page = req.query.page || 1;
    console.log("🚀 ~ allRequests ~ page:", page);
    var limit = req.query.limit * 1;
    console.log("🚀 ~ allRequests ~ limit:", limit);
    const skip = (page - 1) * limit;
    console.log("🚀 ~ allRequests ~ skip:", skip);

    console.log("request", req.auth);
    const requests = await client
      .db("wasl")
      .collection("requests")
      .aggregate([
        {
          $match: {
            user_id: new ObjectId(req.auth?.userid),
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user_details",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $lookup: {
            from: "sub_categories",
            localField: "sub_category",
            foreignField: "_id",
            as: "sub_category",
          },
        },
        {
          $unwind: {
            path: "$sub_category",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$user_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            "category.publish": 0,
            "sub_category.publish": 0,
            "sub_category.category_id": 0,
            "user_details.app_settings": 0,
            "user_details.created_at": 0,
            "user_details.created_by": 0,
            "address_details.user_id": 0,
          },
        },
        { $sort: { updated_at: -1 } },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            totalRecords: [{ $count: "count" }],
          },
        },
      ])
      .toArray();

    const result = requests[0] || {};
    const totalRecords = result.totalRecords[0]?.count || 0;

    return {
      data: result.data,
      totalRecords,
    };
  } catch (error) {
    return {
      error: "Unexpected error occured. " + error,
    };
  }
}

async function allRequests() {
  try {
    console.log("admin routes.");
    const requests = await client
      .db("wasl")
      .collection("requests")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user_details",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category_details",
          },
        },
        {
          $lookup: {
            from: "sub_categories",
            localField: "sub_category",
            foreignField: "_id",
            as: "sub_category_details",
          },
        },

        {
          $unwind: {
            path: "$sub_category_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$category_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$user_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            "category_details.publish": 0,
            "sub_category_details.publish": 0,
            "sub_category_details.category_id": 0,
          },
        },
      ])
      .sort({ _id: -1 })
      .toArray();

    if (requests.length > 0) {
      return requests;
    } else {
      return [];
    }
  } catch (error) {
    return {
      error: "Unexpected error occured. " + error,
    };
  }
}

async function requestStats(req) {
  try {
    var { offset, limit } = await offsetlimit(
      req.query.offset,
      req.query.limit
    );

    const requests = await client
      .db("wasl")
      .collection("requests")
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ])
      .toArray();

    if (requests.length > 0) {
      const formattedResult = {};
      requests.forEach((item) => {
        const status = item._id.toLowerCase();
        const count = item.count;
        formattedResult[status] = count;
      });
      return formattedResult;
    } else {
      return [];
    }
  } catch (error) {
    return {
      error: "Unexpected error occured. " + error,
    };
  }
}

async function updateRequestStatus(bodyValue, req) {
  try {
    const now = new Date();
    const isAdmin = await client
      .db("wasl")
      .collection("admin")
      .findOne({ _id: ObjectId(req.user_id) });
      console.log("isAdmin?.active", isAdmin?.active);
    if (isAdmin?.active) {
      const requetsId = ObjectId(req.params.requestId);

      const request = await client
        .db("wasl")
        .collection("requests")
        .findOneAndUpdate(
          {
            _id: requetsId,
          },
          {
            $set: {
              status: bodyValue.status,
              updated_at: new Date(now),
            },
          },
          {
            returnDocument: "after",
          }
        );

      if (request) {
        await notification.sendNotification(
          "Service Request",
          `${isAdmin.full_name} Updated your request.`,
          "REQUEST",
          "REQUEST_UPDATE",
          request.value.user_id,
          request.value._id.toString()
        );

        return {
          message: "Status has been updated.",
          request_id: requetsId,
        };
      } else {
        return {
          error: "Status not updated",
        };
      }
    } else {
      return {
        error: "You are not allowed to update request.",
      };
    }
  } catch (error) {
    return { error: "Unexpected error occured. " + error };
  }
}

async function newRequest(requestBody, req) {
  try {
    const isUser = await client
      .db("wasl")
      .collection("users")
      .findOne({ _id: ObjectId(req.auth?.userid) });
    console.log("req.category", requestBody.category, requestBody.sub_category);

    if (isUser.app_settings.active) {
      requestBody.user_id = new ObjectId(req.auth?.userid);
      requestBody.status = "PENDING";
      requestBody.updated_at = now;
      requestBody.category = new ObjectId(requestBody.category);
      requestBody.sub_category = new ObjectId(requestBody.sub_category);
      requestBody.email = isUser.email;

      console.log("Requestbody", requestBody);
      const request = await client
        .db("wasl")
        .collection("requests")
        .insertOne(requestBody);

      if (request.insertedId) {
        return {
          request_id: request.insertedId,
          message: "request has been sent succesfully.",
        };
      } else {
        return {
          error: "request not updated",
        };
      }
    } else {
      return {
        error: "You are not allowed to create request.",
      };
    }
  } catch (error) {
    return { error: "Unexpected error occured. " + error };
  }
}

async function deleteRequest(request) {
  const id = request.params.requestId;
  const userId = request.auth.userid;
  try {
    const request = await client
      .db("wasl")
      .collection("requests")
      .findOneAndDelete({
        _id: new ObjectId(id),
        user_id: new ObjectId(userId),
      });

    return { request };
  } catch (error) {
    return { error: "Unexpected error occurs. " + error };
  }
}



module.exports = {
  getAllRequestsOfUser,
  updateRequestStatus,
  newRequest,
  deleteRequest,
  requestStats,
  
  allRequests,
};
