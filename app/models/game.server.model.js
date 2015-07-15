'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Game Schema
 */
var GameSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Game name',
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    shortDescription: {
        type: String
    },
    description: {
        type: String
    },
    descriptionHTML: {
        type: String
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    creators: [{
        type: Schema.ObjectId,
        ref: 'Creator'
    }],
    creatorNames: [String],
    achievements: [{
        type: Schema.ObjectId,
        ref: 'Achievement'
    }],
    link: {
        type: String,
        required: 'Please fill in a link to the game',
        unique: true
    },
    screenshots: [{
        type: Schema.ObjectId,
        ref: 'Fileupload'
    }], //array of filenames of uploaded images
    logo: {
        type: String
    },
    liked: {
        type: Number,
        default: 0
    },
    published: {
        type: Date
    },
    status: {
        type: String,
        enum: [
            'Prototype',
            'Closed-Alpha',
            'Alpha',
            'Open-Alpha',
            'Closed-Beta',
            'Beta',
            'Open-Beta',
            'Released'
        ]
    },
    tags: [{
        type: String,
        enum: [
            'Kongregate',
            'Newgrounds',
            'Armor Games',
            'Steam',
            'Itch.io',
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
            'Dart',
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
            'Unix',
            'Registration Required',
            'Multiplayer',
            'NSFW',
            'Work Friendly',
            'Mobile',
            'Resource Management',
            'Idle Growth',
            'Story',
            'Animated',
            'RPG',
            'Strategy',
            'Action',
            'World-building',
            'Offline Progress',
            'Cloud Save'
        ]
    }],
    subreddit: {
        type: String
    },
    version: {
        type: String
    },
    rating: {
        type: Number
    },
    reviews: [{
        type: Schema.ObjectId,
        ref: 'Review'
    }],
    viewed: {
        type: Number,
        default: 0
    },
    developer_twitter: {
        type: String,
    },
    facebook: {
        type: String
    },
    googlePlay: {
        type: String
    },
    appStore: {
        type: String
    },
    windowsStore: {
        type: String
    },
    bbStore: {
        type: String
    },
    youtube: {
        type: String
    },
    twitch: {
        type: String
    }
});

GameSchema.index({
    '_id': 1,
    'link': 1
}, {
    unique: true
});
mongoose.model('Game', GameSchema);