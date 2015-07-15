'use strict';

module.exports = {
    app: {
        title: 'The Game Workshop by dSolver',
        description: 'Incremental and other web games workshop. Share your ideas, review games, discuss, and explore, all community driven.',
        keywords: 'Incremental, Idle, Web, Game, Workshop, dSolver, Open Source, Review, Rating, Discussion, Comment, Screenshots'
    },
    port: process.env.WORKSHOP_PORT || 3456,
    templateEngine: 'swig',
    sessionSecret: process.env.WORKSHOP_SESSION_SECRET || 'MEAN',
    sessionCollection: 'sessions',
    assets: {
        lib: {
            css: [
                'public/lib/angular-material/angular-material.css',
                'public/lib/components-font-awesome/css/font-awesome.css',
                'public/lib/angular-carousel/dist/angular-carousel.css'
            ],
            js: [
                'public/lib/moment/moment.js',
                'public/lib/jquery/dist/jquery.js',
                'public/lib/angular/angular.js',
                'public/lib/angular-resource/angular-resource.js',
                'public/lib/angular-cookies/angular-cookies.js',
                'public/lib/angular-animate/angular-animate.js',
                'public/lib/angular-touch/angular-touch.js',
                'public/lib/angular-sanitize/angular-sanitize.js',
                'public/lib/angular-ui-router/release/angular-ui-router.js',
                'public/lib/angular-ui-utils/ui-utils.js',
                'public/lib/angular-aria/angular-aria.js',
                'public/lib/angular-animate/angular-animate.js',
                'public/lib/angular-material/angular-material.js',
                'public/lib/ng-file-upload/ng-file-upload.js',
                'public/lib/quick-ngrepeat/quick-ng-repeat.js',
                'public/lib/angular-messages/angular-messages.js',
                'public/lib/angular-route/angular-route.js',
                'public/lib/angular-carousel/dist/angular-carousel.js',
                'public/lib/angular-moment/angular-moment.js'
            ]
        },
        css: [
            'public/modules/**/css/*.css',
            'public/highlighter/styles/googlecode.css'
        ],
        js: [
            'public/config.js',
            'public/application.js',
            'public/modules/*/*.js',
            'public/modules/*/*[!tests]*/*.js',
            'public/highlighter/highlight.pack.js'
        ],
        tests: [
            'public/lib/angular-mocks/angular-mocks.js',
            'public/modules/*/tests/*.js'
        ]
    }
};
