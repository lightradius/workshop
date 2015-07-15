'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Discussion = mongoose.model('Discussion'),
    activityHandler = require('./activity.server.controller'),
    commentHandler = require('./comments.server.controller'),
    _ = require('lodash'),
    marked = require('marked'),
    Game = mongoose.model('Game');

/**
 * Create a Discussion
 */
exports.create = function(req, res) {
    var discussion = new Discussion(req.body);
    discussion.user = req.user;
    if (discussion.content.length > 0) {
        discussion.contentHTML = marked(discussion.content);
    } else {
        discussion.contentHTML = '';
    }
    discussion.lastModified = new Date();
    discussion.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            activityHandler.create(req.user, 'create', 'discussion', discussion.name, discussion._id, '');
            res.jsonp(discussion);
        }
    });
};

/**
 * Show the current Discussion
 */
exports.read = function(req, res) {
    res.jsonp(req.discussion);
};

/**
 * Update a Discussion
 */
exports.update = function(req, res) {
    var discussion = req.discussion;

    discussion = _.extend(discussion, req.body);
    delete discussion.liked;
    delete discussion.disliked;
    delete discussion.score;

    if (discussion.content.length > 0) {
        discussion.contentHTML = marked(discussion.content);
    } else {
        discussion.contentHTML = '';
    }

    discussion.lastModified = new Date();

    discussion.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            activityHandler.create(req.user, 'update', 'discussion', discussion.name, discussion._id, '');
            res.jsonp(discussion);
        }
    });
};

/**
 * Delete an Discussion
 */
exports.delete = function(req, res) {
    var discussion = req.discussion;

    discussion.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            activityHandler.create(req.user, 'delete', 'discussion', discussion.name, discussion._id, '');
            res.jsonp(discussion);
        }
    });
};

/**
 * Add a comment
 */
exports.addComment = function(req, res) {
    var discussion = req.discussion;

    commentHandler.create(req, res, function(comment) {
        discussion.comments.push(comment._id);
        discussion.lastModified = new Date();
        discussion.save(function(err, discussion) {
            activityHandler.create(req.user, 'create', 'comment', 'new comment', comment._id, 'for ' + discussion.name + ', ' + discussion._id);
            res.jsonp(comment);
        });
    });
};

function updateVote(item, user, direction) {
    var id = item._id;
    var indLiked = user.liked.indexOf(id);
    var indDisliked = user.disliked.indexOf(id);

    if (direction === 1) {
        if (indLiked >= 0) {
            //no change
            item.myVote = 1;
        } else if (indDisliked >= 0) {
            item.disliked--;
            item.myVote = 0;
            user.disliked.splice(indDisliked, 1);
        } else {
            item.liked++;
            item.myVote = 1;
            user.liked.push(id);
        }
    } else if (direction === -1) {
        if (indLiked >= 0) {
            item.liked--;
            item.myVote = 0;
            user.liked.splice(indLiked, 1);
        } else if (indDisliked >= 0) {
            //no change
            item.myVote = -1;
        } else {
            item.disliked++;
            item.myVote = -1;
            user.disliked.push(id);
        }
    }

    item.score = item.liked - item.disliked;
}

exports.vote = function(req, res) {
    var discussion = req.discussion;
    var user = req.user;

    var vote = req.body.vote;

    updateVote(discussion, user, vote);

    discussion.save(function(err) {
        if (!err) {
            user.save(function(err) {
                if (!err) {
                    return res.status(200).send();
                } else {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
            });
        } else {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
    });
};

/**
 * Report a discussion
 */
exports.addReport = function(req, res) {
    var discussion = req.discussion;
    if (discussion.reports.indexOf(req.body.report) < 0) {
        discussion.reports.push(req.body.report);
        discussion.save(function(err) {
            //do nothing... yet
        });
    }
};

/**
 * List of Discussions
 */
exports.list = function(req, res) {
    var filter = {},
        sort = '-score';

    if (req.query && req.query.attached) {
        filter.attached = req.query.attached;
    }

    if (req.query && req.query.sort) {
        sort = req.query.sort;
    }

    Discussion.find(filter).sort(sort).populate('user', 'username').exec(function(err, discussions) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(discussions);
        }
    });
};

/**
 * Discussion middleware
 */
exports.discussionByID = function(req, res, next, id) {
    Discussion.findById(id).populate('user', 'username').populate('comments', 'user created contentHTML reports liked disliked').exec(function(err, discussion) {
        if (err) return next(err);
        if (!discussion) return next(new Error('Failed to load Discussion ' + id));


        Discussion.populate(discussion, {
            path: 'comments.user',
            model: 'User',
            select: 'username displayName'
        }, function(err, discussion) {
            req.discussion = discussion;
            next();
        });

    });
};

/**
 * Discussion authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.discussion.user.id !== req.user.id && req.user.roles.indexOf('admin') < 0) {
        return res.status(403).send('User is not authorized');
    }
    next();
};