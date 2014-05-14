/**
 * Created by chenpeng on 14-3-4.
 */

var clientUserDao = module.exports;

var mysql = require('./mysql/mysql').init();

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;

clientUserDao.getUserInfo = function ( phoneNumber, cb)
{
    var sql = "select * from user where phone_number=?";
    var args = [phoneNumber];
    mysql.query(sql, args, function ( err, res)
    {
        console.log(err, res);
        if(!err && res && res.length == 1)
        {
            cb ( err, res[0]);
        }
        else
        {
            cb (err, res);
        }
    });
}