/**
 * Created by chenpeng on 14-2-18.
 */

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var pomelo = require('pomelo');

var consts = require('../consts/consts');
var utils = require('../util/utils');

var workerOrder = require('../entity/workerOrder');

var workerOrderDao = module.exports;

workerOrderDao.insert = function ( orderId, worker, cb)
{
    var sql = 'insert into worker_order ( order_id, worker) values ( ?, ?)';
    var args = [ orderId, worker];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        if( err)
        {
            cb ( err, null);
        }
        else
        {
            cb ( null, res.insertId)
        }
    });
};

workerOrderDao.refuse = function ( orderId, worker, reason, cb)
{
    workerOrderDao.set( orderId, worker, {
            reason:reason,
            refuse:1
        }, function ( err, res)
        {
            cb ( err, res ? true :false);
        }
    );
}

workerOrderDao.accept = function ( orderId, worker, cb)
{
    workerOrderDao.set( orderId, worker, {
            refuse:0
        }, function ( err, res)
        {
            cb ( err, res ? true :false);
        }
    );
}

workerOrderDao.getOrder = function ( params, cb)
{
    if( params)
    {
        var sql = 'select * from worker_order where ';
        var args = [];
        for ( var k in params)
        {
            sql = sql + k + '=? and ';
            args.push(params[k]);
        }
        sql = sql.slice(0, -4);
        pomelo.app.get( 'dbclient').query ( sql, args, function ( err, res)
        {
            if( err)
            {
                log.error ( err.stack);
                cb ( err, null);
            }
            else
            {
                console.log( 'res', res);
                var orders = [];
                if ( res && res.length > 0)
                {
                    for(var i = 0; i< res.length; i++)
                    {
                        var order = new workerOrder(res[i]);
                        orders.push(order);
                    }

                }
                console.log(orders);
                cb ( err, orders);
            }

        });
    }
    else
    {
        cb ( consts.ERROR.MISSING_PARAMS, null);
    }
}

workerOrderDao.set = function ( orderId, worker, params, cb)
{
    if( params)
    {
        var sql = 'update worker_order set ';
        var args = [];
        for ( var k in params)
        {
            sql = sql + ' ' + k + '=?,';
            args.push(params[k]);
        }

        sql = sql.slice(0, -1) + ' where order_id=? and worker=?';
        args.push ( orderId, worker);
        pomelo.app.get( 'dbclient').query ( sql, args, function ( err, res)
        {
            if( err) log.error ( err.stack);
            console.log( 'res', res);
            cb ( err, res);
        });
    }
    else
    {
        cb ( consts.ERROR.MISSING_PARAMS, null);
    }
}
