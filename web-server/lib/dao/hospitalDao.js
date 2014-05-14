/**
 * Created by chenpeng on 14-2-21.
 */

var hospitalDao = module.exports;
var utils = require('../util/utils');
var mysql = require('./mysql/mysql').init();

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;

hospitalDao.add = function ( name, city, departments ,cb)
{
    var app = require('../../app');
    app.set('__hospitals',null);
    var sql = "insert into  hospital ( name, city, departments) values ( ?, ?, ?)";
    var args = [name, city, departments];
    mysql.query( sql, args, function ( err, res)
    {
        console.log( err, res);
        if( !err && res )
        {
            var id = res.insertId;
            console.log(id);
            hospitalDao.alter({id:id},{code:id},function( err, res)
            {
                cb( err, res);
            });
        }
        else{
            cb ( err, null);
        }
    });
}

hospitalDao.del = function ( code, cb)
{
    var app = require('../../app');
    app.set('__hospitals',null);
    var sql = 'delete from hospital where code=?';
    var args = [code];
    mysql.query( sql, args, function ( err, res)
    {
        cb( err, res);
    });
}
hospitalDao.alter = function ( where, params, cb)
{
    var app = require('../../app');
    app.set('__hospitals',null);
    console.log(where,params);
    var sql = "update hospital set";
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
hospitalDao.getById = function( id, cb)
{
    var sql = "select * from hospital where code=?";
    var args = [id];
    mysql.query( sql, args, function ( err, res)
    {
        if( !err && res && res.length > 0)
        {
            cb ( null, {
                id:res[0].id,
                code:res[0].code,
                departments:res[0].departments.split(','),
                city:res[0].city,
                province:res[0].province,
                name:res[0].name
            })
        }
        else{
            cb ( err, null);
        }
    });
}

hospitalDao.getHospitalsMap = function ( cb)
{
    var app = require('../../app');
    var hospitals = app.get('__hospitals');
    if( hospitals)
    {
        cb( null, hospitals);
        return ;
    }

    var sql = "select * from hospital";
    mysql.query( sql , null, function ( err, res)
    {
        hospitals = new Array();
        try
        {
            if( !err && res && res.length > 0)
            {
                for ( var i = 0; i < res.length; i ++)
                {
                    var hospital = {
                        id:res[i].id,
                        code:res[i].code,
                        departments:res[i].departments.split(','),
                        city:res[i].city,
                        province:res[i].province,
                        name:res[i].name
                    };

                    hospitals[ hospital.id] = hospital;
                }
                if( hospitals && hospitals.length > 0)
                {
                    app.set('__hospitals',hospitals);
                }
            }
            else if(err)
            {
                log.error(err.stack);
            }
        }
        catch (e)
        {
            err = e;
            log.error(e.stack);
            utils.sendMail(e.message, e.stack);
        }
        finally
        {
            cb( err, hospitals);
        }
    } );
}