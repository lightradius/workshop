'use strict';

var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller');
/**
 * Module dependencies.
 */
exports.index = function(req, res) {
    res.render('index', {
        user: req.user || null,
        request: req
    });
};
/*
function checkComments(err, comment) {
    if (err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    } else {
        return res.jsonp(comment);
    }
}

function checkAchievements(err, achievement) {
    if (err) {
        commentsHandler.commentsByID(req, res, checkComments, id);
    } else {
        return res.jsonp(achievement);
    }
}

function checkArticle(err, article) {
    if (err) {
        achievementsHandler.achievementsByID(req, res, checkAchievements, id);
    } else {
        return res.jsonp(article);
    }
}

function checkCreator(err, creator) {
    if (err) {
        articlesHandler.articleByID(req, res, checkArticle, id);
    } else {
        return res.jsonp(creator);
    }
}

function checkUser(err, user) {
    if (err) {
        creatorsHandler.creatorByID(req, res, checkCreator, id);
    } else {
        return res.jsonp(user);
    }
}

function checkReview(err, review) {
    if (err) {
        usersHandler.creatorByID(req, res, checkUser, id);
    } else {
        return res.jsonp(review);
    }
}

function checkDiscussion(err, discussion) {
    if (err) {
        reviewHandler.reviewByID(req, res, checkReview, id);
    } else {
        return res.jsonp(discussion);
    }
}

function checkGame(err, game) {
    if (err) {
        discussionHandler.discussionByID(req, res, checkDiscussion, id);
    } else {
        return res.jsonp(game);
    }
}

exports.ObjectByID = function(req, res, next, id) {
    //check in Game, Discussion, Review, User
    gameHandler.gameByID(req, res, checkGame, id);

};*/