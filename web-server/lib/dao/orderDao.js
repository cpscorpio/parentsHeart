/**
 * Created by chenpeng on 14-3-7.
 */


var orderDao = module.exports;

var async = require('async');
var mysql = require('./mysql/mysql').init();
var orderFindDoctor = require('../entity/orderFindDoctor');
var departmentDao = require('./departmentDao');
var diseaseDao = require('./diseaseDao');
var orderGuaHao = require('../entity/orderGuaHao');
var orderService = require('../entity/orderService');
var consts = require('../consts/consts');

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;

orderDao.addServiceOrder = function (type,order_id, service_id,service_name,user_id,user_phone_number, cb)
{
    var sql = "insert into  order_service (type, order_id, service_id,service_name, ctime,user_id,user_phone_number,status) values " +
        "( ?, ?, ?, ?, ?, ?, ?,?)";
    var args = [ type, order_id, service_id,service_name, new Date(),user_id, user_phone_number, 0];
    mysql.query( sql, args, function ( err, res)
    {
        console.log( err, res);
        cb( err, res);
    });

}

orderDao.getFindDoctorOrder = function ( id,cb)
{
    var sql = "select * from order_find_doctor where user_id=? ";
    var args = [id];
    mysql.query( sql, args, function ( err, res)
    {
        console.log( err, res);
        if(!err)
        {
            var arr = [];

            if( res && res.length)
            {
                for ( var i = 0; i<  res.length ; i++)
                {
                    arr.push( new orderFindDoctor(res[i]).simple());
                }
            }
            cb( null, arr);
        }else
        {
            cb( err, null);
        }
        //cb( err, res);
    });
}
orderDao.getFindDoctorOrderByOrderId = function(id, orderId, cb)
{
    var sql = "select * from order_find_doctor where order_id=? ";
    var args = [orderId];
    if( id)
    {
        sql = sql +  " and user_id=? ";
        args.push(id);
    }

    mysql.query( sql, args, function ( err, res)
    {
        console.log( err, res);
        if(!err)
        {
            async.parallel([
                function ( callback)
                {
                    departmentDao.getDepartments(function ( err,list)
                    {
                        callback( err, list);
                    });
                },
                function ( callback)
                {
                    diseaseDao.getDiseases( function( err, list)
                    {
                        callback( err, list)
                    });
                }
            ],
                function(error, results)
                {
                    var departments = results[0];
                    var diseases = results[1];
                    var arr = [];
                    if( res && res.length)
                    {
                        for ( var i = 0; i<  res.length ; i++)
                        {
                            var order = new orderFindDoctor(res[i]);
                            if(order.status == 1)
                            {
                                order.department = departments[order.department].name;
                                order.disease = diseases[order.disease].name;
                                order.type =  consts.TYPE_NAME[order.type];
                            }
                            arr.push( order.toJSON());
                        }
                    }
                    cb( null, arr);
                }
            );


        }else
        {
            cb( err, null);
        }
        //cb( err, res);
    });
}

orderDao.getGuaHaoOrder = function ( id,cb)
{
    var sql = "select * from order_registration where user_id=? ";
    var args = [id];
    mysql.query( sql, args, function ( err, res)
    {
        console.log( err, res);
        if(!err)
        {
            var arr = [];
            if( res && res.length)
            {
                for ( var i = 0; i<  res.length ; i++)
                {
                    arr.push( new orderGuaHao(res[i]).simple());
                }
            }
            cb( null, arr);
        }else
        {
            cb( err, null);
        }
    });
}

orderDao.getGuaHaoOrderByOrderId = function (id, orderId, cb)
{
    var sql = "select * from order_registration where user_id=? and order_id=?";
    var args = [id,orderId];
    mysql.query( sql, args, function ( err, res)
    {
        console.log( err, res);
        if(!err)
        {
            var arr = [];
            if( res && res.length)
            {
                for ( var i = 0; i<  res.length ; i++)
                {
                    arr.push( new orderGuaHao(res[i]).toJSON());
                }
            }
            cb( null, arr);
        }else
        {
            cb( err, null);
        }
    });
}

orderDao.getServiceOrder = function ( id,cb)
{
    var sql = "select * from order_service where user_id=? ";
    var args = [id];
    mysql.query( sql, args, function ( err, res)
    {
        console.log("select * from order_service", err, res);
        if(!err)
        {
            var arr = [];
            if( res && res.length)
            {
                for ( var i = 0; i<  res.length ; i++)
                {
                    arr.push( new orderService(res[i]).simple());
                }
            }
            cb( null, arr);
        }else
        {
            cb( err, null);
        }
    });
}
orderDao.getServiceOrderByOrderId = function ( id,orderId,cb)
{
    var sql = "select * from order_service where user_id=? and order_id=?";
    var args = [id, orderId];
    mysql.query( sql, args, function ( err, res)
    {
        console.log("select * from order_service", err, res);
        if(!err)
        {
            var arr = [];
            if( res && res.length)
            {
                for ( var i = 0; i<  res.length ; i++)
                {
                    arr.push( new orderService(res[i]).toJSON());
                }
            }
            cb( null, arr);
        }else
        {
            cb( err, null);
        }
    });
}