/**
 * Created by cp on 1/8/14.
 */
var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var pomelo = require('pomelo');

var consts = require('../consts/consts');
var utils = require('../util/utils');

var Doctor = require('../entity/doctor');

doctorDao = module.exports;

var async = require('async');
var hospitalDao = require('./hospitalDao');
var departmentDao = require('./departmentDao');
var diseaseDao = require('./diseaseDao');
var jobTitleDao = require('./jobTitleDao')

doctorDao.getDoctors = function (params, cb)
{

    log.info(JSON.stringify(params));
    async.parallel([
        function ( callback)
        {
            jobTitleDao.getJobTitles(function ( err, res)
            {
                callback( err, res);
            });
        }
    ],
        function (err, res)
        {
            var jobTitles = res[0];
            var sql = "select * from doctor ";
            var args = [];
            if( !params.subject)
            {
                //查询全部
            }
            else if( !params.hospital)
            {
                sql = sql + " where departments like '%?%' and price >= ?";
                args = [parseInt(params.subject) , params.price];
//                if( params.illness && params.illness > 0)
//                {
//                   sql = sql + " and diseases = ? ";
//                    args.push(params.illness);
//                }
            }else{
                sql = sql + " where departments  like '%?%' and hospital = ? ";
                args = [parseInt(params.subject), parseInt(params.hospital)];
            }
            log.info(sql, args.toString());

            pomelo.app.get('dbclient').query(sql, args, function ( err, result)
            {
                if( result) log.info(JSON.stringify(result));
                var channelService = pomelo.app.get('channelService');
                var channel = channelService.getChannel(consts.USER.Doctor,false);
                var doctors = [];
                var doctorOnline = [];
                var doctorOffline = [];
                try
                {
                    if( !err)
                    {
                        for( var i = 0; i<result.length; i++)
                        {
                            var doctor = new Doctor();
                            doctor.id = result[i].id;
                            doctor.uid = result[i].uid;
                            if(result[i].departments)
                            {
                                var departments_id = result[i].departments.split(',');
                                if(departments_id.indexOf('1') >= 0)
                                {
                                    departments_id.splice(departments_id.indexOf('1'),1);
                                }
                                if(departments_id.indexOf('2') >= 0)
                                {
                                    departments_id.splice(departments_id.indexOf('2'),1);
                                }
                                doctor.departments = utils.toIntArray(departments_id);
                            }
                            if(result[i].diseases)
                            {
                                var diseases_id = result[i].diseases.split(',');
                                doctor.diseases = utils.toIntArray(diseases_id);
                            }
                            if(jobTitles[result[i].job_title] !== undefined)
                            {
                                doctor.job_title = jobTitles[result[i].job_title].name;
                            }
                            doctor.name = result[i].name;
                            doctor.price = result[i].price;
                            doctor.hospital = result[i].hospital
                            if( channel)
                            {

                                doctor.online = Boolean(result[i].online);
                                if( doctor.online && channel.getMember(doctor.uid + '*' + consts.USER.Doctor))
                                {
                                    doctor.online = true;
                                }
                                else
                                {
                                    doctor.online = false;
                                }
                            }
                            else
                            {
                                //没有医生登录
                                doctor.online = false;
                            }
                            doctor.credits= result[i].credits;
                            doctor.earnings = result[i].earnings;
                            doctor.ctime = result[i].ctime;
                            if(doctor.online)
                            {
                                doctorOnline.push(doctor);
                            }
                            else
                            {
                                doctorOffline.push(doctor);
                            }

                        }
                        if(params && params.only_online == true)
                        {
                            doctors = doctorOnline;
                        }
                        else
                        {
                            doctors = doctorOnline.concat(doctorOffline);
                        }
                    }
                    else
                    {
                        log.error(err.message,err.stack);
                    }
                }
                catch (e)
                {
                    utils.sendMail(e.message, e.stack);
                    log.error(e.message, e.stack);
                    err = e;
                }
                finally
                {
                    log.info("doctors",JSON.stringify(doctors));
                    utils.invokeCallback(cb, err, doctors);
                }
            });

        } );
}

doctorDao.getDoctorById = function ( id, cb)
{
    var sql = "select * from doctor where id = ?";
    var args = [id];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        var channelService = pomelo.app.get('channelService');
        var channel = channelService.getChannel(consts.USER.Doctor,false);
        log.warn(err,res);
        var doctor = new Doctor;
        try
        {
            if( !err && res && res.length == 1)
            {
                doctor.id = res[0].id;
                doctor.hospital = res[0].hospital;
                doctor.job_title = res[0].job_title;
                doctor.uid = res[0].uid;
                doctor.work_phone_number = res[0].work_phone_number;
                doctor.image = res[0].image;

                if(res[0].departments)
                {
                    var departments_id = res[0].departments.split(',');
                    if(departments_id.indexOf('1') >= 0)
                    {
                        departments_id.splice(departments_id.indexOf('1'),1);
                    }
                    if(departments_id.indexOf('2') >= 0)
                    {
                        departments_id.splice(departments_id.indexOf('2'),1);
                    }
                    doctor.departments = utils.toIntArray(departments_id);
                }

                if(res[0].diseases)
                {
                    var disease_id = res[0].diseases.split(',');
                    doctor.diseases = utils.toIntArray(disease_id)
                }

                if( channel)
                {

                    doctor.online = Boolean(res[0].online);
                    if( doctor.online && channel.getMember(doctor.uid + '*' + consts.USER.Doctor))
                    {
                        doctor.online = true;
                    }
                    else
                    {
                        doctor.online = false;
                    }
                }
                else
                {
                    //没有医生登录
                    doctor.online = false;
                }
                doctor.price = res[0].price;
                doctor.name = res[0].name;
                doctor.credits= res[0].credits;
                doctor.earnings = res[0].earnings;
                doctor.ctime = res[0].ctime;
            }
            else if(err)
            {
                log.error(err.message,err.stack);
            }
        }
        catch (e)
        {
            utils.sendMail(e.message, e.stack);
            err = e;
            log.error(err.message,err.stack)
        }
        finally
        {
            utils.invokeCallback(cb, err, doctor);
        }
    });
}

doctorDao.getDoctorByUid = function ( uid, cb)
{
    var sql = "select * from doctor where uid = ?";
    var args = [uid];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        var channelService = pomelo.app.get('channelService');
        var channel = channelService.getChannel(consts.USER.Doctor,false);
        var doctor;
        try
        {
            if( !err && res && res.length == 1)
            {
                doctor = new Doctor;
                doctor.id = res[0].id;
                doctor.hospital = res[0].hospital;
                doctor.job_title = res[0].job_title;
                doctor.uid = res[0].uid;
                doctor.work_phone_number = res[0].work_phone_number;
                doctor.image = res[0].image;
                if(res[0].departments)
                {
                    var departments_id = res[0].departments.split(',');
                    if(departments_id.indexOf('1') >= 0)
                    {
                        departments_id.splice(departments_id.indexOf('1'),1);
                    }
                    if(departments_id.indexOf('2') >= 0)
                    {
                        departments_id.splice(departments_id.indexOf('2'),1);
                    }
                    doctor.departments = utils.toIntArray(departments_id);
                }
                if(res[0].diseases)
                {
                    var disease_id = res[0].diseases.split(',');

                    doctor.diseases = utils.toIntArray(disease_id)
                }
                doctor.online = Boolean(res[0].online);


                doctor.price = res[0].price;
                doctor.name = res[0].name;
                doctor.credits= res[0].credits;
                doctor.earnings = res[0].earnings;
                doctor.ctime = res[0].ctime;
            }
            else if(err)
            {
                log.error(err.message,err.stack);
            }
        }
        catch (e)
        {
            utils.sendMail(e.message, e.stack);
            log.error(e.message,err.stack);
            err = e;
        }
        finally
        {
            cb( err, doctor);
        }
    });
}

doctorDao.addDoctor = function ( uid, doctor, cb)
{
    var sql = "insert into doctor ( name,job_title, hospital, departments, diseases, uid, work_phone_number) " +
        "values ( ?, ?, ?, ?, ?, ?, ?) ";
    var args = [
        doctor.name,
        doctor.job_title,
        doctor.hospital,
        doctor.departments.toString(),
        doctor.diseases.toString(),
        doctor.uid,
        doctor.work_phone_number
    ]

    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {

        if(err)
        {
            log.error( " insert doctor error \n", err.message,err.stack);
            cb(err, null);
        }
        else
        {
            log.error(" insert doctor success! \n", res.message,err.stack);
            cb( null, true);
        }
    });
}
doctorDao.getOnlineDoctors = function ( subject, illness, price ,cb) {
    var channelService = pomelo.app.get('channelService');
    var channel = channelService.getChannel(consts.USER.Doctor,false);
    if(channel == undefined)
    {
        log.error('channelService is null ,no doctor online');
        cb( consts.ERROR.NO_DOCTOR_ONLINE,[]);
        return;
    }
    if( typeof cb == 'function')
    {
        var sql = "select * from doctor where departments like '%?%' and  price >= ? and online = 1";
        var args = [parseInt(subject), price];
        console.log(sql, args);
        pomelo.app.get('dbclient').query( sql, args, function ( err, res)
        {
            var doctors = new Array();
            try
            {
                if( !err && res && res.length > 0)
                {
                    for( var i = 0; i < res.length; i++)
                    {
                        var uid = res[i].uid + '*' + consts.USER.Doctor;
                        var member = channel.getMember(uid);
                        if( member)
                        {
                            console.log(uid,'online');
                            var sid = member['sid'];
                            doctors.push({
                                uid:uid,
                                sid:sid
                            })
                        }
                        else
                        {
                            console.log(uid,'offline');
                        }
                    }
                }
                else if( err)
                {
                    log.error(err.message,err.stack);
                }
            }
            catch (e)
            {
                utils.sendMail(e.message, e.stack);
                log.error(e.message,e.stack);
                err = e;
            }
            finally
            {
                utils.invokeCallback( cb, err, doctors);
            }

        });
    }
    else
    {
        cb( consts.ERROR.MISSING_PARAMS, null);
    }
}

doctorDao.setOnline = function ( uid, online, cb) {
    var sql = "update doctor set online = ? where uid = ?";
    var args = [online, uid];
    pomelo.app.get('dbclient').query( sql, args, function ( err, res)
    {
        if( err)
        {
            cb( err, false);
        }
        else
        {
            cb( null, true);
        }
    });
}
