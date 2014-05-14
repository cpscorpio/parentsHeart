/**
 * Created by cp on 1/20/14.
 */
var logger = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var pomelo = require('pomelo');

var consts = require('../consts/consts');
var utils = require('../util/utils');

var UserEntryLog = require('../entity/userEntryLog')

logDao = module.exports;

logDao.newEntryLog = function (log, cb)
{
    var userLog = new UserEntryLog(log);
    var sql = "insert into user_entry_log (uid,device_token,client,version) " +
               "values ( ?, ?, ?, ?)";
    var args = [userLog.uid, userLog.device_token, userLog.client, userLog.version];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {

        if(err)
        {
            logger.error( " insert user_entry_log error \n", err);
            cb(err, null);
        }
        else
        {
            logger.error(" insert user_entry_log success! \n", res);
            cb( null, true);
        }
    });
}

logDao.OpenVirtualNumberLog = function ( params, cb)
{
    logDao.addLog("open_virtualnumber_log", params,function (err, res)
    {
        cb( err, res);
    })
}
logDao.CloseVirtualNumberLog = function ( params, cb)
{
    logDao.addLog("close_virtualnumber_log", params,function (err, res)
    {
        cb( err, res);
    })
}
logDao.recordfileLog = function ( params, cb)
{
    logDao.addLog("recordfile_log", params,function (err, res)
    {
        cb( err, res);
    })
}
logDao.hangupLog = function ( params, cb)
{
    logDao.addLog("hangup_log", params,function (err, res)
    {
        cb( err, res);
    })
}
logDao.addLog = function ( table, params, cb)
{
    var sql = "insert into " + table ;
    var args = [];
    var p = "";
    var v = "";
    for ( var k in params)
    {
        p = p + k + ',';
        v = v + "?,";
        args.push(params[k]);
    }
    sql = sql + " (" + p.slice(0,-1) + ") values (" + v.slice(0,-1) + ")";
    logger.info(sql, args.toString());
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {

        if(err)
        {
            logger.error( " insert user_entry_log error \n", err.stack);
            cb(err, null);
        }
        else
        {
            logger.error(" insert user_entry_log success! \n", JSON.stringify(res));
            cb( null, true);
        }
    });
}