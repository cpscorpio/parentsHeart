/**
 * Created by chenpeng on 14-3-6.
 */
var mysql = require('./../../../web-server/lib/dao/mysql/mysql').init();

var serviceDao = module.exports;

serviceDao.check = function ( uid, cb)
{
    var sql = 'select * from services where uid=?;';
    var args = [ uid];
    mysql.query ( sql, args, function ( err, res)
    {
        if( !err && res)
        {
            cb(null);
        }
        else
        {
            cb(1);
        }
    });
}