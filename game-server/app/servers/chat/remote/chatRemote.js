/**
 * Created by cp on 1/7/14.
 */

var userDao = require('../../../dao/userDao');
var doctorDao = require('../../../dao/doctorDao');
var workerDao = require('../../../dao/workerDao')
var consts = require('../../../consts/consts');
var utils = require('../../../util/utils');
var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var async = require('async');

module.exports = function(app)
{
    return new ChatRemote(app);
};

var ChatRemote = function(app)
{
    this.app = app;
    this.channelService = app.get('channelService');
};

/**
 * Add user into chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
ChatRemote.prototype.add = function(uid, sid, msg, flag, cb)
{

    try
    {
        var channel = this.channelService.getChannel(msg.user_type, flag);

        if( msg.user_type === consts.USER.User )
        {
            async.parallel([
                function( callback)
                {
                    userDao.getUserByMobile(msg.uid, function (err,res){
                        callback( err, res);
                    })

                }
            ],
                function( err, result)
                {
                    if( err)
                    {
                        cb(err, null);
                    }
                    else
                    {

                        var user = result[0];
                        if(user && user.phone_number == msg.uid)
                        {
                            //ok
                            if( user.password == msg.password){
                                if( channel)
                                {
                                    channel.add(uid, sid);
                                }
                                cb( null, user);
                            }
                            else
                            {
                                log.error(1,user.password,2, msg.password)
                                cb(consts.ERROR.BAD_PASSWORD ,null);
                            }
                        }
                        else
                        {
                            cb(consts.ERROR.USER_NOT_REGISTER, null);
                        }
                    }
//                    var user = result[0];
//                    if(userBing && userBing.uid == msg.uid)
//                    {
//                        console.log('userBing',userBing);
//                        //ok
//                        if( channel)
//                        {
//                            channel.add(uid, sid);
//                        }
//                        cb( null, userBing);
//                    }
//                    else if( userBing && userBing.uid == '')
//                    {
//                        //绑定设备
//                        userDao.setUser('phone_number',userBing.phone_number, ['uid'],[msg.uid], function ( err, res)
//                        {
//                            if(err)
//                            {
//                                log.error( err.message, err.stack);
//                                if( userNotBind)
//                                {
//                                    console.log('userNotBind',userNotBind);
//
//                                    //匿名登录
//                                    if( channel)
//                                    {
//                                        channel.add(uid, sid);
//                                    }
//                                    cb( null, userNotBind);
//                                }
//                                else
//                                {
//                                    console.log(' new user');
//                                    //userNotBind
//                                    //录入一个user not bind匿名登录
//                                    //uid null new device username, password, uid, device_token, name
//                                    userDao.addUser("" , "" ,msg.uid, msg.device_token ,"" ,function (err, newUser)
//                                    {
//                                        if( err)
//                                        {
//                                            cb(err,null);
//                                        }
//                                        else
//                                        {
//                                            if( !! channel)
//                                            {
//                                                channel.add(uid, sid);
//                                            }
//                                            cb(null,newUser);
//                                        }
//                                    });
//                                }
//                            }
//                            else
//                            {
//                                userBing.uid = msg.uid;
//                                if( !! channel)
//                                {
//                                    channel.add(uid + '*' + userBing.phone_number, sid);
//                                }
//                                cb(null,userBing);
//                            }
//                        })
//                    }
//                    else if( userNotBind)
//                    {
//                        console.log('userNotBind',userNotBind);
//
//                        //匿名登录
//                        if( channel)
//                        {
//                            channel.add(uid, sid);
//                        }
//                        cb( null, userNotBind);
//                    }
//                    else
//                    {
//                        console.log(' new user');
//                        //录入一个user not bind匿名登录
//                        //uid null new device
//                        userDao.addUser("","",msg.uid, msg.device_token,"",function (err, newUser)
//                        {
//                            if( err)
//                            {
//                                cb(err,null);
//                            }
//                            else
//                            {
//                                if( !! channel)
//                                {
//                                    channel.add(uid, sid);
//                                }
//                                cb(null,newUser);
//                            }
//                        });
//                    }
                }
            );

        }else if( msg.user_type === consts.USER.Doctor){
            doctorDao.getDoctorByUid(msg.uid, function ( err, doctor) {
                if( err){
                    console.log(err);
                    cb( err, null);
                }else if( doctor){
                    if( !! channel) {
                        channel.add(uid, sid);
                    }
                    cb( null, doctor.data());
                }else{
                    cb(consts.ERROR.USER_NOT_REGISTER, null);
                }
            });
        }else if( msg.user_type === consts.USER.Worker){
            workerDao.getWorkerByUid( msg.uid, function ( err, worker)
            {
                if( err){
                    console.log(err);
                    cb( err, null);
                }else if( worker){
                    if( !! channel) {
                        channel.add(uid, sid);
                    }
                    cb( null, worker);
                }else{
                    cb(consts.ERROR.USER_NOT_REGISTER, null);
                }
            });
        }
        else{
            console.log("user type error");
            cb(consts.ERROR.BAD_USER_TYPE, null);
        }
    }
    catch (e)
    {
        log.error(e.stack);
        utils.sendMail(e.message, e.stack);
        cb(e, null);
    }

};

/**
 * Get user from chat channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
ChatRemote.prototype.get = function(name, flag)
{
    var users = [];
    var channel = this.channelService.getChannel(name, flag);
    if( !! channel)
    {
        users = channel.getMembers();
    }
    for(var i = 0; i < users.length; i++)
    {
        users[i] = users[i].split('*')[0];
    }
    console.log(users);
    return users;
};

/**
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
ChatRemote.prototype.kick = function(uid, sid, name,cb)
{

    console.log(arguments);
    var channel = this.channelService.getChannel(name, false);
    // leave channel
    if( !! channel)
    {
//        console.log(channel.getMembers());
//        this.channelService.pushMessageByUids("onLogout",{
//            error:{
//                code:1,
//                message:"user login on orthers"
//            }
//        },[{uid:uid,sid:sid}],function ( err, users)
//        {
//            console.log(err,users);
            channel.leave(uid, sid);
//            console.log("kick over!!");
            cb();
//        })


    }
};
