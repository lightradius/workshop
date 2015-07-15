'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users.server.controller');
    var reviews = require('../../app/controllers/reviews.server.controller');
    var games = require('../../app/controllers/games.server.controller');


    app.route('/reviews/mine')
        .get(users.requiresLogin, reviews.readMine);

    // Reviews Routes
    app.route('/reviews')
        .get(reviews.list)
        .post(users.requiresLogin, reviews.create);

    app.route('/reviews/:reviewId')
        .get(reviews.read)
        .put(users.requiresLogin, reviews.hasAuthorization, reviews.update)
        .delete(users.requiresLogin, reviews.hasAuthorization, reviews.delete);

    // Finish by binding the Review middleware
    app.param('reviewId', reviews.reviewByID);
    app.param('gameId', games.gameByID);
};