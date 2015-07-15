'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users.server.controller');
    var games = require('../../app/controllers/games.server.controller');

    var multer = require('multer');
    var randomstring = require('randomstring');



    // Games Routes
    app.route('/games')
        .get(games.list)
        .post(users.requiresLogin, games.canContribute, games.create);

    app.route('/games/:gameId')
        .get(games.read)
        .put(users.requiresLogin, games.hasAuthorization, games.update)
        .delete(users.requiresLogin, games.hasAuthorization, games.delete);

    app.route('/games/:gameId/acl')
        .get(users.requiresLogin, games.gameACL);

    app.route('/games/:gameId/like')
        .put(users.requiresLogin, games.like)
        .delete(users.requiresLogin, games.unlike);

    app.route('/gameviews')
        .get(users.requiresLogin, users.hasAuthorization(['admin']), games.sessionViews);

    /*app.route('/games/:gameId/up/')
        .post(users.requiresLogin, games.upload);*/

    app.post('/games/:gameId/up', [multer({
            dest: './public/uploads/',
            fileSize: 500 * 1024,
            onFileUploadStart: function(file, req, res) {
                if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
                    return false;
                }
            },
            onFileUploadData: function(file, data, req, res) {
                console.log(data.length + ' of ' + file.fieldname + ' arrived');
            },
            onFileUploadComplete: games.uploadComplete
        }),
        function(req, res, next) {
            console.log('form files: ', req.files); // form files
        }
    ]);

    app.route('/games/:gameId/:imgId').delete(users.requiresLogin, games.hasAuthorization, games.deleteImg);

    app.post('/games/:gameId/logo', [multer({
            dest: './public/uploads/',
            fileSize: 15 * 1024 * 1024,
            onFileUploadStart: function(file, req, res) {
                if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
                    return false;
                }
            },
            onFileUploadData: function(file, data, req, res) {
                console.log(data.length + ' of ' + file.fieldname + ' arrived');
            },
            onFileUploadComplete: games.uploadLogoComplete
        }),
        function(req, res, next) {
            console.log('form files: ', req.files); // form files
        }
    ]);


    app.route('/tags/:gameId/:tag')
        .put(users.requiresLogin, games.addTag)
        .delete(users.requiresLogin, games.hasAuthorization, games.removeTag);

    app.route('/tags')
        .get(games.listTags);

    app.route('/statuses')
        .get(games.listStatuses);

    // Finish by binding the Game middleware
    app.param('gameId', games.gameByID);

    app.param('imgId', function(req, res, next, id) {
        req.imgId = id;
        next();
    });

    app.param('tag', function(req, res, next, tag) {
        req.tag = tag;
        next();
    });
};