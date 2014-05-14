/**
 * Created by chenpeng on 14-3-17.
 */

var recordDao = module.exports;

var mysql = require('./mysql/mysql').init();
var hangupLog = require('../entity/hangupLog');

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;

recordDao.getRecordByUUID = function ( uuid, cb)
{
    var sql = "select * from hangup_log where uuid=? ";
    var args = [uuid];
    mysql.query( sql, args, function ( err, res)
    {
        console.log( err, res);
        if(!err)
        {
            var arr = [];
            if( res && res.length)
            {
                for ( var i = 0; i<  res.length ; i++)
                {
                    arr.push( new hangupLog(res[i]).toJSON());
                }
            }
            cb( null, arr);
        }else
        {
            cb( err, null);
        }
    });
}

recordDao.getRecordByPhoneNumber = function ( phoneNumber, cb)
{
    var sql = "select b.order_id, a.id, a.fromphone, a.calltime, a.torealphone, a.endtime, a.receivetime,a.hung,a.exptime " +
        "from hangup_log a,order_find_doctor b where  b.uuid=a.uuid and ( a.fromphone=? or a.torealphone=?)";
    var args = [phoneNumber,phoneNumber];
    mysql.query( sql, args, function ( err, res)
    {
        console.log( err, res);
        if(!err)
        {
            var arr = [];
            if( res && res.length)
            {
                for ( var i = 0; i<  res.length ; i++)
                {
                    arr.push( new hangupLog(res[i]).toJSON());
                }
            }
            cb( null, arr);
        }else
        {
            cb( err, null);
        }
    });
}