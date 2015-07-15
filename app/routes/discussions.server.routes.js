'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users.server.controller');
    var discussions = require('../../app/controllers/discussions.server.controller');

    // Discussions Routes
    app.route('/discussions')
        .get(discussions.list)
        .post(users.requiresLogin, discussions.create);

    app.route('/discussions/:discussionId')
        .get(discussions.read)
        .put(users.requiresLogin, discussions.hasAuthorization, discussions.update)
        .delete(users.requiresLogin, discussions.hasAuthorization, discussions.delete);

    app.route('/discussions/:discussionId/comment')
        .put(users.requiresLogin, discussions.addComment);

    app.route('/discussions/:discussionId/report')
        .post(users.requiresLogin, discussions.addReport);

    app.route('/discussions/:discussionId/vote')
        .put(users.requiresLogin, discussions.vote);

    // Finish by binding the Discussion middleware
    app.param('discussionId', discussions.discussionByID);
};