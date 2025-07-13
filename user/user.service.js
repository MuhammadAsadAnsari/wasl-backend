const client = require("../helpers/mongodb");
const offsetlimit = require("../helpers/offset-limit");
const { ObjectId, Double, Int32 } = require("mongodb");
const config = require("../config.json");
const generateRandomPass = require("../helpers/random-pass");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const now = new Date();

module.exports = {
  register,
  removeUser,
  updateExistingUser,
  userDetails,
  allUsers,
  usersStats,
  resetPassword,
};

async function register(req, id) {
  try {
    if (id != null) {
      var admin_exist = await client
        .db("wasl")
        .collection("admin")
        .findOne({ _id: ObjectId(id) });

      if (admin_exist) {
        var exists = await client
          .db("wasl")
          .collection("users")
          .findOne({
            $or: [
              { "contact_info.email": req.contact_info.email.toLowerCase() },
              { "personal_info.name": req.personal_info.name.toLowerCase() },
            ],
          });

        if (!exists) {
          var result = await client
            .db("wasl")
            .collection("users")
            .insertOne({
              created_by: id,
              created_at: now,
              personal_info: {
                name: req.personal_info.name,
                emirtates_id: req.personal_info.emirtates_id,
                passport_no: req.personal_info.passport_no,
                passport_expiry: req.personal_info.passport_expiry,
                residence_visa: req.personal_info.residence_visa,
                visa_expiry: req.personal_info.visa_expiry,
                nationality: req.personal_info.nationality,
              },
              preferences: {
                preferred_language: req.preferences.preferred_language,
                contact_mode: req.preferences.contact_mode,
              },
              contact_info: {
                primary_address: req.contact_info.primary_address,
                secondary_address: req.contact_info.secondary_address,
                city: req.contact_info.city,
                po_box: req.contact_info.po_box,
                mobile_no: req.contact_info.mobile_no,
                email: req.contact_info.email,
                home_ph_no: req.contact_info.home_ph_no,
                office_ph_no: req.contact_info.office_ph_no,
                fax: req.contact_info.fax,
                attendent_no: req.contact_info.attendent_no,
                attendent_name: req.contact_info.attendent_name,
              },
              app_settings: {
                password: generateRandomPass(10),
                active: true,
              },
            });

          if (result.insertedId) {
            var address = await client
              .db("wasl")
              .collection("addresses")
              .insertOne({
                floor: req.residence_info.floor,
                flat_no: req.residence_info.flat_no,
                building_name: req.residence_info.building_name,
                user_id: result.insertedId.toString(),
              });

            if (address.insertedId) {
              return {
                message: "User has been created successfully.",
                userId: result.insertedId,
              };
            } else {
              return {
                message:
                  "User has been created successfully please add address.",
                userId: result.insertedId,
              };
            }
          } else {
            return {
              error: "Could not register user.",
            };
          }
        } else {
          return {
            error: "Cannot register user. User already exists.",
          };
        }
      } else {
        return {
          error: "You are not authorized to register.",
        };
      }
    } else {
      return {
        error: "You are not authorized to register.",
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

async function allUsers() {
  try {
    const users = await client
      .db("wasl")
      .collection("users")
      .find({"personal_info.role":"serviceProvider"})
      .sort({ _id: -1 })
      .toArray();

    if (users.length > 0) {
      return users;
    } else {
      return [];
    }
  } catch (error) {
    return {
      error: "Unexpected error occured. " + error,
    };
  }
}

async function userDetails(userid) {
  try {
    const userId = ObjectId(userid);

    const user = await client
      .db("wasl")
      .collection("users")
      .findOne(
        {
          _id: userId,
        },
        {
          projection: {
            app_settings: 0,
          },
        }
      );

    if (user) {
      return user;
    } else {
      return {
        error: "No such user exists with this Id.",
      };
    }
  } catch (error) {
    return {
      error: "Unexpected error occured. " + error,
    };
  }
}

async function updateExistingUser(values, id) {
  try {
    const userId = ObjectId(id);

    const user = await client.db("wasl").collection("users").findOne({
      _id: userId,
    });

    if (user) {
      user.personal_info.address = values.personal_info.address;
      user.personal_info.name = values.personal_info.name;
      user.personal_info.phoneNumber = values.personal_info.phoneNumber;
      user.personal_info.email = values.personal_info.email;

      user.personal_info.image =
        values?.personal_info?.image?.split("uploads/")[1] ||
        user?.personal_info?.image;

      const property = await client
        .db("wasl")
        .collection("users")
        .findOneAndUpdate(
          {
            _id: userId,
          },
          {
            $set: user,
          },
          {
            returnDocument: "after",
          }
        );

      if (property) {
        return { user: property.value, status: "success" };
      } else {
        return {
          error: "User not updated",
        };
      }
    }
  } catch (error) {
    return { error: "Unexpected error occured. " + error };
  }
}

async function removeUser(Id) {
  try {
    const userId = ObjectId(Id);
    let removeUser = await client.db("wasl").collection("users").deleteOne({
      _id: userId,
    });
    if (removeUser.deletedCount > 0) {
      return {
        message: "Your User has been deleted successfully.",
      };
    } else {
      return {
        message: "No such User exist. ",
      };
    }
  } catch (error) {
    return { error: "Unexpected error occured. " + error };
  }
}

async function usersStats() {
  try {
    const userStats = await client
      .db("wasl")
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: "app_settings.active",
            all_users: {
              $sum: 1,
            },
            active_users: {
              $sum: {
                $cond: {
                  if: "$app_settings.active",
                  then: 1,
                  else: 0,
                },
              },
            },
            block_users: {
              $sum: {
                $cond: {
                  if: "$app_settings.active",
                  then: 0,
                  else: 1,
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ])
      .toArray();

    if (userStats.length > 0) {
      return userStats;
    } else {
      return [];
    }
  } catch (error) {
    return {
      error: "Unexpected error occured. " + error,
    };
  }
}
async function resetPassword(userid, value) {
  console.log("🚀 ~ resetPassword ~ userid:", userid);
  try {
    let doc = await client
      .db("wasl")
      .collection("users")
      .findOne({ _id: ObjectId(userid) });

    const comparePassword = await bcrypt.compare(
      value.old_password,
      doc.app_settings.password
    );
    if (value.new_password == value.confirm_password) {
      if (doc && comparePassword) {
        let result = await client
          .db("wasl")
          .collection("users")
          .updateOne(
            {
              _id: ObjectId(userid),
            },
            {
              $set: {
                app_settings: {
                  password: await bcrypt.hash(
                    value.new_password,
                    await bcrypt.genSalt(10)
                  ),
                },
              },
            }
          );

        console.log("result", result, result.modifiedCount, doc._id);
        const token = jwt.sign(
          {
            userid: doc._id,
          },
          config.secret
        );
        console.log("🚀 ~ resetPassword ~ token:", token);
        if (result.modifiedCount == 1) {
          return {
            status: "success",
            message:
              "Your password has been changed successfully. Please login with your new credentials.",

            data: {
              user: {
                _id: doc?._id,
                address: doc?.personal_info.address || "",
                name: doc?.personal_info?.name || "",
                email: doc?.personal_info?.email || "",
                image: doc?.personal_info?.image || "default.png",
                phoneNumber: doc?.personal_info?.phoneNumber || "",
                role: doc?.personal_info?.role || "user",
              },
            },
            token,
          };
        }
      } else {
        return {
          error: "Could not change abc.",
        };
      }
    } else {
      return {
        error: "Password missmatch",
      };
    }
  } catch (e) {
    return {
      error: "Could not change password.",
    };
  }
}
