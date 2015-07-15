'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ArticleSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        default: '',
        trim: true
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    contentHTML: {
        type: String,
        default: '',
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    thumbnail: {
        type: String
    },
    published: {
        type: Boolean,
        default: false
    },
    liked: {
        type: Number,
        default: 0
    },
    disliked: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: 0
    },
    comments: [{
        type: Schema.ObjectId,
        ref: 'Comment'
    }]

});

mongoose.model('Article', ArticleSchema);

/*The reasoning behind having a list of files for an article is to help the author(s) 
of the article find the images that have been uploaded for the purpose of this article*/