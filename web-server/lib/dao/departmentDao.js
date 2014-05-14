/**
 * Created by chenpeng on 14-2-21.
 */


var departmentDao = module.exports ;

var mysql = require('./mysql/mysql').init();
var utils = require('../util/utils');

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;


departmentDao.add = function (category, name, cb)
{
    var sql = "insert into  department ( name, type) values ( ?, ?)";
    var args = [name, category];
    mysql.query( sql, args, function ( err, res)
    {
        console.log( err, res);
        if( !err && res )
        {
            cb( null, {
                id:res.insertId,
                name:name,
                category:category
            })
        }
        else{
            cb ( err, null);
        }
    });
}
departmentDao.del = function ( ids, cb)
{
    var sql = 'delete from department where id in (?)';
    var args = [ids];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}
departmentDao.alter = function ( id, name, type, cb)
{
    var sql = 'update department set name=?, type=?  where id=?';
    var args = [name, type, id];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}
departmentDao.getDepartments = function ( cb)
{
    var app = require('../../app');
    var departments = app.get('__departments');
    if( departments)
    {
        cb( null, departments);
        return ;
    }

    var sql = 'select * from department';
    mysql.query(sql, null, function ( err, res)
    {
        departments = new Array();
        try
        {
            if (err)
            {
                log.error('select * from department failed !' + err.stack);

            }
            else
            {
                for ( var i = 0; i < res.length ; i ++)
                {
                    var department = {
                        id:res[i].id,
                        name:res[i].name,
                        category:res[i].type
                    };
                    departments[department.id] =  department;
                }
                if( departments && departments.length > 0)
                {
                    app.set('__departments',departments);
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
            cb(err, departments);
        }


    });
}