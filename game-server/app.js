var pomelo = require('pomelo');
var consts = require('./app/consts/consts')
var utils = require('./app/util/utils');
var orderDao = require('./app/dao/orderDao');
var abuseFilter = require('./abuseFilter');
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'parentsheart');
app.set('version','1.0.0');
app.set('__host', "42.121.106.17");

// configure for global
app.configure('production|development', function() {
    app.loadConfig('mysql', app.getBase() + '/../shared/config/mysql.json');
    app.filter(pomelo.filters.timeout());
    //app.filter(abuseFilter());
    app.set('errorHandler', function ( err, msg,un1, session,un2, cb) {
        console.log('errorHandler', arguments);
        utils.sendMail(err.message, err.stack);
        cb(null,{
            error:{
                code:400,
                message:err.message
            }
        });
    })
    app.set('uncaughtException',function(){
        console.log("uncaughtException",arguments);
    })
    app.set('globalErrorHandler',function(){
        console.log("globalErrorHandler",arguments);
    })
    app.set('rpcErrorHandler',function(){
        console.log("rpcErrorHandler",arguments);
    })
    app.set(consts.ORDER_TYPE.OrderDoctor,{});
    app.set(consts.ORDER_TYPE.OrderService,{});
    app.set(consts.ORDER_TYPE.OrderWork,{});
})
//// app configuration
app.configure('production|development', 'connector', function(){
  app.set('connectorConfig',
    {
//      connector : pomelo.connectors.webconnector,
//      heartbeat : 3,
      useDict : true,
      useProtobuf : true
    });
});

app.configure('production|development', 'chat', function() {
    require('./app/util/httpServer')(app);
});
// Configure database
app.configure('production|development', 'auth|chat|connector|master', function() {
    var dbclient = require('./app/dao/mysql/mysql').init(app);
    app.set('dbclient', dbclient);
});
// start app
app.start();

process.on('uncaughtException', function (err) {
    console.log(arguments);
    console.error(' Caught exception: ' + err.stack);
    utils.sendMail(err.message, err.stack);
});
