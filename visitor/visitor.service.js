const client = require("../helpers/mongodb");
const bcrypt = require("bcrypt");
const conf = require("../config.json");
const jwt = require("jsonwebtoken");
const refreshToken = require("../helpers/refresh-token");
const offsetlimit = require("../helpers/offset-limit");
const { ObjectId, Double, Int32 } = require("mongodb");
const errorMsgs = require("../error-msgs.json");
const { error } = require("console");
const moment = require("moment");

async function createVisitor(requestBody, req) {
  try {
    const isAddressExist = await client
      .db("wasl")
      .collection("addresses")
      .findOne({ _id: ObjectId(requestBody.address_id) });

    if (isAddressExist) {
      const isAdminExist = await client
        .db("wasl")
        .collection("admin")
        .findOne({ _id: ObjectId(requestBody.admin_id) });

      if (isAdminExist) {
        const startDate = moment(requestBody.start_day, "DD-MM-YYYY").toDate();
        const endDate = moment(requestBody.end_day, "DD-MM-YYYY").toDate();

        requestBody.start_date = startDate;
        requestBody.end_date = endDate;

        requestBody.is_checked_in = false;
        requestBody.status = "PENDING";
        requestBody.user_id = req.user_id;

        const visitor = await client
          .db("wasl")
          .collection("visitors")
          .insertOne(requestBody);

        if (visitor.insertedId) {
          return {
            visitor_request_id: visitor.insertedId,
            message: "Visitor details has been sent succesfully.",
          };
        } else {
          return {
            error: "Make sure provided information is correct.",
          };
        }
      } else {
        return {
          error: "No such admin exist.",
        };
      }
    } else {
      return {
        error: "No such address exist.",
      };
    }
  } catch (error) {
    return { error: "Unexpected error occured. " + error };
  }
}


async function stats() {
  try {
    const visitorsStats = await client
      .db("wasl")
      .collection("visitors")
      .aggregate([
        {
          '$facet': {
            'isCheckedInTrue': [
              {
                '$match': {
                  'is_checked_in': true
                }
              }, {
                '$group': {
                  '_id': null, 
                  'count': {
                    '$sum': 1
                  }
                }
              }
            ], 
            'statusPending': [
              {
                '$match': {
                  'status': 'PENDING'
                }
              }, {
                '$group': {
                  '_id': null, 
                  'count': {
                    '$sum': 1
                  }
                }
              }
            ]
          }
        }
      ]).toArray();

    if (visitorsStats.length > 0) {
      return visitorsStats;
    } else {
      return [];
    }
  } catch (error) {
    return {
      error: "Unexpected error occured. " + error,
    };
  }
}


async function visitors(userId) {
  try {
    const visitors = await client
      .db("wasl")
      .collection("visitors")
      .aggregate([
         {
          '$addFields': {
            'client_address_id': {
              '$toObjectId': '$address_id'
            }
          }
        }, {
          '$lookup': {
            'from': 'addresses', 
            'localField': 'client_address_id', 
            'foreignField': '_id', 
            'as': 'address_details'
          }
        }, {
          '$unwind': {
            'path': '$address_details', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$project': {
            'address_details.user_id': 0, 
            'client_address_id': 0, 
            'admin_id': 0, 
            'address_id': 0, 
            'user_id': 0
          }
        }, {
          '$sort': {
            '_id': -1
          }
        }
      ]).toArray();

    if (visitors.length > 0) {
      return visitors;
    } else {
      return [];
    }
  } catch (error) {
    return {
      error: "Unexpected error occured. " + error,
    };
  }
}

async function visitorsByStatus(userId, params) {
  try {
    const matchStage = {
      $match: {
        user_id: userId,
      },
    };

    if (params) {
      matchStage["$match"]["status"] = params;
    }

    const visitors = await client
      .db("wasl")
      .collection("visitors")
      .aggregate([
        matchStage,
        {
          '$addFields': {
            'client_address_id': {
              '$toObjectId': '$address_id'
            }
          }
        }, {
          '$lookup': {
            'from': 'addresses', 
            'localField': 'client_address_id', 
            'foreignField': '_id', 
            'as': 'address_details'
          }
        }, {
          '$unwind': {
            'path': '$address_details', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$project': {
            'address_details.user_id': 0, 
            'client_address_id': 0, 
            'admin_id': 0, 
            'address_id': 0, 
            'user_id': 0
          }
        }, {
          '$sort': {
            '_id': -1
          }
        }
      ])
      .sort({ _id: -1 })
      .toArray();

    if (visitors.length > 0) {
      return visitors;
    } else {
      return [];
    }
  } catch (error) {
    return {
      error: "Unexpected error occurred. " + error,
    };
  }
}


async function updateVisitorStatus(bodyValue, req) {
  try {
    const now = new Date();
    const isAdmin = await client
      .db("wasl")
      .collection("admin")
      .findOne({ _id: ObjectId(req.user_id) });
    if (isAdmin?.active) {
      const requetsId = ObjectId(req.params.visitorId);

      const request = await client
        .db("wasl")
        .collection("visitors")
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
        return{
          message : "Status has been updated.",
          request_id : requetsId
        } 
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

async function isCheckedIn(bodyValue, req) {
  try {
    const now = new Date();
    const isAdmin = await client
      .db("wasl")
      .collection("admin")
      .findOne({ _id: ObjectId(req.user_id) });
    if (isAdmin?.active) {
      const requetsId = ObjectId(req.params.visitorId);

      const request = await client
        .db("wasl")
        .collection("visitors")
        .findOneAndUpdate(
          {
            _id: requetsId,
          },
          {
            $set: {
              is_checked_in: bodyValue.is_checked_in,
              updated_at: new Date(now),
            },
          },
          {
            returnDocument: "after",
          }
        );

      if (request) {
        return{
          message : "Status has been updated.",
          request_id : requetsId
        } 
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

module.exports = {
  createVisitor,
  visitors,
  visitorsByStatus,
  updateVisitorStatus,
  isCheckedIn,
  stats
};
