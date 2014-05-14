/**
 * Created by cp on 1/15/14.
 */

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var pomelo = require('pomelo');
var async = require('async');
var consts = require('../consts/consts');
var utils = require('../util/utils');
var workerOrderDao = require('./workerOrderDao');
var logDao = require('./logDao');
var OrderFindDoctor = require('../entity/order_find_doctor');
var OrderRegistration = require('../entity/order_registration');

orderDao = module.exports;


orderDao.addOrderFindDoctor = function(order, cb)
{
    var sql = "insert into order_find_doctor ( user_id,user_name,type, user_contact, disease,disease_desc, price, department, order_id,status,doctors,ctime) " +
        "values ( ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?) ";
    var args = [
        order.user_id,
        order.user_name,
        order.category,
        order.user_contact,
        order.disease,
        order.disease_desc,
        order.price,
        order.department,
        order.order_id,
        order.status,
        order.doctors.toString(),
        new Date()
    ];
    log.info(args.toString());
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {

        if(err)
        {
            log.error( " insert order_find_doctor error \n", err);
            cb(err, null);
        }
        else
        {
            log.error(" insert order_find_doctor success! \n", res);
            cb( null, true);
        }
    });

}

orderDao.addOrderRegistration = function ( order, cb)
{
    var sql = "insert into order_registration ( order_id, user_id, status, city, type, category, department, " +
        "hospital, workers, " +
        "user_contact, birthday, id_card, sex, name, need_time, need_medical_record, have_health_insurance, ctime) " +
        "values ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ) ";
    var args = [
        order.order_id,
        order.user_id,
        order.status,
        order.city,
        order.type,
        order.category,
        order.department,
        order.hospital,
        order.workers.toString(),
        order.user_contact,
        order.birthday,
        order.id_card,
        order.sex,
        order.name,
        order.need_time,
        order.need_medical_record,
        order.have_health_insurance,
        new Date()
    ];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        if(err)
        {
            log.error( " insert order_registration error \n", err);
            cb(err, null);
        }
        else
        {
            log.error(" insert order_registration success! \n", res);
            cb( null, true);
        }
    });
}
orderDao.setOrderRegistration = function( where, key, params, args, cb)
{

    if(params && params.length > 0)
    {
        var sql = "update order_registration set ";
        for( var i = 0; i < params.length; i++)
        {
            if(i > 0)
            {
                sql = sql + " , ";
            }
            sql = sql + params[i] + " = ? ";
        }
        sql = sql + " where " + where + " = ? ";
        args.push(key);
        pomelo.app.get('dbclient').query( sql, args, function ( err, res)
        {
            if( err)
            {
                cb(err,null);
            }
            else
            {
                cb(null, true);
            }
        })
    }
    else
    {
        cb(consts.ERROR.MISSING_PARAMS)
    }

}
orderDao.setOrderFindDoctor = function( where, key, params, args, cb)
{

    if(params && params.length > 0)
    {
        var sql = "update order_find_doctor set ";
        for( var i = 0; i < params.length; i++)
        {
            if(i > 0)
            {
                sql = sql + " , ";
            }
            sql = sql + params[i] + " = ? ";
        }
        sql = sql + " where " + where + " = ? ";
        args.push(key);
        pomelo.app.get('dbclient').query( sql, args, function ( err, res)
        {
            if( err)
            {
                cb(err,null);
            }
            else
            {
                cb(null, true);
            }
        })
    }
    else
    {
        cb(consts.ERROR.MISSING_PARAMS)
    }

}

orderDao.getOrderRegistrationByKey = function (params, args, cb)
{
    if(params && params.length > 0)
    {
        var sql = "select * from order_registration where ";
        for( var i = 0; i < params.length; i++)
        {
            if(i > 0)
            {
                sql = sql + " and ";
            }
            sql = sql + params[i] + " = ? ";
        }
        sql = sql + " order by ctime desc";
        pomelo.app.get('dbclient').query( sql, args, function ( err, res)
        {
            if( err)
            {
                cb(err,null);
            }
            else
            {
                var orders = new Array();
                if(res && res.length > 0)
                {
                    for( var i = 0; i< res.length; i++)
                    {
                        var order = new OrderRegistration(res[i]);
                        orders.push(order.data());
                    }
                }
                cb(null, orders);
            }
        })
    }
    else
    {
        cb(consts.ERROR.MISSING_PARAMS)
    }
}

orderDao.getOrderFindDoctorByKey = function (params, args, cb)
{
    if(params && params.length > 0)
    {
        var sql = "select * from order_find_doctor where ";
        for( var i = 0; i < params.length; i++)
        {
            if(i > 0)
            {
                sql = sql + " and ";
            }
            sql = sql + params[i] + " = ? ";
        }
        sql = sql + " order by ctime desc";
        pomelo.app.get('dbclient').query( sql, args, function ( err, res)
        {
            if( err)
            {
                cb(err,null);
            }
            else
            {
                var orders = new Array();
                var now = Math.ceil(new Date().getTime()/1000);
                var ids = [];
                if(res && res.length > 0)
                {
                    for( var i = 0; i< res.length; i++)
                    {
                        var order = new OrderFindDoctor(res[i]);

                        if(order.exptime < now && order.avatime > 0 && order.status == consts.ORDER_STATUS.Accepted && order.uuid > 0)
                        {
                            order.avatime = 0;
                            order.status = consts.ORDER_STATUS.NoComment;
                            ids.push(order.id);
                            utils.virtualNumberClose('01001',order.uuid, function( data)
                            {
                                if(data)
                                {
                                    if( typeof data == 'string')
                                    {
                                        data = eval('('+data+')');
                                    }

                                    logDao.CloseVirtualNumberLog({
                                        time:new Date(),
                                        companycode:'01001',
                                        uuid:order.uuid,
                                        status:data.status
                                    },function(err,res)
                                    {
                                        if( err) log.error(err.stack);
                                    })
                                }
                            });
                        }

                        orders.push(order.data());
                    }
                }

                cb(null, orders);
                if( ids && ids.length > 0)
                {
                    //do update
                    sql = 'update order_find_doctor set avatime=0,status=? where id in (' + ids.toString() +')';
                    args = [consts.ORDER_STATUS.NoComment];
                    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
                    {
                        if( err) log.error(err.stack);
                        console.log(res);
                    });
                }
            }
        })
    }
    else
    {
        cb(consts.ERROR.MISSING_PARAMS)
    }
}
/*
orderDao.getOrderRegistration = function( cb)
{
    var  sql = " select * from order_registration order by ctime desc";
    pomelo.app.get('dbclient').query( sql, null, function ( err, res)
    {
        var orders = new Array();
        try
        {
            if( !err && res && res.length > 0)
            {
                for ( var i = 0; i < res.length; i++)
                {
                    var order = new OrderRegistration( res[0]);
                    orders.push(order);
                }
            }
            else if( err)
            {
                log.error(err);
            }
        }
        catch (e)
        {
            log.error(e);
            err = e;
        }
        finally
        {
            console.log(orders);
            utils.invokeCallback( cb, err, orders);
        }
    });
}
*/
/*
orderDao.getOrderFindDoctor = function( cb)
{
    var  sql = " select * from order_find_doctor order by ctime desc";
    pomelo.app.get('dbclient').query( sql, null, function ( err, res)
    {
        var orders = new Array();
        try
        {
            if( !err && res && res.length > 0)
            {
                for ( var i = 0; i < res.length; i++)
                {
                    var order = new OrderFindDoctor( res[0]);
                    orders.push(order);
                }
            }
            else if( err)
            {
                log.error(err);
            }
        }
        catch (e)
        {
            log.error(e);
            err = e;
        }
        finally
        {
            console.log(orders);
            utils.invokeCallback( cb, err, orders);
        }
    });
}
*/
orderDao.getRegistrationRecord = function (uid,count,orderby,begin, cb)
{


    async.parallel([
        function ( callback)
        {
            workerOrderDao.getOrder({ worker:uid}, function ( err, data)
            {
                console.log('workerOrderDao.getOrder',data);
                if( data && data.length > 0)
                {
                    var orders = {};
                    for ( var i = 0; i < data.length; i++)
                    {

                        orders['' + data[i].order_id] = data[i];
                    }
                    console.log(orders);
                    callback ( null, orders);
                }
                else
                {
                    if( err)
                    {
                        log.error(err.stack);
                    }
                    callback (err, data);
                }
            });
        }
    ],
        function ( err, results)
        {
            console.log( err, results);
            if( !err && results[0])
            {
                var workerOrders = results[0];
                console.log( workerOrders);
                var  sql = " select * from order_registration where order_id  in ( select order_id from worker_order where worker=? ) ";
                var args = [uid];
                if( begin)
                {
                    if( orderby == "desc")
                    {
                        sql = sql + "and ctime < ? ";
                    }
                    else
                    {
                        sql = sql + "and ctime > ? ";
                    }
                    args.push(begin);
                }
                sql = sql + " order by ctime " + orderby;
                if( count && count != 0)
                {
                    sql = sql + " limit " + count ;
                }
                log.warn(sql, "," , begin);
                pomelo.app.get('dbclient').query( sql, args, function ( err, res)
                {
                    var orders = new Array();
                    try
                    {
                        if( !err && res && res.length > 0)
                        {

                            for ( var i = 0; i < res.length; i++)
                            {
                                var order = new OrderRegistration( res[i]);
                                if( workerOrders[order.order_id].refuse === 1)
                                {
                                    order.status = consts.Registration_ORDER_STATUS.Refuse;
                                    order.refuseReason = workerOrders[order.order_id].reason;
                                }
                                console.log(res[i]);
                                orders.push(order.data());
                            }
                        }
                        else if( err)
                        {
                            log.error(err.stack);
                        }
                    }
                    catch (e)
                    {
                        log.error(e.stack);
                        utils.sendMail(e.message, e.stack);
                        err = e;
                    }
                    finally
                    {
                        console.log(orders);
                        utils.invokeCallback( cb, err, orders);
                    }
                });
            }
            else
            {
                cb ( err, []);
            }

        }
    )


}

orderDao.getRegistrationRecordToday = function(uid,count,orderby,begin, cb)
{
    async.parallel([
        function ( callback)
        {
            workerOrderDao.getOrder({ worker:uid}, function ( err, data)
            {
                console.log('workerOrderDao.getOrder',data);
                if( data && data.length > 0)
                {
                    var orders = {};
                    for ( var i = 0; i < data.length; i++)
                    {
                        orders[data[i].order_id] = data[i];

                    }
                    console.log('orders',orders);
                    callback ( null, orders);
                }
                else
                {
                    if( err)
                    {
                        log.error(err.stack);
                    }
                    callback (err, data);
                }
            });
        }
    ],
        function ( err, results)
        {
            console.log( err, results);
            if( !err && results[0])
            {
                var workerOrders = results[0];
                var  sql = " select * from order_registration where order_id in ( select order_id from worker_order where worker=? ) and date(ctime)=curdate() ";
                var args = [uid];
                if( begin)
                {
                    if( orderby == "desc")
                    {
                        sql = sql + "and ctime < ? ";
                    }
                    else
                    {
                        sql = sql + "and ctime > ? ";
                    }
                    args.push(begin);
                }
                sql = sql + " order by ctime " + orderby;
                if( count && count != 0)
                {
                    sql = sql + " limit " + count ;
                }
                log.warn(sql, "," , begin);

                pomelo.app.get('dbclient').query( sql, args, function ( err, res)
                {
                    var orders = new Array();
                    try
                    {
                        if( !err && res && res.length > 0)
                        {

                            for ( var i = 0; i < res.length; i++)
                            {
                                var order = new OrderRegistration( res[i]);
                                log.error( order.order_id)
                                log.error( order.status);

                                log.error(  workerOrders[order.order_id])




                                if( workerOrders[order.order_id].refuse === 1)
                                {
                                    order.status = consts.Registration_ORDER_STATUS.Refuse;
                                    order.refuseReason = workerOrders[order.order_id].reason;
                                }
                                if( order.status == consts.Registration_ORDER_STATUS.NotDispose)
                                {
                                    if( workerOrders[order.order_id].ctime.getTime() + consts.LAO_WU_ORDER_TIME < new Date().getTime())
                                    {
                                        order.status = consts.Registration_ORDER_STATUS.TimeOver;
                                    }
                                }

                                log.error( order.status)
                                console.log(res[i]);
                                orders.push(order.data());
                            }
                        }
                        else if( err)
                        {
                            log.error(err.stack);
                        }
                    }
                    catch (e)
                    {
                        log.error(e.stack);
                        utils.sendMail(e.message, e.stack);
                        err = e;
                    }
                    finally
                    {
                        console.log(orders);
                        utils.invokeCallback( cb, err, orders);
                    }
                });
            }
            else
            {
                cb ( err, []);
            }
        }
    )

}
/*
orderDao.getOrderFindDoctorNotAcceptedToDay = function ( cb)
{
    var now = new Date();
    if( now.getHours() < 10)    //在10点之前
    {
        now.setDate(now.getDate() - 1);
    }

    var sql = " select * from order_find_doctor where date(ctime) >= date(?) and status = ?";
    var args = [now,consts.ORDER_STATUS.NotAccept];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        var orders = new Array();
        try
        {
            if( !err && res && res.length > 0)
            {
                for ( var i = 0; i < res.length; i++)
                {
                    var order = new OrderFindDoctor( res[i]);
                    orders.push(order);
                }
            }
            else if( err)
            {
                log.error(err.stack);
            }
        }
        catch (e)
        {
            log.error(e.stack);
            err = e;
        }
        finally
        {
            console.log(orders);
            utils.invokeCallback( cb, err, orders);
        }
    });

}
*/
orderDao.getDoctorTelephoneRecord = function(uid,count,orderby,begin, cb)
{
    var  sql = " select * from order_find_doctor where doctors like '%" + uid +"%'";
    var args = [];
    if( begin)
    {
        if( orderby == "desc")
        {
            sql = sql + "and ctime < ? ";
        }
        else
        {
            sql = sql + "and ctime > ? ";
        }

        args.push(begin);
    }
    sql = sql + " order by ctime " + orderby;
    if( count && count != 0)
    {
        sql = sql + " limit " + count ;
    }

    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        var orders = new Array();
        try
        {

            if( !err && res && res.length > 0)
            {
                var now = Math.ceil(new Date().getTime()/1000);
                var ids = [];
                for ( var i = 0; i < res.length; i++)
                {
                    var order = new OrderFindDoctor( res[i]);
                    if(order.exptime < now && order.avatime > 0 && order.status == consts.ORDER_STATUS.Accepted && order.uuid > 0)
                    {
                        order.avatime = 0;
                        order.status = consts.ORDER_STATUS.NoComment;
                        ids.push(order.id);
                        utils.virtualNumberClose('01001',order.uuid, function( data)
                        {
                            if(data)
                            {
                                if( typeof data == 'string')
                                {
                                    data = eval('('+data+')');
                                }

                                logDao.CloseVirtualNumberLog({
                                    time:new Date(),
                                    companycode:'01001',
                                    uuid:order.uuid,
                                    status:data.status
                                },function(err,res)
                                {
                                    if( err) log.error(err.stack);
                                })
                            }
                        });
                    }
                    orders.push(order.data());
                }

                if( ids && ids.length > 0)
                {
                    //do update
                    sql = 'update order_find_doctor set avatime=0,status=? where id in (' + ids.toString() +')';
                    args = [consts.ORDER_STATUS.NoComment];
                    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
                    {
                        if( err) log.error(err.stack);
                        console.log(res);

                    });
                }
            }
            else if( err)
            {
                log.error(err.stack);
            }
        }
        catch (e)
        {
            log.error(e.stack);
            utils.sendMail(e.message, e.stack);
            err = e;
        }
        finally
        {
            console.log(orders);
            utils.invokeCallback( cb, err, orders);
        }
    });
}
orderDao.getDoctorTelephoneToday = function(uid,count,orderby,begin, cb)
{
    var  sql = " select * from order_find_doctor where doctors like '%" + uid +"%' and date(ctime)=curdate() ";
    var args = [];
    if( begin)
    {
        if( orderby == "desc")
        {
            sql = sql + "and ctime < ? ";
        }
        else
        {
            sql = sql + "and ctime > ? ";
        }
        args.push(begin);
    }
    sql = sql + " order by ctime " + orderby;
    if( count && count != 0)
    {
        sql = sql + " limit " + count ;
    }
    log.warn(sql, "," , begin);

    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        var orders = new Array();
        try
        {
            if( !err && res && res.length > 0)
            {
                var now = Math.ceil(new Date().getTime()/1000);
                var ids = [];
                for ( var i = 0; i < res.length; i++)
                {
                    var order = new OrderFindDoctor( res[i]);
                    if(order.exptime < now && order.avatime > 0 && order.status == consts.ORDER_STATUS.Accepted && order.uuid > 0)
                    {
                        order.avatime = 0;
                        order.status = consts.ORDER_STATUS.NoComment;
                        ids.push(order.id);
                        utils.virtualNumberClose('01001',order.uuid, function( data)
                        {
                            if(data)
                            {
                                if( typeof data == 'string')
                                {
                                    data = eval('('+data+')');
                                }

                                logDao.CloseVirtualNumberLog({
                                    time:new Date(),
                                    companycode:'01001',
                                    uuid:order.uuid,
                                    status:data.status
                                },function(err,res)
                                {
                                    if( err) log.error(err.stack);
                                })
                            }
                        });
                    }
                    orders.push(order.data());
                }

                if( ids && ids.length > 0)
                {
                    //do update
                    sql = 'update order_find_doctor set avatime=0,status=? where id in (' + ids.toString() +')';
                    args = [consts.ORDER_STATUS.NoComment];
                    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
                    {
                        if( err) log.error(err.stack);
                        console.log(res);
                    });
                }
            }
            else if( err)
            {
                log.error(err.stack);
            }
        }
        catch (e)
        {
            log.error(e.stack);
            utils.sendMail(e.message, e.stack);
            err = e;
        }
        finally
        {
            console.log(orders);
            utils.invokeCallback( cb, err, orders);
        }
    });
}

orderDao.giveComment = function (order_id, order_table, comment, comment_desc, status, cb)
{
    var sql = " update " + order_table + " set comment=?,comment_desc=?,status=? where order_id=?";
    var args = [comment,comment_desc,status,order_id];
    log.info(sql, args.toString());
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        if( err)
        {
            log.error(err.stack);
            cb( err, null);
        }
        else
        {
            cb( null, res);
        }
    });
}

orderDao.getVirtualNumberIdByDoctorId = function ( id, orderId, cb)
{
    var  sql = "select uuid from order_find_doctor where order_id=? and doctor_id=? ";
    var args = [ orderId, id];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        if( err)
        {
            log.error(err.stack);
            cb( err, null);
        }
        else
        {
            if(res && res.length > 0)
            {
                cb( null, res[0].uuid);
            }
            else
            {
                cb( null, 0);
            }
        }
    });
}

orderDao.getVirtualNumberIdByUserId = function ( id, orderId, cb)
{
    var  sql = " select uuid from order_find_doctor where order_id=? and user_id=? ";
    var args = [ orderId, id];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        if( err)
        {
            log.error(err.stack);
            cb( err, null);
        }
        else
        {
            if(res && res.length > 0)
            {
                cb( null, res[0].uuid);
            }
            else
            {
                cb( null, 0);
            }

        }
    });
}

orderDao.getServiceOrder = function ( params, cb)
{
    var sql = 'select * from order_service';
    var args = [];
    var i = 0;
    for ( var k in params)
    {
        if( i === 0)
        {
            sql = sql + ' where ';
        }

        sql = sql + k + '=? and ';
        args.push(params[k]);
        i++;
    }
    if(i > 0)
    {
        sql = sql.slice(0, -4);
    }
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        if( err)
        {
            log.error(err.stack);
            cb( err, null);
        }
        else
        {
            log.error(JSON.stringify(res));
            if(res && res.length > 0)
            {
//                var orders = [];
//                for ( var i = 0; i < res.length; i++)
//                {
//                    orders.push(res[i]);
//                }
                cb( null, res);
            }
            else
            {
                cb( null, []);
            }

        }
    });

}

orderDao.hangup = function (uuid, avatime, cb )
{
    var data = Math.ceil(new Date().getTime()/1000) + avatime * 60;
    var sql = "";
    var args = [];
    if( avatime == 0)
    {
        sql = 'update order_find_doctor set exptime=?,avatime=?,status=? where uuid=? and avatime=?';
        args = [data,avatime, consts.ORDER_STATUS.NoComment,uuid,consts.VIRTUAL_NUMBER.AVA_TIME];
    }
    else
    {

        sql = 'update order_find_doctor set exptime=?,avatime=? where uuid=? and avatime=?';
        args = [data,avatime,uuid,consts.VIRTUAL_NUMBER.AVA_TIME];
    }
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        if( err) log.error(err.stack);
        if( res) log.error(JSON.stringify(res));
        cb( err, res);
    });
}

orderDao.clearOrderByUser = function ( userId, cb)
{
    var now = Math.ceil(new Date().getTime()/1000);
    var sql = "select * from order_find_doctor where user_id=? and exptime < ? and avatime > 0 and status=? and uuid>0";
    var args = [ userId, now, consts.ORDER_STATUS.Accepted];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        if( err) {
            log.error(err.stack);
            cb( err, null);
            return;
        }
        if( res && res.length > 0)
        {
            log.info(res.length);
            var ids = [];
            for ( var i = 0;  i < res.length; i++)
            {
                ids.push(res[i].id);
                utils.virtualNumberClose('01001',res[i].uuid, function( data)
                {
                    if(data)
                    {
                        if( typeof data == 'string')
                        {
                            data = eval('('+data+')');
                        }

                        logDao.CloseVirtualNumberLog({
                            time:new Date(),
                            companycode:'01001',
                            uuid:res[i].uuid,
                            status:data.status
                        },function(err,res)
                        {
                            if( err) log.error(err.stack);
                        })
                    }
                });
            }

            sql = 'update order_find_doctor set avatime=0,status=? where id in (' + ids.toString() +')';
            args = [consts.ORDER_STATUS.NoComment];
            pomelo.app.get('dbclient').query( sql, args, function ( err, res)
            {
                if( err) log.error(err.stack);
                console.log(res);
                cb ( err, res);
            });
        }
        else
        {
            cb(null, null);
        }

    });
}
orderDao.checkUserOrder = function ( userId, cb)
{
    var now = Math.ceil(new Date().getTime()/1000);
    var sql = 'select * from order_find_doctor where user_id=? and status=? and exptime>?'
    var args = [userId, consts.ORDER_STATUS.Accepted ,now];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        if( err) log.error(err.stack);
        console.log(res);
        cb ( err, res && res.length > 0 ? false:true);
    });
}