const client = require('../helpers/mongodb');
const bcrypt = require('bcrypt');
const conf = require('../config.json');
const jwt = require('jsonwebtoken');
const refreshToken = require('../helpers/refresh-token')
const offsetlimit = require('../helpers/offset-limit');
const { ObjectId, Double, Int32 } = require('mongodb');
const errorMsgs = require('../error-msgs.json');
const { error } = require('console');

async function addProperty(value) {
    try {

        let obj = {
            type :  value.type,
            location : value.location,
            project : value.project,
            bedrooms : parseInt(value.bedrooms),
            rent : parseFloat(value.rent),
            size : parseFloat(value.size),
            avalible : true
        }
        const result = await client.db("wasl").collection("property").insertOne(obj);

        if (result.insertedId) {

            return {
                message : "added",
                property_id : result.insertedId
            };

        } else {
            return {
                error: "Property not added",
            };
        }
    } catch (error) {
        return {
            error: "Unexpected error occured. " + error,
        };
    }
}

async function allProperties() {
    try {
        const properties = await client.db("wasl").collection("property").find().sort({ _id: -1 }).toArray();

        if (properties.length > 0) {
            return properties;
        } else {
            return [];
        }
    } catch (error) {
        return {
            error: "Unexpected error occured. " + error,
        };
    }
}

async function count() {
    try {
        const details = await client.db("wasl").collection("property").aggregate(
            [
                {
                  '$group': {
                    '_id': 'null', 
                    'total_properties': {
                      '$sum': 1
                    }, 
                    'avalible_properties': {
                      '$sum': {
                        '$cond': [
                          {
                            '$eq': [
                              '$avalible', true
                            ]
                          }, 1, 0
                        ]
                      }
                    }, 
                    'rented': {
                      '$sum': {
                        '$cond': [
                          {
                            '$eq': [
                              '$avalible', false
                            ]
                          }, 1, 0
                        ]
                      }
                    }
                  }
                }, {
                  '$project': {
                    '_id': 0, 
                    'total_properties': 1, 
                    'avalible_properties': 1, 
                    'rented': 1
                  }
                }
              ]
        ).toArray();

        if (details.length > 0) {
            return details[0];
        } else {
            return [];
        }
    } catch (error) {
        return {
            error: "Unexpected error occured. " + error,
        };
    }
}

async function propertyDetails(propertyid) {
    try {
        const propertyId = ObjectId(propertyid);

        const property = await client.db("wasl").collection("property").findOne({
            _id: propertyId
        }, {
            projection: {
                user_id: 0
            }
        });

        if (property) {
            return property;
        } else {
            return {
                error: "No such property exists with this Id.",
            };
        }
    } catch (error) {
        return {
            error: "Unexpected error occured. " + error,
        };
    }
}

async function updateExistingProperty(bodyValue, req) {
    try {
        const propertyId = ObjectId(req.params.propertyId);

        const updateQuery = {
            type: bodyValue.type,
            location: bodyValue.location,
            project: bodyValue.project,
            bedrooms: bodyValue.bedrooms,
            rent: bodyValue.rent,
            size: bodyValue.size,
        };

        const property = await client.db("wasl").collection("property").findOneAndUpdate({
            _id: propertyId
        }, {
            $set: updateQuery,
        }, {
            returnDocument: "after"
        });

        if (property) {

            return property.value;

        } else {
            return {
                error: "Property not updated",
            };
        }
    } catch (error) {
        return { error: "Unexpected error occured. " + error };
    }
}

async function removeProperty(Id) {
    try {
        const propertyId = ObjectId(Id);
            let removeProperty = await client.db('wasl').collection('property').deleteOne(
                {
                    _id : propertyId,
                },
            );
            if (removeProperty.deletedCount > 0) {

                return {
                    message: 'Your property has been deleted successfully.'
                };

            }else{
                return {
                    message: 'No such property exist. '
                };
            }

    } catch (error) {
        return { error: "Unexpected error occured. " + error };
    }
}

module.exports = {
    addProperty,
    allProperties,
    count,
    propertyDetails,
    updateExistingProperty,
    removeProperty
};