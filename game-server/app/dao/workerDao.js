/**
 * Created by cp on 1/22/14.
 */

/**
 * Created by cp on 1/8/14.
 */
var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var pomelo = require('pomelo');
var async = require('async');

var consts = require('../consts/consts');
var utils = require('../util/utils');

var Worker = require('../entity/worker');

workerDao = module.exports;




workerDao.getWorkerById = function ( id, cb)
{
    var sql = "select * from worker where id = ?";
    var args = [id];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {

        var worker;
        try
        {
            if( !err && res && res.length == 1)
            {
                worker  = new Worker(res[0]);

            }
            else if(err)
            {
                log.error(err.message,err.stack);
            }
        }
        catch (e)
        {
            err = e;
            log.error(e.stack);
            utils.sendMail(e.message, e.stack);
        }
        finally
        {
            utils.invokeCallback(cb, err, worker);
        }
    });
}

workerDao.getWorkerByUid = function ( uid, cb)
{
    var sql = "select * from worker where phone_number = ?";
    var args = [uid];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        var worker;
        try
        {
            if( !err && res && res.length == 1)
            {
                worker  = new Worker(res[0]);
            }
            else if(err)
            {
                log.error(err.message,err.stack);
            }
        }
        catch (e)
        {
            log.error(e.stack);
            utils.sendMail(e.message, e.stack);
            err = e;
        }
        finally
        {
            cb( err, worker);
        }
    });
}

workerDao.addWorker = function ( phone_number, name,city, cb)
{
    var sql = "insert into worker ( phone_number, name, city) " +
        "values ( ?, ? , ?) ";
    var args = [
        phone_number,
        name,
        city
    ]

    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {

        if(err)
        {
            log.error( " insert worker error \n", err.message,err.stack);
            cb(err, null);
        }
        else
        {
            log.error(" insert worker success! \n", res.message,err.stack);
            cb( null, true);
        }
    });
}
workerDao.getOnlineWorkers = function ( city, cb) {
    var channelService = pomelo.app.get('channelService');
    var channel = channelService.getChannel(consts.USER.Worker,false);
    if(channel == undefined)
    {
        cb( consts.ERROR.NO_WORKER_ONLINE,[]);
        return;
    }
    if( typeof cb == 'function')
    {
        var sql = "select * from worker where city = ? and online = 1";
        var args = [city];
        pomelo.app.get('dbclient').query( sql, args, function ( err, res)
        {
            var workers ;
            console.log(res);
            try
            {
                if( !err && res && res.length > 0)
                {
                    workers = new Array();
                    for( var i = 0; i < res.length; i++)
                    {
                        var uid = res[i].phone_number + '*' + consts.USER.Worker;
                        var member = channel.getMember(uid);
                        if( member)
                        {
                            var sid = member['sid'];
                            workers.push({
                                uid:uid,
                                sid:sid
                            })
                        }
                    }
                }
                else if( err)
                {
                    log.error(err.message,err.stack);
                }
            }
            catch (e)
            {
                log.error(e.stack);
                utils.sendMail(e.message, e.stack);
                err = e;
            }
            finally
            {
                console.log(workers);
                utils.invokeCallback( cb, err, workers);
            }

        });
    }
    else
    {
        cb( consts.ERROR.MISSING_PARAMS, null);
    }
}

workerDao.setOnline = function ( phone_number, online, cb) {
    var sql = "update worker set online = ? where phone_number = ?";
    var args = [online, phone_number];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        if( err)
        {
            cb( err, false);
        }
        else
        {
            cb( null, true);
        }
    });
}
