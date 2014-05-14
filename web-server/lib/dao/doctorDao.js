/**
 * Created by chenpeng on 14-3-18.
 */

var mysql = require('./mysql/mysql').init();

var doctorDao = module.exports;

var Doctor = require('../entity/doctor');

doctorDao.addDoctor = function ( doctor, cb)
{
    var sql = 'insert into doctor ( name, uid, job_title, hospital, departments, diseases, device_token, work_phone_number,' +
        'self_phone_number, price, ctime)' +
        ' values ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var args = [ doctor.name, doctor.uid, doctor.job_title, doctor.hospital, doctor.department, doctor.diseases, doctor.device_token
                , doctor.work_phone_number, doctor.self_phone_number, doctor.price,new Date()];
    mysql.query ( sql, args, function ( err, res)
    {
        if ( err !== null)
        {
            cb ( { code:err.code, msg:err.message}, null);
        }
        else
        {
            var doctorId = res.insertId;
            var doctor_ = {
                id: doctorId
            };
            cb ( null, doctor_);
        }
    });
};


doctorDao.alter = function ( where, params, cb)
{

    var sql = "update doctor set";
    var args = [];
    for (var k in params)
    {
        sql = sql + " " + k + "=?,";
        args.push(params[k]);
    }
    sql = sql.slice(0,-1) + " where ";
    for ( var k in where)
    {
        sql = sql + " " + k + "=? and";
        args.push(where[k]);
    }
    sql = sql.slice(0,-3);
    console.log(sql,args);
    mysql.query( sql, args, function ( err, res)
    {
        cb(err,res);
    });
}

doctorDao.del = function ( ids, cb)
{
    var sql = 'delete from doctor where id in (?)';
    var args = [ids];
    mysql.query( sql, args, function ( err, res)
    {
        cb( err, res);
    });
}

doctorDao.getDoctorById = function ( id, cb)
{
    var sql = 'select * from doctor where id = ?';
    var args = [ id];
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
                var rs = new Doctor(res[0]);
                cb ( null, rs.toJSON());
            }
            else
            {
                cb ( 'doctor not exist' , null);
            }
        }
    });
};

doctorDao.getDoctors = function ( cb)
{
    var sql = 'select * from doctor';
    mysql.query ( sql, null, function ( err, res)
    {
        if ( err)
        {
            cb ( err.message, null);
        }
        else
        {
            if ( res && res.length > 0)
            {
                var list = [];
                for(var i = 0; i < res.length; i++)
                {
                    list.push(new Doctor(res[i]).simple());
                }
                cb ( null, list);
            }
            else
            {
                cb ( 'doctor not exist' , null);
            }
        }
    });
}
