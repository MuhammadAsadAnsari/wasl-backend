const client = require('../helpers/mongodb');
const { ObjectId, Double, Int32 } = require('mongodb');
const config = require("../config.json")


module.exports = {
  getCategories,
  getSubCategoriesByCategoryId,
  createCategory,
  createSubCategory,
  getAllSubCategories
};

// verified this is working
async function getCategories() {
  try {
    const categories = await client
      .db("wasl")
      .collection("categories")
      .aggregate([
        {
          $match: {
            publish: true,
          },
        },
        {
          $lookup: {
            from: "sub_categories", // the collection to join with
            localField: "_id", // field from the categories collection
            foreignField: "category_id", // field from the subcategories collection
            as: "sub_categories", // name of the joined array field
          },
        },
        {
          $match: {
            "sub_categories.0": { $exists: true }, // Ensures sub_categories array is not empty
          },
        },
        {
          $project: {
            publish: 0,
          },
        },
      ])
      .toArray();
    
    if (categories.length > 0) {

      return {
        categories: categories
      };

    } else {
      return {
        categories: []
      };

    }
  } catch (e) {
    console.log(e);
    return { error: "No categories exist" }
  }


}
async function getAllSubCategories() {
  try {
    var subCategories = await client.db('wasl').collection('sub_categories').aggregate([
      {
        '$addFields': {
          'category': {
            '$toObjectId': '$category_id'
          }
        }
      }, {
        '$lookup': {
          'from': 'categories', 
          'localField': 'category', 
          'foreignField': '_id', 
          'as': 'category_details'
        }
      }, {
        '$unwind': {
          'path': '$category_details', 
          'preserveNullAndEmptyArrays': true
        }
      }
    ]).toArray();

    if (subCategories.length > 0) {

      return {
        sub_categories: subCategories
      };

    } else {
      return {
        sub_categories: []
      };

    }
  } catch (e) {
    console.log(e);
    return { error: "No categories exist" }
  }


}

// verified it is working
async function createCategory(values) {
  try {

    const checkAlreadyExist = await client.db("wasl").collection("categories").findOne({
      name: values.name
    });

    if (checkAlreadyExist) {

      return {
        message: "Already Exists."
      }
    }
    var category = await client.db('wasl').collection('categories').insertOne(
      {
        name: values.name,
        publish: true
      }
    );

    if (category.insertedId) {

      return {
        category_id : category.insertedId,
        category_name : values.name,
        message: "Category has been created."
      };

    } else {
      return {
        error: "Something went wrong."
      };

    }
  } catch (e) {
    console.log(e);
    return { error: "No categories exist" }
  }

}

// verified it is working
async function createSubCategory(category_id, values) {
  try {

    const checkAlreadyExist = await client.db("wasl").collection("sub_categories").findOne({
      category_id : category_id,
      name: values.name
    });

    if (checkAlreadyExist) {
      return {
        message: "Already Exists."
      }
    }

    const checkCategory = await client.db("wasl").collection("categories").findOne({

      _id: ObjectId(category_id),
      publish : true
    });

    if (checkCategory == null) {

      return {
        message: "No Such Category exist."
      }
    }

    var sub_category = await client.db('wasl').collection('sub_categories').insertOne(
      {
        name: values.name,
        category_id: (category_id),
        publish: true
      }
    );ObjectId

    if (sub_category.insertedId) {

      return {
        category_id : category_id,
        sub_category_id : sub_category.insertedId,
        sub_category_name : values.name,
        message: "sub category has been added succesfully."
      };

    } else {
      return {
        error: "Something went wrong."
      };

    }
  } catch (e) {
    console.log(e);
    return { error: "No categories exist" }
  }

}

// verified it is working
async function getSubCategoriesByCategoryId(categoryId) {
  try {

    var subCategories = await client.db('wasl').collection('sub_categories').find({
      category_id : categoryId,
      publish : true
    },{projection : {publish : 0}}).toArray();

    if (subCategories.length > 0) {

      return {
        sub_categories: subCategories
      };

    } else {
      return {
        sub_categories: []
      };
    }
  } catch (e) {
    console.log(e);
    return { error: "No sub categories exist" }
  }

}


