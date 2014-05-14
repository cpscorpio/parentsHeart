/**
 * Created by chenpeng on 14-2-21.
 */

var hySubjectDao = module.exports;
var utils = require('../util/utils');
var mysql = require('./mysql/mysql').init();

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;


hySubjectDao.add = function (name, cb)
{
    var sql = "insert into  haoyuan_subject ( name) values ( ?)";
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
hySubjectDao.del = function ( ids, cb)
{
    var sql = 'delete from haoyuan_subject where id in (?)';
    var args = [ids];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}
hySubjectDao.alter = function ( id, name, cb)
{
    var sql = 'update haoyuan_subject set name=? where id=?';
    var args = [name, id];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}
hySubjectDao.getSubjects = function ( cb)
{
    var sql = 'select * from haoyuan_subject';
    mysql.query(sql, null, function ( err, res)
    {
        var subjects = [];
        try
        {
            if (err)
            {
                log.error('select * from haoyuan_subject failed !' + err.stack);

            }
            else
            {
                for ( var i = 0; i < res.length ; i ++)
                {
                    var subject = {
                        id:res[i].id,
                        name:res[i].name
                    };
                    subjects[subject.id] =  subject;
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
            cb(err, subjects);
        }


    });
}