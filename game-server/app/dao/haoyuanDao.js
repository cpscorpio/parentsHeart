/**
 * Created by cp on 1/21/14.
 */

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var pomelo = require('pomelo');

var consts = require('../consts/consts');
var utils = require('../util/utils');

var Haoyuan = require('../entity/haoyuan');
var HaoyuanHospital = require('../entity/haoyuanHospital');
var HaoyuanSubject = require('../entity/haoyuanSubject');
var HaoyuanType = require('../entity/haoyuanType');

haoyuanDao = module.exports;


haoyuanDao.getHaoyuanHospital = function(cb)
{
    var haoyuan_hospital = pomelo.app.get('haoyuan_hospital');
    if( !haoyuan_hospital )
    {
        haoyuan_hospital = new Array();
        var sql = "select * from haoyuan_hospital";
        pomelo.app.get('dbclient').query( sql, null, function ( err, res)
        {

            try
            {
                if( !err && res && res.length > 0)
                {
                    for (var i = 0; i< res.length; i++)
                    {
                        haoyuan_hospital.push(new HaoyuanHospital(res[i]).data())
                    }
                    pomelo.app.set('haoyuan_hospital', haoyuan_hospital);
                }
                else if( err)
                {
                    log.error(err);
                }
            }
            catch (e)
            {
                utils.sendMail(e.message, e.stack);
                log.error(e);
                err = e;
            }
            finally
            {
                utils.invokeCallback( cb, err, haoyuan_hospital);
            }

        })
    }
    else
    {
        cb( null, haoyuan_hospital);
    }
}
haoyuanDao.getHaoyuanHospitalByCity = function(city, cb)
{
    var haoyuan_hospital = pomelo.app.get('haoyuan_hospital_city_' + city);
    if( !haoyuan_hospital )
    {
        haoyuan_hospital = new Array();
        var sql = "select * from haoyuan_hospital where city=?";
        var args = [city];
        pomelo.app.get('dbclient').query( sql, args, function ( err, res)
        {

            try
            {
                if( !err && res && res.length > 0)
                {
                    for (var i = 0; i< res.length; i++)
                    {
                        haoyuan_hospital.push(new HaoyuanHospital(res[i]).dataNoCity())
                    }
                    pomelo.app.set('haoyuan_hospital_city_' + city, haoyuan_hospital);
                }
                else if( err)
                {
                    log.error(err);
                }
            }
            catch (e)
            {
                utils.sendMail(e.message, e.stack);
                log.error(e);
                err = e;
            }
            finally
            {
                utils.invokeCallback( cb, err, haoyuan_hospital);
            }

        })
    }
    else
    {
        cb( null, haoyuan_hospital);
    }
}
haoyuanDao.getHaoyuanSubject= function(cb)
{
    var haoyuan_subject = pomelo.app.get('haoyuan_subject');
    if( !haoyuan_subject )
    {
        haoyuan_subject = new Array();
        var sql = "select * from haoyuan_subject";
        pomelo.app.get('dbclient').query( sql, null, function ( err, res)
        {

            try
            {
                if( !err && res && res.length > 0)
                {
                    for (var i = 0; i< res.length; i++)
                    {
                        haoyuan_subject.push(new HaoyuanSubject(res[i]).data())
                    }
                    pomelo.app.set('haoyuan_subject', haoyuan_subject);
                }
                else if( err)
                {
                    log.error(err);
                }
            }
            catch (e)
            {
                utils.sendMail(e.message, e.stack);
                log.error(e);
                err = e;
            }
            finally
            {
                utils.invokeCallback( cb, err, haoyuan_subject);
            }

        })
    }
    else
    {
        cb( null, haoyuan_subject);
    }
}
haoyuanDao.getHaoyuanType = function(cb)
{
    var haoyuan_type = pomelo.app.get('haoyuan_type');
    if( !haoyuan_type )
    {
        haoyuan_type = new Array();
        var sql = "select * from haoyuan_type";
        pomelo.app.get('dbclient').query( sql, null, function ( err, res)
        {

            try
            {
                if( !err && res && res.length > 0)
                {
                    for (var i = 0; i< res.length; i++)
                    {
                        haoyuan_type.push(new HaoyuanType(res[i]).data())
                    }
                    pomelo.app.set('haoyuan_type', haoyuan_type);
                }
                else if( err)
                {
                    log.error(err);
                }
            }
            catch (e)
            {
                utils.sendMail(e.message, e.stack);
                log.error(e);
                err = e;
            }
            finally
            {
                utils.invokeCallback( cb, err, haoyuan_type);
            }

        })
    }
    else
    {
        cb( null, haoyuan_type);
    }
}

haoyuanDao.getHaoyuan = function (hospital, cb)
{
    if(hospital)
    {
        var sql = "select * from haoyuan_number where hospital = ? and date < date(date_add(now(),INTERVAL 7 DAY)) and date >= curdate() order by date";
        var args = [hospital];
        pomelo.app.get('dbclient').query(sql,args,function ( err, res)
        {
            if( err)
            {
                cb(utils.Error(err), null);
            }
            else
            {
                var haoyuans = {};

                if( res && res.length > 0)
                {
                    for( var i = 0; i < res.length; i++)
                    {

                        var haoyuan = new Haoyuan(res[i]).data();
                        if(!haoyuans[haoyuan.date])
                        {
                           haoyuans[haoyuan.date] = [];
                        }
                        haoyuans[haoyuan.date].push(haoyuan)
                    }
                }
                var haoyuanList = [];
                for( var k in haoyuans)
                {
                    haoyuanList.push(haoyuans[k]);
                }
                log.info(haoyuans.toString());
                log.info(haoyuanList.toString());
                cb(null, haoyuanList);
            }
        })
    }
}