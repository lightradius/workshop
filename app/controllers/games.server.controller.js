'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Game = mongoose.model('Game'),
    User = mongoose.model('User'),

    activityHandler = require('./activity.server.controller'),
    _ = require('lodash'),
    Fileupload = mongoose.model('Fileupload'),
    marked = require('marked'),
    done = false,
    hoursBetweenNewFeatures = 12, //hours
    featuredGames,
    gamesList,
    gamesListByMostViewed,
    gamesListByHighestRating,
    gamesListByMostRecentlyAdded,
    gamesListByMostLikes,
    gamesListTimeout = 1000 * 60 * 5, //minutes
    gamesListGenerated,
    recentGameViews = {};


function pickFeaturedGames() {
    //pick 10 games! or as many as there are available

    featuredGames = [];

    Game.find().populate('user', 'displayName username').exec(function(err, games) {
        if (!err) {
            var shuffled = _.shuffle(games);
            /*for (var i = 0; i < 10 && i < shuffled.length; i++) {
                featuredGames.push(shuffled[i]);
            }*/

            var index = 0;
            //only pick games that have logos
            while (featuredGames.length < 10 && index < shuffled.length) {
                var game = shuffled[index];
                if (game.logo) {
                    featuredGames.push(game);
                }
                index++;
            }
            /*console.log('Featured Games: ');
            console.log(featuredGames);*/

        }
    });


    setTimeout(pickFeaturedGames, 1000 * 60 * 60 * hoursBetweenNewFeatures);

}


pickFeaturedGames();


function listGames(next) {
    gamesList = [];

    Game.find('name').populate('user', 'displayName username').exec(function(err, games) {
        if (!err) {
            _.each(games, function(game, index) {
                gamesList.push({
                    _id: game._id,
                    name: game.name,
                    user: game.user,
                    logo: game.logo,
                    liked: game.liked,
                    viewed: game.viewed,
                    numScreenshots: game.screenshots.length,
                    numReviews: game.reviews.length,
                    rating: game.rating,
                    tags: game.tags,
                    status: game.status,
                    descriptionHTML: game.descriptionHTML,
                    created: game.created
                });
            });

            gamesList = _.sortBy(gamesList, 'name');

            gamesListByHighestRating = _.sortBy(gamesList, 'rating').reverse();

            gamesListByMostViewed = _.sortBy(gamesList, 'viewed').reverse();

            gamesListByMostRecentlyAdded = _.sortBy(gamesList, 'created').reverse();

            gamesListByMostLikes = _.sortBy(gamesList, 'liked').reverse();

            gamesListGenerated = new Date();
            if (next) {
                next();
            }
        }
    });

    //setTimeout(listGames, 1000 * 60);
}

listGames();


/**
 * Create a Game
 */
exports.create = function(req, res) {
    delete req.body.rating;
    delete req.body.viewed;
    delete req.body.liked;
    delete req.body.created;

    var game = new Game(req.body);
    game.user = req.user;

    if (game.description && game.description.length > 0) {
        game.descriptionHTML = marked(game.description);
    }


    game.save(function(err) {
        if (err) {
            var errorMessage = errorHandler.getErrorMessage(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            activityHandler.create(req.user, 'create', 'game', game.name, game._id, '');
            res.jsonp(game);
        }
    });
};

exports.sessionViews = function(req, res) {
    res.jsonp(recentGameViews);
};

/**
 * Show the current Game
 */
exports.read = function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    //console.log(req.sessionID);
    if (!recentGameViews[req.game._id]) {
        recentGameViews[req.game._id] = [];
    }

    if (recentGameViews[req.game._id].indexOf(req.sessionID) < 0) {
        req.game.viewed++;
        recentGameViews[req.game._id].push(req.sessionID);
    }

    req.game.save();
    res.jsonp(req.game);
};

exports.gameACL = function(req, res) {
    var game = req.game;
    if (req.user) {
        var user = req.user;
        var isAuthor = (req.game.user._id === user._id);
        var isAdmin = (user.roles.indexOf('admin') >= 0);
        var isContrib = (user.roles.indexOf('contrib') >= 0);
        var acl = {};
        acl.canEdit = (isAuthor || isAdmin || isContrib);
        acl.canChangeLogo = (isAuthor || isContrib || isAdmin);
        acl.canAddScreenshots = true;
        acl.canDeleteScreenshots = (isAuthor || isContrib || isAdmin);
        acl.canRemoveTags = (isAuthor || isContrib || isAdmin);
        acl.canAddTags = (isAuthor || isContrib || isAdmin);
        acl.canReview = true;
        acl.blargh = 'Blarghhh';
        acl.canDeleteGame = (isAdmin);
        acl.canPassOwnership = (isAdmin);

        res.jsonp(acl);
    } else {
        res.status(400).send({
            message: 'User is not logged in'
        });
    }
};

/**
 * Update a Game
 */
exports.update = function(req, res) {
    var game = req.game;

    delete req.body.rating;
    delete req.body.viewed;
    delete req.body.liked;
    delete req.body.created;

    game = _.extend(game, req.body);

    if (game.description && game.description.length > 0) {
        game.descriptionHTML = marked(game.description);
    }


    game.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            activityHandler.create(req.user, 'update', 'game', game.name, game._id, '');
            res.jsonp(game);
        }
    });
};

/**
 * Delete an Game
 */
exports.delete = function(req, res) {
    var game = req.game;

    game.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            activityHandler.create(req.user, 'delete', 'game', game.name, game._id, '');
            res.jsonp(game);
        }
    });
};


/**
 * List of Games
 */
exports.list = function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    var now = new Date();

    function ret() {
        if (req.query.sortAlphabetical) {
            return res.jsonp(gamesList);
        }

        if (req.query.featured) {
            return res.jsonp(featuredGames);
        }

        if (req.query.sortMostRecent) {
            return res.jsonp(gamesListByMostRecentlyAdded);
        }

        if (req.query.sortMostLiked) {
            return res.jsonp(gamesListByMostLikes);
        }

        return res.jsonp(gamesList);
    }

    if (gamesListGenerated && now - gamesListGenerated > gamesListTimeout) {
        listGames(ret);
    } else {
        ret();
    }

};

/**
 * Game middleware
 */
exports.gameByID = function(req, res, next, id) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    Game.findById(id).populate('user', 'displayName').populate('screenshots').populate('discussions.user.displayName discussions.created discussions.name').exec(function(err, game) {
        if (err) return next(err);
        if (!game) return next(new Error('Failed to load Game ' + id));
        req.game = game;
        next();
    });
};

exports.like = function(req, res) {
    var game = req.game;
    var user = req.user;
    if (user.gamesLiked.indexOf(game._id) < 0) {
        user.gamesLiked.push(game._id);
        game.liked++;
        user.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                game.save(function(err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(user);
                    }
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'user already liked this'
        });
    }
};

exports.unlike = function(req, res) {
    var game = req.game;
    var user = req.user;
    if (user.gamesLiked.indexOf(game._id) >= 0) {
        user.gamesLiked.splice(user.gamesLiked.indexOf(game._id), 1);
        game.liked--;
        user.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                game.save(function(err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(user);
                    }
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'user didn\'t like this to begin with'
        });
    }
};

exports.deleteImg = function(req, res) {
    var game = req.game;
    var imgId = req.imgId;

    var deleted = false;

    var index;

    for (var i = 0; i < game.screenshots.length; i++) {
        if (game.screenshots[i]._id.toString() === imgId) {
            index = i;
            break;
        }
    }

    if (index !== undefined) {
        game.screenshots.splice(index, 1);
        game.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                return res.status(200).send();
            }
        });
    } else {
        return res.status(400).send({
            message: 'image file not found in association with this game'
        });
    }

};

/**
 * Upload Files
 */
exports.upload = function(req, res) {};

exports.uploadLogo = function(req, res) {};

exports.uploadComplete = function(file, req, res) {

    var fileupload = new Fileupload({
        filename: file.name,
        user: req.user._id
    });

    fileupload.save(function(err, uploadedfile) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var game = req.game;
            game.screenshots.unshift(uploadedfile._id);
            game.save(function(err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(uploadedfile);
                }
            });
        }
    });


};

exports.uploadLogoComplete = function(file, req, res) {
    var game = req.game;
    game.logo = file.name;
    game.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                filename: file.name
            });
        }
    });
};

/**
 * Tagging and untagging
 */

exports.listTags = function(req, res) {
    res.jsonp({
        Site: [
            'Kongregate',
            'Newgrounds',
            'Armor Games',
            'Steam',
            'Itch.io'
        ],
        Technology: [
            'Unity',
            'HTML 5',
            'Flash',
            'Silverlight',
            'Source 2',
            'Unreal',
            'Blender',
            'Stencyl',
            'Phaser',
            'Java',
            'Python',
            'Dart'
        ],
        Platform: [
            'Android',
            'iOS',
            'WP',
            'Blackberry',
            'Web',
            'PS 3',
            'PS 4',
            'PS Vita',
            'Xbox 360',
            'Xbox One',
            'Nintendo Wii',
            'Nintendo Wii U',
            'Nintendo DS',
            'Windows',
            'Mac',
            'Unix'
        ],
        Features: [
            'Registration Required',
            'Multiplayer',
            'NSFW',
            'Work Friendly',
            'Mobile',
            'Offline Progress',
            'Cloud Save'
        ],
        Mechanics: [
            'Resource Management',
            'Idle Growth',
            'Story',
            'Animated',
            'RPG',
            'Strategy',
            'Action',
            'World-building'
        ]
    });
};

exports.addTag = function(req, res) {
    var game = req.game;
    var tag = req.tag;
    if (game.tags.indexOf(tag) < 0) {
        game.tags.push(tag);
        game.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp({
                    tag: req.tag
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'Tag already added'
        });
    }
};

exports.removeTag = function(req, res) {
    var game = req.game;
    var tag = req.tag;
    if (game.tags.indexOf(tag) >= 0) {
        game.tags.splice(game.tags.indexOf(tag), 1);
        game.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp({
                    tag: req.tag
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'game not tagged with this tag'
        });
    }
};

exports.listStatuses = function(req, res) {
    res.jsonp([
        'Prototype',
        'Closed-Alpha',
        'Alpha',
        'Open-Alpha',
        'Closed-Beta',
        'Beta',
        'Open-Beta',
        'Released'
    ]);
};

exports.passGameOwnership = function(req, res) {
    var game = req.game;
    var otherUser = User.findById(req.body.userId).exec(function(err, user) {
        if (!err) {
            game.user = user;
            game.save(function(err) {
                if (err) {
                    return res.status(400).send({
                        message: 'Ownership not transferred due to server error'
                    });
                } else {
                    return res.status(200).send({
                        message: 'Ownership transferred to ' + otherUser.displayName
                    });
                }
            });
        } else {
            return res.status(400).send({
                message: 'Ownership not transferred'
            });
        }
    });
};

/**
 * Game authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {

    if (req.game.user.id === req.user.id || req.user.roles.indexOf('admin') >= 0 || req.user.roles.indexOf('contrib') >= 0) {
        next();
    } else {
        return res.status(403).send('User is not authorized');
    }

};

exports.canContribute = function(req, res, next) {
    //remove user if we don't want regular users to contribute
    if (req.user.roles.indexOf('admin') >= 0 || req.user.roles.indexOf('contrib') >= 0 || req.user.roles.indexOf('user') >= 0) {
        next();
    } else {
        return res.status(403).send('User is not authorized');
    }
};