/**
 * Created by chenpeng on 14-2-26.
 */

var jobTitleDao = module.exports;
var utils = require('../util/utils');
var mysql = require('./mysql/mysql').init();

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;


jobTitleDao.add = function ( name, cb)
{
    var sql = "insert into  job_title ( name) values ( ?)";
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
jobTitleDao.del = function ( ids, cb)
{
    var sql = 'delete from job_title where id in (?)';
    var args = [ids];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}
jobTitleDao.alter = function ( id, name,cb)
{
    var sql = 'update job_title set name=? where id=?';
    var args = [name, id];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}
jobTitleDao.getjobTitles = function ( cb)
{
    var sql = 'select * from job_title';
    mysql.query(sql, null, function ( err, res)
    {
        var jobTitles = [];
        try
        {
            if (err)
            {
                log.error('select * from job_title failed !' + err.stack);

            }
            else
            {
                for ( var i = 0; i < res.length ; i ++)
                {
                    var jobTitle = {
                        id:res[i].id,
                        name:res[i].name
                    };
                    jobTitles[jobTitle.id] =  jobTitle;
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
            cb(err, jobTitles);
        }


    });
}