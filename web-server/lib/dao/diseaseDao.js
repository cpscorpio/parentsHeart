/**
 * Created by chenpeng on 14-2-25.
 */

var diseaseDao = module.exports;
var utils = require('../util/utils');
var mysql = require('./mysql/mysql').init();

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;


diseaseDao.add = function (department_id, name, cb)
{
    var sql = "insert into  disease ( name, department_id) values ( ?, ?)";
    var args = [name, department_id];
    mysql.query( sql, args, function ( err, res)
    {
        console.log( err, res);
        if( !err && res )
        {
            cb( null, {
                id:res.insertId,
                name:name,
                department_id:department_id
            })
        }
        else{
            cb ( err, null);
        }
    });
}
diseaseDao.del = function ( ids, cb)
{
    var sql = 'delete from disease where id in (?)';
    var args = [ids];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}
diseaseDao.alter = function ( id, name, department_id, cb)
{
    var sql = 'update disease set name=?, department_id=?  where id=?';
    var args = [name, department_id, id];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}
diseaseDao.getDiseases = function ( cb)
{
    var app = require('../../app');
    var diseases = app.get('__diseases');
    if( diseases)
    {
        cb( null, diseases);
        return ;
    }

    var sql = 'select * from disease';
    mysql.query(sql, null, function ( err, res)
    {
        diseases = new Array();
        try
        {
            if (err)
            {
                log.error('select * from disease failed !' + err.stack);

            }
            else
            {
                for ( var i = 0; i < res.length ; i ++)
                {
                    var disease = {
                        id:res[i].id,
                        name:res[i].name,
                        department_id:res[i].department_id
                    };
                    diseases[disease.id] =  disease;
                }
                if( diseases && diseases.length > 0)
                {
                    app.set('__diseases',diseases);
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
            cb(err, diseases);
        }


    });
}