/**
 * Created by cp on 1/8/14.
 */

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var pomelo = require('pomelo');

var consts = require('../consts/consts');
var utils = require('../util/utils');

var User = require('../entity/user');

var userDao = module.exports;

userDao.getUser = function (uid, cb) {
    var sql = "select * from user where uid = ? and phone_number = ''";
    var args = [uid];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        var user = null;
        try
        {
            if( !err && res && res.length > 0)
            {

                user = new User;
                user.id = res[0].id;
                user.uid = res[0].uid;
                user.name = res[0].name;
                user.phone_number = res[0].phone_number;
                user.money = res[0].money;
                user.password = res[0].password;
                if(res[0].phone_numbers != null){
                    user.phone_numbers = user.phone_numbers.concat(res[0].phone_numbers.split(','));
                }
            }
            else if( err)
            {
                log.error(err);
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
            utils.invokeCallback( cb, err, user);
        }
    });
}

userDao.getUserByKey = function ( params, args, cb)
{
    var sql = "select * from user ";
    for ( var i = 0; i < params.length; i++)
    {
        if( i == 0)
        {
            sql += "where ";
        }
        else
        {
            sql += "and ";
        }
        sql += params[i] + " = ? ";
    }
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        var users = new Array();
        try
        {
            if( !err && res && res.length > 0)
            {
                for(var i = 0; i < res.length; i++)
                {
                    var user = new User()
                    user.id = res[0].id;
                    user.uid = res[0].uid;
                    user.name = res[0].name;
                    user.phone_number = res[0].phone_number;
                    user.password = res[0].password;
                    user.money = res[0].money;
                    if(res[0].phone_numbers != null){
                        user.phone_numbers = user.phone_numbers.concat(res[0].phone_numbers.split(','));
                    }
                    users.push(user);
                }

            }
            else if( err)
            {
                log.error(err);
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
            utils.invokeCallback( cb, err, users);
        }
    });
}
userDao.getUserByMobile = function (mobile, cb) {
    var sql = 'select * from user where phone_number = ?';
    var args = [mobile];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        var user = null;
        try
        {
            if( !err && res && res.length > 0)
            {
                user = new User()
                user.id = res[0].id;
                user.uid = res[0].uid;
                user.name = res[0].name;
                user.phone_number = res[0].phone_number;
                user.money = res[0].money;
                user.password = res[0].password;
                if(res[0].phone_numbers != null){
                    user.phone_numbers = user.phone_numbers.concat(res[0].phone_numbers.split(','));
                }
            }
            else if( err)
            {
                log.error(err);
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
            utils.invokeCallback( cb, err, user);
        }
    });
}
userDao.addUser = function(username, password, uid, device_token, name, cb)
{
    console.log(arguments);
    var sql = 'insert into user (uid,device_token,phone_number,password,name) values ( ?, ?, ?, ?, ?)';
    var args = [uid,device_token,username,password,name];
    log.info(sql, args.toString());
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        var user = null;
        try
        {
            if( !err)
            {
                user = new User()
                user.id = res.insertId;
                user.uid = uid;
                user.token = device_token;
                user.money = 0;
                user.name = name;
                user.phone_number = username;
                user.phone_numbers =[];
                user.password = password;
            }
            else if( err)
            {
                log.error(err);
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
            utils.invokeCallback( cb, err, user);
        }
    });
}

userDao.addMoney = function ( phoneNumber, money, cb)
{
    var sql = " update user set money=money+? where phone_number=? ";
    var args = [money, phoneNumber];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        if(err)
        {
            log.error(sql,args,err.stack);
        }
        cb( err, res);
    });
}

userDao.setUser = function(where, key, params, args, cb)
{
    var sql = " update user set ";
    for ( var i = 0; i < params.length; i++)
    {
        if(i > 0){
            sql = sql + ", ";
        }
        sql = sql + params[i] + " = ?";
    }
    sql = sql + " where " + where +" = ?";
    args.push(key);
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        if(err)
        {
            log.error(sql,args);
        }
       cb( err, res);
    });
}