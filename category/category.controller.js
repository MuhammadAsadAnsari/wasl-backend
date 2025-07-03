const express = require('express');
const router = express.Router();
const categoryService = require('./category.service');
var url = require('url');
const verify = require('../helpers/verify');

const schema = require('./category.schemas');

// routes
router.get('/', verify, getCategories);
router.get('/sub', verify, getAllSubCategories);
router.post('/', verify, createCategories);
router.post('/:id/sub-categories', verify, createSubCategory);
router.get('/:id/sub-categories', verify, getSubCategories);


module.exports = router;

async function getCategories(req, res, next) {

    var categories = await categoryService.getCategories();

    if (!categories.hasOwnProperty('error')) {
        console.log(categories);
        res.status(200).json(categories);
    }
    else {

        res.status(400).json({ error: 'No categories exists' });
    }
    next();
}

async function getAllSubCategories(req, res, next) {

    var subCategories = await categoryService.getAllSubCategories();

    if (!subCategories.hasOwnProperty('error')) {
        console.log(subCategories);
        res.status(200).json(subCategories);
    }
    else {

        res.status(400).json({ error: 'No sub categories exists' });
    }
    next();
}

async function createCategories(req, res, next) {

    const { error, value } = schema.categorySchema.validate(req.body);

    if (!error) {
        var categories = await categoryService.createCategory(value);

        if (!categories.hasOwnProperty('error')) {
            console.log(categories);
            res.status(200).json(categories);
        }
        else {

            res.status(400).json({ error: 'No categories exists' });
        }
    } else {
        res.status(400).json({ error: error.message });
    }
    next();
}

async function createSubCategory(req, res, next) {

    const { error, value } = schema.paramsSchema.validate(req.params.id);
    if (!error) {

        const { error, value } = schema.categorySchema.validate(req.body);

        if (!error) {
            var subCategories = await categoryService.createSubCategory(req.params.id, value);

            if (!subCategories.hasOwnProperty('error')) {
                res.status(200).json(subCategories);
            }
            else {

                res.status(400).json(subCategories);
            }
        } else {
            res.status(400).json({ error: error.message });
        }
    } else {
        res.status(400).json({ error: error.message });
    }
    next();
}

async function getSubCategories(req, res, next) {

    var subCategories = await categoryService.getSubCategoriesByCategoryId(req.params.id);

    if (!subCategories.hasOwnProperty('error')) {
        res.status(200).json(subCategories);
    }
    else {

        res.status(400).json({ error: 'No sub categories exists' });
    }
    next();
}
