/**
 * Created by chenpeng on 14-2-17.
 */

var mysql = require('./mysql/mysql').init();

var userDao = module.exports;

userDao.createUser = function ( username, password, cb)
{
    var sql = 'insert into services ( name, uid, password, service_name) values ( ?, ?, ?, ?)';
    var args = [ username, username, password, '客服'];
    mysql.query ( sql, args, function ( err, res)
    {
        if ( err !== null)
        {
            cb ( { code:err.code, msg:err.message}, null);
        }
        else
        {
            var userId = res.insertId;
            var user = { id: userId, uid:username, password:password};
            cb ( null, user);
        }
    });
};

userDao.getUser = function ( username, cb)
{
    var sql = 'select * from services where name = ?';
    var args = [ username];
    mysql.query ( sql, args, function ( err, res)
    {
        if ( err)
        {
            cb ( err.message, null);
        }
        else
        {
            if ( res && res.length === 1)
            {
                var rs = res[0];
                cb ( null, rs);
            }
            else
            {
                cb ( 'user not exist' , null);
            }
        }
    });
};

