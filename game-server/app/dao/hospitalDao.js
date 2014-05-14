/**
 * Created by cp on 1/9/14.
 */
var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var pomelo = require('pomelo');

var consts = require('../consts/consts');
var utils = require('../util/utils');

var Hospital = require('../entity/hospital');

var hospitalDao = module.exports;


hospitalDao.getHospitalsMap = function ( cb)
{
    var sql = "select * from hospital";
    pomelo.app.get('dbclient').query( sql , null, function ( err, res)
    {
        var hospitals = new Array();
        try
        {
            if( !err && res && res.length > 0)
            {
                for ( var i = 0; i < res.length; i ++)
                {
                    var hospital = new Hospital;
                    hospital.id = res[i].id;
                    hospital.code = res[i].code;
                    hospital.departments_str = res[i].departments;
                    if( res[i].departments != undefined){
                        hospital.departments = utils.toIntArray(res[i].departments.split(','))
                    }

                    hospital.city = res[i].city;
                    hospital.province = res[i].province;
                    hospital.name = res[i].name;
                    hospitals[ hospital.id] = hospital;
                }
            }
            else if(err)
            {
                log.error(err);
            }
        }
        catch (e)
        {
            err = e;
            log.error(e);
            utils.sendMail(e.message, e.stack);
        }
        finally
        {
            utils.invokeCallback(cb, err, hospitals);
        }
    } );
}

hospitalDao.getHospitals = function ( cb)
{
    var sql = "select * from hospital";
    pomelo.app.get('dbclient').query( sql , null, function ( err, res)
    {

        var hospitals = new Array();
        try
        {
            if( !err && res && res.length > 0)
            {
                for ( var i = 0; i < res.length; i ++)
                {
                    var hospital = new Hospital;
                    hospital.id = res[i].id;
                    hospital.code = res[i].code;
                    hospital.departments_str = res[i].departments;
                    if( res[i].departments != undefined)
                    {
                        hospital.departments = utils.toIntArray(res[i].departments.split(','))
                    }
                    hospital.city = res[i].city;
                    hospital.province = res[i].province;
                    hospital.name = res[i].name;
                    hospitals.push(hospital) ;
                }
            }
            else if(err)
            {
                log.error(err);
            }
        }
        catch (e)
        {
            err = e;
            log.error(e);
            utils.sendMail(e.message, e.stack);
        }
        finally
        {
            utils.invokeCallback(cb, err, hospitals);
        }
    } );
}

hospitalDao.getHospitalById = function ( id, cb) {
    var sql = 'select * from hospital where id = ?';
    var args = [id];
    pomelo.app.get('dbclient').query( sql , args, function ( err, res) {
        var hospital = new Hospital;
        try
        {
            if( !err && res && res.length == 1)
            {
                hospital.id = res[0].id;
                hospital.code = res[0].code;
                hospital.departments_str = res[0].departments;
                if( res[i].departments != undefined){
                    hospital.departments = utils.toIntArray(res[0].departments.split(','))
                }
                hospital.city = res[0].city;
                hospital.province = res[0].province;
                hospital.name = res[0].name;
            }
            else
            {
                log.error(err);
            }
        }
        catch (e)
        {
            log.error(e);
            utils.sendMail(e.message, e.stack);
            err = e;
        }
        finally
        {
            utils.invokeCallback( cb, err, hospital);
        }

    } );
}

hospitalDao.getHospitalsByDepartment = function ( department, cb)
{
    var sql = "select * from hospital where departments like '%?%'";
    var args = [department];
    pomelo.app.get('dbclient').query( sql , args, function ( err, res)
    {
        var hospitals = new Array();
        try
        {
            if( !err && res && res.length > 0)
            {
                for ( var i = 0; i < res.length; i ++)
                {
                    var hospital = new Hospital;
                    hospital.id = res[i].id;
                    hospital.code = res[i].code;
                    hospital.departments_str = res[i].departments;
                    if( res[i].departments != undefined)
                    {
                        hospital.departments = utils.toIntArray(res[i].departments.split(','))
                    }
                    hospital.city = res[i].city;
                    hospital.province = res[i].province;
                    hospital.name = res[i].name;
                    hospitals.push(hospital);
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
            utils.sendMail(e.message, e.stack);
            err = e;
        }
        finally
        {
            utils.invokeCallback( cb, err, hospitals);
        }
    } );
}

