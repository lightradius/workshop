'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller.js'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function(req, res) {
    // Init Variables
    var user = req.user;
    var message = null;

    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;

    if (user) {
        // Merge existing user
        user = _.extend(user, req.body);
        user.updated = Date.now();
        user.displayName = user.firstName + ' ' + user.lastName;

        user.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                req.login(user, function(err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.json(user);
                    }
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};

exports.changeRoles = function(req, res) {
    var user = req.profile;
    user.roles = req.body.roles;

    user.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp(user);
        }
    });
};

/**
 * Send User
 */
exports.me = function(req, res) {
    res.json(req.user || null);
};

exports.myId = function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.user) {
        res.jsonp(req.user._id);
    } else {
        res.jsonp(null);
    }

};

/**
 * List users (only available to admin)
 */
exports.list = function(req, res) {
    User.find({}, {
        _id: 1,
        name: 1,
        username: 1,
        email: 1,
        provider: 1,
        roles: 1
    }).exec(function(err, users) {
        if (!err) {
            res.jsonp(users);
        } else {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
    });
};