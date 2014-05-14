/**
 * Created by cp on 1/6/14.
 */
var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var pomelo = require('pomelo');
var async = require('async');

var consts = require('../consts/consts');
var utils = require('../util/utils');
var Disease = require('../entity/disease');
var Department = require('../entity/department');
var UserInitInfo = require('../entity/userInitInfo');
var hospitalDao = require('./hospitalDao');
var diseaseDao = require('./diseaseDao');
var departmentDao = require('./departmentDao');
var doctorDao = require('./doctorDao');
var priceDao = require('./priceDao')
var jobTitleDao = require('./jobTitleDao')
var initInfoDao = module.exports;

initInfoDao.getUserInitInfo = function (cb)
{
    async.parallel([
        function ( callback)
        {
            priceDao.getPrices(function ( err, res)
            {
               callback( err, res);
            });
        },
        function ( callback)
        {
            departmentDao.getDepartmentsMap( function ( err, res)
            {
               callback( err, res);
            });
        },
        function ( callback)
        {
            diseaseDao.getDiseases( function ( err, res)
            {
                callback ( err, res);
            })
        },
        function ( callback)
        {
            hospitalDao.getHospitals( function ( err, res)
            {
                callback ( err, res);
            })
        },
        function ( callback)
        {
            jobTitleDao.getJobTitles( function ( err, res)
            {
                callback( err, res);
            })
        }
    ],
    function ( err, result)
    {
        var initInfo = new UserInitInfo();

        try
        {
            if( !err)
            {
                var prices = result[0];
                var departmentMap = result[1];
                var diseases = result[2];
                var hospitals = result[3];
                var jobTitles = result[4];


                if( diseases && departmentMap)
                {
                    for( var i = 0; i < diseases.length; i++)
                    {
                        var disease = diseases[i];
                        departmentMap[disease.department].illnesses.push(disease.id);
                        if(disease.department > 2) {
                            if(departmentMap[disease.department].category == 0)
                            {
                                departmentMap[1].illnesses.push(disease.id);
                            }
                            else
                            {
                                departmentMap[2].illnesses.push(disease.id);
                            }
                        }

                    }
                }
                var departments = departmentMap.filter( function(v,i)
                {
                    if(v)
                    {
                        return v;
                    }
                });
                if( departments && departments.length > 0)
                {
                    var disease = new Disease;
                    disease.id = 0;
                    disease.name = '其他疾病';
                    disease.department = 0;
                    diseases.push(disease);

                    for( var i = 0; i < departments.length; i++)
                    {
                        departments[i].illnesses.push(disease.id);
                    }
                }
                initInfo.hospitals = hospitals;
                initInfo.illnesses = diseases;
                initInfo.prices = prices;
                initInfo.subjects = departments;
                initInfo.titles = jobTitles.filter( function(v,i)
                {
                    if(v)
                    {
                        return v;
                    }
                });
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
            initInfo.error = utils.Error(err);
            utils.invokeCallback( cb, err, initInfo);
        }
    });

}