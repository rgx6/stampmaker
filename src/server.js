var express      = require('express');
var http         = require('http');
var compression  = require('compression');
var errorHandler = require('errorhandler');
var path         = require('path');
var log4js       = require('log4js');
var routes       = require('./routes.js');

log4js.configure('log4js_configuration.json', { reloadSecs: 60 });
var appLogger = log4js.getLogger('applog');
var accessLogger = log4js.getLogger('accesslog');

var app = express();
app.set('port', process.env.PORT || 3005);
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.enable('trust proxy');
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(log4js.connectLogger(accessLogger, {
    // express 閾値ではなく指定したログレベルで記録される
    'level': log4js.levels.INFO,
    // アクセスログを出力する際に無視する拡張子
    'nolog': [ '\\.css', '\\.js', '\\.png' ],
    // アクセスログのフォーマット
    'format': JSON.stringify({
        'remote-addr':    ':remote-addr',
        'method':         ':method',
        'url':            ':url',
        'status':         ':status',
        'http-version':   ':http-version',
        'content-length': ':content-length',
        'referrer':       ':referrer',
        'user-agent':     ':user-agent',
        'response-time':  ':response-time',
    })
}));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 7 * 24 * 3600 * 1000 }));

// NODE_ENV=production node server.js  default:development
if (app.get('env') === 'development') {
    app.use(errorHandler({ showStack: true, dumpExceptions: true }));
    app.locals.pretty = true;
}

// routing
var appRoot = '/';
routes.set(appRoot, app);

// 404 not found
app.use(function (req, res) {
    res.sendStatus(404);
});

var server = http.createServer(app);
server.listen(app.get('port'), function () {
    appLogger.info('Express server listening on port ' + app.get('port'));
});

process.on('uncaughtException', function (err) {
    appLogger.error('uncaughtException => ' + err);
});
