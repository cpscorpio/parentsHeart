/**
 * Created by chenpeng on 14-3-3.
 */

var hyHospitalDao = module.exports;
var utils = require('../util/utils');
var mysql = require('./mysql/mysql').init();

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;


hyHospitalDao.add = function (name,city, cb)
{
    var sql = "insert into  haoyuan_hospital ( name,city) values ( ?,?)";
    var args = [name,city];
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
hyHospitalDao.del = function ( ids, cb)
{
    var sql = 'delete from haoyuan_hospital where id in (?)';
    var args = [ids];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}
hyHospitalDao.alter = function ( id, name,city, cb)
{
    var sql = 'update haoyuan_hospital set name=?,city=? where id=?';
    var args = [name, city, id];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}
hyHospitalDao.getHospitals = function ( cb)
{
    var sql = 'select * from haoyuan_hospital';
    mysql.query(sql, null, function ( err, res)
    {
        var hospitals = [];
        try
        {
            if (err)
            {
                log.error('select * from haoyuan_hospital failed !' + err.stack);

            }
            else
            {
                for ( var i = 0; i < res.length ; i ++)
                {
                    var hospital = {
                        id:res[i].id,
                        name:res[i].name,
                        city:res[i].city
                    };
                    hospitals[hospital.id] =  hospital;
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
            cb(err, hospitals);
        }


    });
}