/**
 * Created by chenpeng on 14-3-7.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var async = require('async');
var log4js = require('pomelo-logger');
var consts = require('./lib/consts/consts');
var utils = require('./lib/util/utils');
var routes = require('./routes');

var app = module.exports =  express();

log4js.configure({
    appenders: [
        {
            type: 'console'
        } //控制台输出
        ,
        {
            "type": "file",
            "filename": __dirname + "/logs/log.log",
            "pattern": "web",
            "maxLogSize": 1048576,
            "layout": {
                "type": "basic"
            },
            "backups": 5,
            "category": "web-log"
        }
    ],
    replaceConsole: true
});

var logger = log4js.getLogger("web-log",__filename,process.pid);
process.env.LOGGER_LINE = true;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());

app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser({uploadDir:path.join(__dirname,'upload')}));
app.use(express.cookieParser('xnal parentsheart'));
app.use(express.session());

//验证
//app.use(express.basicAuth(function(user, pass){
//    return 'tj' == user && 'wahoo' == pass;
//}));


//app.param('id', function(req, res, next, id,params){
//    if( id > 4)
//    {
//        next(new Error('failed to load user'));
//    }
//    else
//    {
//        next();额
//    }
//});
//app.get('/user:id/name:name/age:age', function ( req, res)
//{
//    console.log(req.param('id'),req.param('name'),req.param('age'));
//});

app.use(express.static(path.join(__dirname, 'public')));

app.use(log4js.connectLogger(logger, {level: 'auto', format:':method :url'})); //静态文件不打印

app.use(app.router);
app.use(routes(app));

//处理未找到请求
app.use(function(req, res, next){
    logger.error('no %s method on %s . return 404', req.method, req.url);

    res.render('404', {
        status: 404,
        title: 'NodeBlog'
    });
});

//error handler
app.use( function ( err, req, res, next)
{
    console.error(err.stack);
    utils.sendMail(err.message, err.stack);
    res.render('500', {
    });
});

if ('development' == app.get('env')) {
    app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
}else
{
    app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
}


http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

process.on('uncaughtException', function (err) {
    console.log(arguments);
    console.error('uncaughtException： Caught exception: ' + err.stack);
    utils.sendMail(err.message, err.stack);
});
