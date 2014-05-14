
module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
    this.channelService = app.get('channelService');
};
var async = require('async');
var utils = require('../../../util/utils');
var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var dao = require('../../../dao/initInfoDao');

var User = require('../../../entity/user');
var consts = require('../../../consts/consts');

var UserInitInfo = require('../../../entity/userInitInfo');
var UserEntryLog = require('../../../entity/userEntryLog');
var logDao = require('../../../dao/logDao');

var schedule = require('pomelo-schedule');
/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
Handler.prototype.Entry = function(msg, session, next)
{
    var self = this;

    var userType = msg.user_type;
    var uid = msg.uid + '*' + userType;
    var sid = session.frontendId;

    //log for login
    var userLog = new UserEntryLog();
    userLog.client = msg.client_type;
    userLog.uid = msg.uid;
    userLog.device_token = msg.device_token;
    userLog.version = msg.version;

    logDao.newEntryLog(userLog, function (err, res)
    {
        if(err)
        {
            log.error(err.stack);
        }
        else
        {
            log.info(res);
        }

    });
    //end log

    async.series([
        function ( callback)
        {
            log.info(1);
            var sessionService = self.app.get('sessionService');
            var sessions = sessionService.getByUid(uid)
            if( sessions && sessions.length > 0)
            {

                var i = 0;
                if(sessions[i].id !== session.id)
                {
                    log.info(1);
                    async.series([
                        function ( callback)
                        {
                            log.info(1);
                            self.channelService.pushMessageByUids("onLogout",{
                                error:consts.ERROR.LOGIN_ON_OTHER
                            },[{uid:sessions[i].uid,sid:sessions[i].frontendId}],function ( err, users)
                            {
                               callback(err, users);
                            });
                        },
                        function ( callback)
                        {
                            log.info(1);
                            self.app.rpc.chat.chatRemote.kick(sessions[i], sessions[i].uid, sessions[i].frontendId, sessions[i].get('user_type'),function( err, data)
                            {
                                callback(err,data);
                            });
                        },
                        function ( callback){
                            log.info(1);
                            sessionService.unbind(sessions[i].id,uid,function ( error)
                            {
                                callback(error);
                            });
                        }
                    ],
                        function( err, results)
                        {
                            log.info(1);
                            callback(err, results);
                        }

                    )
//                    console.log(sessions[i], sessions[i].uid, sessions[i].frontendId, sessions[i].get('user_type'));
//                    //push
//                    console.log("push")
//                    self.channelService.pushMessageByUids("onLogout",{
//                        error:{
//                            code:1,
//                            message:"user login on orthers"
//                        }
//                    },[{uid:sessions[i].uid,sid:sessions[i].frontendId}],function ( err, users)
//                    {
//                        console.log(arguments)
////                    console.log("unbind")
//
//                        self.app.rpc.chat.chatRemote.kick(sessions[i], sessions[i].uid, sessions[i].frontendId, sessions[i].get('user_type'),function( err, date)
//                        {
//                            console.log("kick")
//                            console.log(arguments)
//                            sessionService.unbind(sessions[i].id,uid,function ( error)
//                            {
//                                console.log("error");
//                                console.log(error);
//
//
//                            });
//
//                        });
//                    })
                }
                else
                {
                    callback();
                }
            }
            else
            {
                callback();
            }
        }
    ],
        function ( err, results)
        {

            console.log("put user into channel!!!!!!!!!!");
            //put user into channel
            self.app.rpc.chat.chatRemote.add(session, uid, sid, msg, true, function(err, user)
            {
                try
                {
                    if( !err)
                    {
                        //查找用户成功
                        log.info(JSON.stringify(user));


                        session.bind(uid);
                        session.set('user_type', userType);
                        session.set('id', user.id);
                        session.set('name',user.name);
                        session.set('client_type', msg.client_type);

                        if( userType == consts.USER.Doctor)
                        {
                            session.set('online',Boolean(user.online));
                            session.set('phone_number', user.work_phone_number);
                            session.set('credits',user.credits);
                            session.set('earnings',user.earnings);
                        }
                        else if( userType == consts.USER.User)
                        {
                            session.set('money',user.balance);
                            session.set('phone_numbers',user.phone_numbers);
                            session.set('mac_address',user.uid);
                        }
                        else if( userType == consts.USER.Worker)
                        {
                            session.set('phone_number',user.phone_number);
                            session.set('city',user.city);
                            session.set('online',Boolean(user.online));
                            session.set('credits',user.credits);
                        }

                        session.pushAll( function(err)
                        {
                            if(err)
                            {
                                log.error('set session service failed! error is : %j', err.stack);
                            }
                        });

                        session.on('closed', onUserLeave.bind(null, self.app));

                        if ( userType == consts.USER.User)
                        {
                            try
                            {
                                next ( null ,
                                    {
                                        error:utils.Error(null),
                                        name:user.name,
                                        phone_numbers:user.phone_numbers,
                                        balance:user.balance
                                    }
                                );
                            }
                            catch (e)
                            {
                                log.error(e.stack);
                                utils.sendMail(e.message, e.stack);
                                next( null,
                                    {
                                        error:utils.Error(e)
                                    }
                                )
                            }
                        }
                        else if( userType == consts.USER.Doctor)
                        {
                            try
                            {
                                next ( null ,{
                                        error:utils.Error(null),
                                        uid:user.uid,
                                        name:user.name,
                                        job_title:user.job_title,
                                        hospital:user.hospital,
                                        departments:user.departments,
                                        diseases:user.diseases,
                                        work_phone_number:user.work_phone_number,
                                        self_phone_number:user.self_phone_number,
                                        image:user.image,
                                        price:user.price,
                                        credits :user.credits,
                                        earnings : user.earnings,
                                        device_token : user.device_token,
                                        ctime : utils.DateFormat(user.ctime),
                                        online:user.online,
                                        version:self.app.get('version')
                                    }
                                );
                            }
                            catch (e)
                            {
                                log.error(e.stack);
                                utils.sendMail(e.message, e.stack);
                                next( null,
                                    {
                                        error:utils.Error(e)
                                    }
                                )
                            }
                        }
                        else if( userType == consts.USER.Worker)
                        {
                            try
                            {
                                next ( null ,{
                                        error:utils.Error(null),
                                        uid:user.phone_number,
                                        name:user.name,
                                        work_phone_number:user.phone_number,
                                        credits :user.credits,
                                        hospitals: user.hospitals,
                                        online:user.online,
                                        city:user.city,
                                        ctime:utils.DateFormat(user.ctime),
                                        version:self.app.get('version')
                                    }
                                );
                            }
                            catch (e)
                            {
                                log.error(e.stack);
                                utils.sendMail(e.message, e.stack);
                                next( null,
                                    {
                                        error:utils.Error(e)
                                    }
                                )
                            }
                        }
                        else{
                            next(null,"ok!");
                        }
                    }
                    else
                    {
                        log.error(JSON.stringify(err));
                        next(null, {
                            error:utils.Error(err)
                        })
                    }
                }
                catch (e)
                {
                    log.error(e.stack);
                    utils.sendMail(e.message, e.stack);
                    next(null,
                        {
                            error:utils.Error(e)
                        }
                    );
                }

            });
        }
    )




};


Handler.prototype.Register = function (msg, session, next)
{

    var self = this;
    var sid = session.frontendId;

    if(msg.uid)
    {   //doctor
        var uid = msg.uid;
        self.app.rpc.auth.authRemote.addDoctor(session, uid, sid, msg, true, function(err, doctor)
        {
            try
            {
                if( err)
                {
                    log.error(err.stack);
                    utils.sendMail(e.message, e.stack);
                    next( null, {
                        error:utils.Error(err)
                    })
                }
                else
                {
                    var params = {
                        error:utils.Error(err),
                        uid:uid,
                        name:doctor.name,
                        job_title:doctor.job_title,
                        hospital:doctor.hospital,
                        departments:doctor.departments,
                        diseases:doctor.diseases,
                        work_phone_number:doctor.work_phone_number,
                        self_phone_number:doctor.self_phone_number,
                        image:doctor.image,
                        price:doctor.price,
                        credits :doctor.credits,
                        earnings : doctor.earnings,
                        device_token : doctor.device_token,
                        ctime : utils.DateFormat(doctor.ctime),
                        online:doctor.online
                    };
                    next( null, params)
                }
            }
            catch (e)
            {
                log.error(e.stack);
                utils.sendMail(e.message, e.stack);
                next( null, {error:utils.Error(e)});
            }


        })
    }
    else if(msg.user_type == consts.USER.User) //user
    {
        self.app.rpc.auth.authRemote.addUser(session,msg.phone_number, sid, msg,true, function (err,user)
        {
            next( null, {
                    error:utils.Error(err)
            });
        });
    }
    else
    {
        next( null, {
            error:consts.ERROR.MISSING_PARAMS
        });
    }

}

Handler.prototype.LogOut = function ( msg, session, next)
{
    var sessionService = this.app.get('sessionService');
    var self = this;
    if( session.uid)
    {
        var uid = session.uid;
        sessionService.unbind(session.id,uid,function ( error)
        {
            self.app.rpc.chat.chatRemote.kick(session, uid, session.frontendId, session.get('user_type'),null);
        });
    }
    next(null,{error:utils.Error(null)});

}

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session)
{
    if(!session || !session.uid)
    {
        return;
    }
    app.rpc.chat.chatRemote.kick(session, session.uid, session.frontendId, session.get('user_type'),null);
};
