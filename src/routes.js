var fs      = require('fs');
var https   = require('https');
var log4js  = require('log4js');
var logger  = log4js.getLogger('appLog');
var Promise = require('es6-promise').Promise;
var db      = require('./db.js');

var TweetUrlPattern      = new RegExp('^https://twitter.com/[_0-9a-zA-Z]+/status/[0-9]+/?$');
var TwitterPbsUrlPattern = new RegExp('https://pbs.twimg.com/media/[^:]+');

exports.set = function (appRoot, app) {
    app.get(appRoot, index);
    app.post(appRoot + 'tweeturl', postTweetUrl);
    app.post(appRoot + 'stampdata', postStampData);
};

var index = function (req, res) {
    'use strict';

    res.render('index');
    return;
};

var postTweetUrl = function (req, res) {
    'use strict';

    var tweetUrl = req.body.tweetUrl;
    if (tweetUrl == null || !TweetUrlPattern.test(tweetUrl)) {
        res.status(400).json({ result: 'ng', reason: 'bad request' });
        return;
    }

    https.get(tweetUrl, function (r) {
        if (r.statusCode != 200) {
            logger.error(r.statusCode + ' ' + tweetUrl);
            res.status(500).json({ result: 'ng', reason: r.statusCode });
            return;
        }

        var body = '';
        r.on('data', function (chunk) {
            body += chunk;
        });
        r.on('end', function () {
            var twitterPbsUrl = TwitterPbsUrlPattern.exec(body);

            if (twitterPbsUrl == null) {
                logger.error('twitterImageUrl is null  ' + tweetUrl);
                res.status(500).json({ result: 'ng', reason: 'twitterImageUrl is null' });
                return;
            }

            twitterPbsUrl = twitterPbsUrl[0];

            var twitterPicUrl = tweetUrl;
            if (twitterPicUrl.slice(-1) !== '/') twitterPicUrl += '/';
            twitterPicUrl += 'photo/1';

            res.status(200).json({
                twitterPicUrl: twitterPicUrl,
                twitterPbsUrl: twitterPbsUrl,
            });
        });
    }).on('error', function (e) {
        logger.error(e);
        res.status(500).json({ result: 'ng', reason: 'error' });
    });
};

var postStampData = function (req, res) {
    'use strict';

    var siteUrl  = req.body.siteUrl;
    var hashtag  = req.body.hashtag;
    var text     = req.body.text;
    var tweetUrl = req.body.tweetUrl;
    var imageUrl = req.body.imageUrl;

    var stampData = new db.Stamp();
    stampData.siteUrl        = siteUrl;
    stampData.hashtag        = hashtag;
    stampData.text           = text;
    stampData.tweetUrl       = tweetUrl;
    stampData.imageUrl       = imageUrl;
    stampData.registeredTime = new Date();

    stampData.save(function (err, doc) {
        if (err) {
            logger.error(err);
            res.status(500).json({ result: 'ng' });
            return;
        }

        res.status(200).json({ result: 'ok' });
        return;
    });
};
