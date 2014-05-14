/**
 * Created by chenpeng on 14-2-21.
 */

var hyTypeDap = module.exports;
var utils = require('../util/utils');
var mysql = require('./mysql/mysql').init();

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;


hyTypeDap.add = function (name, cb)
{
    var sql = "insert into  haoyuan_type ( name) values ( ?)";
    var args = [name];
    mysql.query( sql, args, function ( err, res)
    {
        console.log( err, res);
        if( !err && res )
        {
            cb( null, {
                id:res.insertId,
                name:name
            })
        }
        else{
            cb ( err, null);
        }
    });
}
hyTypeDap.del = function ( ids, cb)
{
    var sql = 'delete from haoyuan_type where id in (?)';
    var args = [ids];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}
hyTypeDap.alter = function ( id, name, cb)
{
    var sql = 'update haoyuan_type set name=? where id=?';
    var args = [name, id];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}
hyTypeDap.getTypes = function ( cb)
{
    var sql = 'select * from haoyuan_type';
    mysql.query(sql, null, function ( err, res)
    {
        var types = [];
        try
        {
            if (err)
            {
                log.error('select * from haoyuan_type failed !' + err.stack);

            }
            else
            {
                for ( var i = 0; i < res.length ; i ++)
                {
                    var type = {
                        id:res[i].id,
                        name:res[i].name
                    };
                    types[type.id] =  type;
                }
            }
        }
        catch ( e)
        {
            log.error(e.stack);
            utils.sendMail(e.message, e.stack);
            err = e;
        }
        finally
        {
            cb(err, types);
        }


    });
}