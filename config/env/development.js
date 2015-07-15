'use strict';

module.exports = {
    db: 'mongodb://localhost/workshop-dev',
    app: {
        title: 'workshop - Development Environment'
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