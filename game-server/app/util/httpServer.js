/**
 * Created by cp on 1/23/14.
 */
var pomelo = require('pomelo')
var http = require('http');
var qs = require('querystring');
var logDao = require('../dao/logDao')
var orderDao = require('../dao/orderDao');
var port = 3001;
var timeout = 3000;
var consts = require('../consts/consts')
var utils = require('../util/utils');

module.exports = function(app) {
    return new HttpServer(app);
};

var HttpServer = function(app) {
    this.app = app;
    this.userDicPath = null;
    httpStart();
};

var server = null;

var httpStop = function() {
    server.close(function() {
        console.log(' http server stop port '  + port);
        server = null;
    });
}
var httpStart = function() {
    var self = this;
    server = http.createServer(function (req, res) {

        if(req.method=='POST' && consts.POST_URL[req.url]) {
            var body='';
            req.on('data', function (data) {
                body +=data;
            });
            req.on('end',function() {

                var params =  qs.parse(body);
                console.log(req.url,params);
                var result = {
                    status:0
                }
                if(req.url === "/hangup")
                {
                    if( params)
                    {
                        result.status = 1;
                        logDao.hangupLog({
                            params:JSON.stringify(params),
                            ctime:new Date(),
                            uuid:params.id,
                            fromphone:params.fromphone,
                            tovirtualnumber:params.topvirtualphone,
                            fromphoneguishudi:params.fromphoneguishudi,
                            torealphoneguishudi:params.torealphoenguishudi,
                            hung:params.hung,
                            torealphone:params.torealphone,
                            calltime:params.calltime,
                            receivetime:params.receivetime,
                            endtime:params.endtime,
                            recordfile:params.recordfile,
                            exptime:params.exptime,
                            avatime:params.avatime
                        },function ( err, data)
                        {

                        });

                        if(params.receivetime > params.calltime && params.id > 0)
                        {
                            orderDao.hangup(params.id,params.avatime, function ( err, res)
                            {
                                console.log('hangup',arguments);
                            });
                        }

                        if( params.exptime <= params.endtime || params.avatime == 0)
                        {
                            utils.virtualNumberClose('01001',params.id,function(data)
                            {
                                if(data)
                                {
                                    if( typeof data == 'string')
                                    {
                                        data = eval('('+data+')');
                                    }

                                    logDao.CloseVirtualNumberLog({
                                        time:new Date(),
                                        companycode:'01001',
                                        uuid:params.id,
                                        status:data.status
                                    }, function(){});
                                }

                            });
                        }
                    }
                    else
                    {
                        console.log("params is null",req.url);
                    }

                }
                else if(req.url === "/recordFileDownload")
                {
                    if( params)
                    {
                        result.status = 1;
                        logDao.recordfileLog({
                            params:JSON.stringify(params),
                            ctime:new Date(),
                            recordfilename:params.recordfilename,
                            recordfileurl:params.recordfileurl,
                            token:params.token
                        },function ( err, data)
                        {

                        });
                        //downLoading
                        if(params.recordfileurl)
                        {
                            utils.download_file_curl(params.recordfileurl + "&token=" + params.token);
                        }
                    }
                    else
                    {
                        console.log("params is null",req.url);
                    }
                }


                res.writeHead(200, "OK", {'Content-Type': 'text/html'});
                return res.end(JSON.stringify(result));
            });
        }
        else
        {
            res.writeHead(403);
            return res.end('Bad Pager');
        }
    })
    server.listen(port);
    server.addListener("connection",function(socket) {
        socket.setTimeout(timeout);
    });
    console.log('Http server start at port '  + port);
}
