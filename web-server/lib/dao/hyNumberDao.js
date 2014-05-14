/**
 * Created by chenpeng on 14-3-3.
 */

var hyNumberDao = module.exports;

var mysql = require('./mysql/mysql').init();
var utils = require('../util/utils')

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;

hyNumberDao.getHaoyuanByCity = function ( city, params, cb)
{
    var sql = "select * from haoyuan_number where hospital in (select id from haoyuan_hospital where city=?) ";
    var args = [city];
    if(params)
    {
        for( var k in params)
        {
            sql = sql +' and ' + k + '=? ';
            args.push(params[k]);
        }
    }

    mysql.query( sql, args, function ( err, res)
    {
        console.log( err, res);
        if( !err && res )
        {
            var haoyuans = [];
            for( var i = 0; i < res.length; i++)
            {
                var haoyuan = {
                    id:res[i].id,
                    hospital:res[i].hospital,
                    subject:res[i].subject,
                    type:res[i].type,
                    date:utils.DateFormat(res[i].date,'yyyy-MM-dd') ,
                    doctor:res[i].doctor,
                    number:res[i].number
                }
                haoyuans.push(haoyuan);
            }
            cb(null, haoyuans);
        }
        else{
            cb ( err, null);
        }
    });
}


hyNumberDao.add = function (params, cb)
{
    var sql = "insert into  haoyuan_number (hospital,subject,type,date,doctor,number) values(?,?,?,?,?,?)";
    if(params && params.hospital && params.subject && params.type
        && params.date && params.doctor && params.number)
    {
        var args = [params.hospital,params.subject,params.type, params.date, params.doctor,params.number];
        mysql.query( sql, args, function ( err, res)
        {
            console.log( err, res);
            if( !err && res )
            {
                cb( null, {
                    id:res.insertId,
                    hospital:params.hospital,
                    subject:params.subject,
                    type:params.type,
                    date:params.date,
                    doctor:params.doctor,
                    number:params.number
                })
            }
            else{
                cb ( err, null);
            }
        });
    }
    else
    {
        cb ( new Error('no params'), null);
    }

}
hyNumberDao.del = function ( ids, cb)
{
    var sql = 'delete from haoyuan_number where id in (?)';
    var args = [ids];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}
hyNumberDao.alter = function ( id, doctor,number, cb)
{
    var sql = 'update haoyuan_number set doctor=?, number=? where id=?';
    var args = [doctor, number, id];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}