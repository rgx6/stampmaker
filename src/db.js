(function () {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

    var StampSchema = new Schema({
        siteUrl:        { type: String },
        hashtag:        { type: String },
        text:           { type: String },
        tweetUrl:       { type: String },
        imageUrl:       { type: String },
        registeredTime: { type: Date   },
    });
    mongoose.model('Stamp', StampSchema);

    mongoose.connect('mongodb://localhost/stampmaker');

    exports.Stamp = mongoose.model('Stamp');
})();
