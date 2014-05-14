/**
 * Created by cp on 1/13/14.
 */
var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var pomelo = require('pomelo');

var consts = require('../../../consts/consts');
var utils = require('../../../util/utils');

var doctorDao = require('../../../dao/doctorDao');
var Doctor  = require('../../../entity/doctor');
var userDao = require('../../../dao/userDao');

module.exports = function(app)
{
    return new AuthRemote(app);
};

var AuthRemote = function(app)
{
    this.app = app;

};
AuthRemote.prototype.addUser = function(phone_number, sid, msg, flag, cb)
{
    console.log(arguments);
    if( msg.phone_number && msg.password && msg.mac_address && msg.name)
    {
        userDao.getUserByMobile(phone_number, function ( err, user)
        {
            try
            {
                if( err)
                {
                    cb(utils.Error(err), null);
                }
                else
                {
                    if(user)
                    {
                        cb( consts.ERROR.USERNAME_HAS_ALREADY_BEEN_REGISTERED, null);
                    }
                    else
                    {
                        userDao.addUser( phone_number, msg.password, msg.mac_address, msg.device_token,msg.name,function ( err, user)
                        {
                            try{
                                if(err)
                                {
                                    cb( err, null);
                                }
                                else
                                {
                                    cb( null, user);
                                }
                            }
                            catch (e)
                            {
                                log.error(e.stack);
                                utils.sendMail(e.message, e.stack);
                                cb(e,null);
                            }

                        })
                    }
                }
            }
            catch (e)
            {
                log.error(e.stack);
                utils.sendMail(e.message, e.stack);
                cb(e,null);
            }

        });

    }
    else
    {
        cb(consts.ERROR.MISSING_PARAMS, null);
    }

};

AuthRemote.prototype.addDoctor = function(uid, sid, msg, flag, cb)
{
    var hospital = msg.hospital;
    var title = msg.title;
    var subject = msg.subject;
    var image = msg.image;
    var phoneNumber = msg.phonenumber;
    var name = msg.name;

    doctorDao.getDoctorByUid(uid, function ( err,data)
    {
        var doctor = new Doctor;
        doctor.uid = uid;
        var flag = true;
        try
        {
            if(  !err && !data)
            {
                //注册
                flag = false;
                doctor.departments.push(subject);
                doctor.job_title = title;
                doctor.image = image;
                doctor.work_phone_number = phoneNumber;
                doctor.uid = phoneNumber;
                doctor.name = name;
                doctor.hospital = hospital;

                doctorDao.addDoctor(uid, doctor, function ( err1, flag)
                {
                    if( err1 )
                    {
                        //error
                        cb( err1, null);

                    }
                    else if( flag)
                    {
                        //ok
                        cb( null, doctor.data());
                    }
                    else
                    {
                        cb( err1, null);
                    }

                });

            }
            else if( err)
            {
                log.error(err);
            }
            else if ( data)
            {
                err = consts.ERROR.USERNAME_HAS_ALREADY_BEEN_REGISTERED;
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
            if(flag){
                utils.invokeCallback( cb, err, null);
            }
        }
    });


};
