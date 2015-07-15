'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    errorHandler = require('./errors.server.controller'),
    Review = mongoose.model('Review'),
    _ = require('lodash'),
    marked = require('marked'),
    Game = mongoose.model('Game'),
    recalcTime = 1000 * 60 * 10; //10 minutes

function updateGameReviews(req, next) {
    console.log('game: ', req.review.gameId);
    Game.findById(req.review.gameId).populate('reviews').exec(function(err, game) {
        if (!err) {
            req.game = game;
            next();
        }
    });
}

function recalcRatings() {
    Game.find().populate('reviews').exec(function(err, games) {
        _.each(games, function(game, i) {
            var sum = 0;
            if (game.reviews && game.reviews.length > 0) {
                _.each(game.reviews, function(review, j) {
                    sum += review.score;
                });

                game.rating = sum / game.reviews.length;
            } else {
                game.rating = null;
            }
            console.log('game ' + game.name + ' new rating: ' + game.rating);
            game.save(function(err) {
                if (err) {
                    console.log(err);
                }
            });
        });
    });
    setTimeout(recalcRatings, recalcTime);
}

recalcRatings();


function fixGameIds() {
    Review.find().exec(function(err, reviews) {
        _.each(reviews, function(review) {
            console.log(review.gameId);
            if (typeof(review.gameId) == 'object') {
                review.gameId = review.gameId.valueOf();
            }

            var r = Review.findById(review._id).exec(function(err, rev) {
                console.log('review id: ', rev._id);
                rev.gameId = review.gameId.valueOf();
                rev.save();
            });

            /*var game = Game.find().exec(function(err, games) {

                if (games) {
                    console.log(games.length);
                    var found = false;
                    _.each(games, function(game) {
                        console.log(game._id.toString(), review.gameId.toString());
                        if (game._id.toString() == review.gameId.toString()) {
                            console.log('game match', game.name);
                            found = true;
                            review.game = game._id;
                            var id = game._id;
                            review.save(function(err, review) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });

                }

            });*/


        });
    });
}

//fixGameIds();


function findMineForGame(req, res, userId, gameId, next) {
    Review.findOne({
        user: userId,
        gameId: gameId
    }).exec(function(err, review) {
        if (!err) {
            next(req, res, review);
        }
    });
}

/**
 * Create a Review
 */
exports.create = function(req, res) {
    var review = new Review(req.body);

    review.user = req.user;

    req.review = review;
    if (review.content.length > 0) {
        review.contentHTML = marked(review.content);
    } else {
        review.contentHTML = '';
    }

    review.save(function(err, review) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            req.review = review;
            if (!req.user.reviewed) {
                req.user.reviewed = [];
            }
            //something is wrong here - it should realize that the user has reviewed this game before
            if (req.user.reviewed.indexOf(review.gameId) < 0) {
                req.user.reviewed.push(review.gameId);
                req.user.save();

                //Update game rating
                updateGameReviews(req, function() {
                    var sum = 0;

                    for (var i = 0; i < req.game.reviews.length; i++) {
                        sum += req.game.reviews[i].score;
                    }
                    sum += req.review.score;
                    req.game.rating = sum / (req.game.reviews.length + 1);
                    req.game.reviews.push(req.review._id);
                    req.game.save(function(err) {
                        if (!err) {
                            //get the reviews
                            res.jsonp(review);
                        } else {
                            res.status(400).send({
                                message: 'Error in updating review'
                            });
                        }
                    });
                });
            } else {
                res.status(400).send({
                    message: 'You have already reviewed this game'
                });
            }
        }
    });
};



/**
 * Show the current Review
 */
exports.read = function(req, res) {
    res.jsonp(req.review);
};

/**
 * Update a Review
 */
exports.update = function(req, res) {
    var review = req.review;

    review = _.extend(review, req.body);

    if (review.content.length > 0) {
        review.contentHTML = marked(review.content);
    } else {
        review.contentHTML = '';
    }

    review.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(review);
        }
    });
};

/**
 * Delete an Review
 */
exports.delete = function(req, res) {
    var review = req.review;
    req.user.reviewed.splice(req.user.reviewed.indexOf(review.gameId), 1);

    req.user.save();

    Game.findById(req.review.gameId).exec(function(err, game) {
        if (!err) {
            game.reviews.splice(game.reviews.indexOf(review._id), 1);
            game.save();
        }
    });
    review.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(review);
        }
    });
};

/**
 * Report a review
 */
exports.addReport = function(req, res) {
    var review = req.review;
    if (review.reports.indexOf(req.body.report) < 0) {
        review.reports.push(req.body.report);
        review.save(function(err) {
            //do nothing... yet
        });
    }
};

/**
 * List of Reviews
 */
exports.list = function(req, res) {
    var filter = {},
        limit = 250;
    if (req.query && req.query.gameId) {
        filter.gameId = req.query.gameId;
    }
    if (req.query && req.query.limit) {
        limit = req.query.limit;
    }
    console.log(filter);
    Review.find(filter).sort('-created').populate('user', 'displayName username').exec(function(err, reviews) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            for (var i = reviews.length - 1; i >= 0; i--) {
                var review = reviews[i];

                if (!review.contentHTML) {
                    reviews.splice(i, 1);
                }
            }

            if (reviews.length > limit) {
                //limit reviews
                _.dropRight(reviews, reviews.length - limit);
            }

            res.jsonp(reviews);
        }
    });
};



exports.readMine = function(req, res) {
    var filter = {
        user: req.user._id
    };

    if (req.query && req.query.gameId) {
        filter.gameId = req.query.gameId;
    }

    Review.find(filter, {}, {
        _id: 1
    }).exec(function(err, reviews) {

        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            /*var reviewsById = [];
            _.each(reviews, function(review) {
                if (req.query && req.query.gameId && review.gameId != req.query.gameId) {
                    //nothing?
                } else {
                    reviewsById.push(review._id);
                }
            });
            res.jsonp(reviewsById);*/
            res.jsonp(reviews);
        }
    });
};

/**
 * Review middleware
 */
exports.reviewByID = function(req, res, next, id) {
    Review.findById(id).populate('user', 'displayName username').exec(function(err, review) {
        if (err) return next(err);
        if (!review) return next(new Error('Failed to load Review ' + id));
        req.review = review;
        next();
    });
};

/**
 * Review authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.review.user.id !== req.user.id && req.user.roles.indexOf('admin') < 0) {
        return res.status(403).send('User is not authorized');
    }
    next();
};