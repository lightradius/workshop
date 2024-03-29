'use strict';

module.exports = {
    db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/workshop',
    assets: {
        lib: {
            css: [
                'public/lib/angular-material/angular-material.css',
                'public/lib/components-font-awesome/css/font-awesome.css'
            ],
            js: [
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
                'public/lib/quick-ngrepeat/quick-ng-repeat.js'
            ]
        },
        css: 'public/dist/application.min.css',
        js: 'public/dist/application.min.js'
    },
    facebook: {
        clientID: process.env.WORKSHOP_FACEBOOK_ID || 'WORKSHOP_FACEBOOK_ID',
        clientSecret: process.env.WORKSHOP_FACEBOOK_SECRET || 'WORKSHOP_FACEBOOK_SECRET',
        callbackURL: '/auth/facebook/callback'
    },
    twitter: {
        clientID: process.env.WORKSHOP_TWITTER_KEY || 'WORKSHOP_TWITTER_KEY',
        clientSecret: process.env.WORKSHOP_TWITTER_SECRET || 'WORKSHOP_TWITTER_SECRET',
        callbackURL: '/auth/twitter/callback'
    },
    google: {
        clientID: process.env.WORKSHOP_GOOGLE_ID || 'WORKSHOP_GOOGLE_ID',
        clientSecret: process.env.WORKSHOP_GOOGLE_SECRET || 'WORKSHOP_GOOGLE_SECRET',
        callbackURL: '/auth/google/callback'
    },
    linkedin: {
        clientID: process.env.WORKSHOP_LINKEDIN_ID || 'WORKSHOP_LINKEDIN_ID',
        clientSecret: process.env.WORKSHOP_LINKEDIN_SECRET || 'WORKSHOP_LINKEDIN_SECRET',
        callbackURL: '/auth/linkedin/callback'
    },
    github: {
        clientID: process.env.WORKSHOP_GITHUB_ID || 'WORKSHOP_GITHUB_ID',
        clientSecret: process.env.WORKSHOP_GITHUB_SECRET || 'WORKSHOP_GITHUB_SECRET',
        callbackURL: '/auth/github/callback'
    },
    reddit: {
        clientID: process.env.WORKSHOP_REDDIT_ID || 'WORKSHOP_REDDIT_ID',
        clientSecret: process.env.WORKSHOP_REDDIT_SECRET || 'WORKSHOP_REDDIT_SECRET',
        callbackURL: '/auth/reddit/callback'
    },
    steam: {
        apiKey: process.env.WORKSHOP_STEAM_ID || 'WORKSHOP_STEAM_ID',
        callbackURL: 'http://workshop.ga/auth/steam/callback',
        realm: 'http://workshop.ga'
    },
    mailer: {
        from: process.env.MAILER_FROM || 'MAILER_FROM',
        options: {
            service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
            auth: {
                user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
                pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
            }
        }
    }
};