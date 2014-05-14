/**
 * Created by cp on 1/9/14.
 */
var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var pomelo = require('pomelo');
var async = require('async')

var consts = require('../consts/consts');
var utils = require('../util/utils');


var hospitalDao = require('./hospitalDao');
var Department = require('../entity/department');

var departmentDao = module.exports;


departmentDao.getDepartments = function ( cb)
{
    var sql = 'select * from department';
    pomelo.app.get('dbclient').insert(sql, null, function ( err, res)
    {
        var departments = new Array();
        try
        {
            if (err)
            {
                log.error('select * from department failed !' + err.stack);
            }
            else
            {
                for ( var i = 0; i < res.length ; i ++)
                {
                    var department = new Department;
                    department.id = res[i].id;
                    department.name = res[i].name;
                    department.category = res[i].type;
                    departments.push( department);
                }
            }
        }
        catch ( e)
        {
            utils.sendMail(e.message, e.stack);
            err =e;
            log.error(e);
        }
        finally
        {
            utils.invokeCallback(cb, err, departments);
        }

    });
}


departmentDao.getDepartmentsMap = function ( cb)
{

    var sql = 'select * from department';
    pomelo.app.get('dbclient').query (sql, null, function ( err, res)
    {
        var departments = new Array();
        try
        {
            if (err)
            {
                log.error('select * from department failed !' + err.stack);
            }
            else
            {

                for ( var i = 0; i < res.length ; i ++)
                {
                    var department = new Department;
                    department.id = res[i].id;
                    department.name = res[i].name;
                    department.category = res[i].type;
                    departments[department.id] = department;
                }
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
            utils.invokeCallback(cb , err, departments);
        }

    });
}

departmentDao.getDepartmentsByHospital = function (hospital, cb)
{
    async.parallel([
        function ( callback)
        {
            hospitalDao.getHospitalById(hospital,function ( err, res)
            {
                callback( err, res);
            });
        },
        function ( callback)
        {
            departmentDao.getDepartmentsMap(function ( err, res)
            {
                callback ( err, res);
            })
        }
    ],
    function (err, res)
    {
        var hospitalDepartments = new Array();

        try
        {
            if( err)
            {
                log.error(err);
            }
            else
            {
                var hospital = res[0];
                var departments = res[1];

                if( hospital && departments)
                {
                    var departmentIds = hospital.departments_str.split(',');
                    for ( var i = 0; i < departmentIds.length; i++)
                    {
                        hospitalDepartments.push(departments[departmentIds[i]]);
                    }

                }
            }

        }
        catch (e)
        {
            utils.sendMail(e.message, e.stack);
            err = e;
            log.error(e);
        }
        finally
        {
            utils.invokeCallback(cb, err, hospitalDepartments);
        }



    });

}

departmentDao.getDepartmentsByType = function (type, cb)
{
    cb(null,null);
}