/**
 * Created by cp on 1/9/14.
 */
var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var pomelo = require('pomelo');

var consts = require('../consts/consts');
var utils = require('../util/utils');

var Disease = require('../entity/disease');

var diseaseDao = module.exports;


diseaseDao.getDiseasesMap = function ( cb )
{
    var sql = 'select * from disease';
    pomelo.app.get('dbclient').insert(sql, null, function ( err, res)
    {
        var diseases = new Array();
        try
        {
            if (err)
            {
                log.error('select * from disease failed !' + err.message);
            }
            else
            {
                for (var i = 0; i < res.length; i++)
                {
                    var disease = new Disease;
                    disease.id = res[i].id;
                    disease.name = res[i].name;
                    disease.department = res[i].department_id;
                    diseases[disease.id] = disease;
                }
            }
        }
        catch (e)
        {
            utils.sendMail(e.message, e.stack);
            log.error(e.message);
            err = e;
        }
        finally
        {

            utils.invokeCallback(cb, err, diseases);
        }

    });
}

diseaseDao.getDiseases = function ( cb )
{
    var sql = 'select * from disease';
    pomelo.app.get('dbclient').insert(sql, null, function ( err, res)
    {
        var diseases = new Array();
        try
        {
            if (err)
            {
                log.error('select * from disease failed !' + err.message);
            }
            else
            {

                for (var i = 0; i < res.length; i++)
                {
                    var disease = new Disease;
                    disease.id = res[i].id;
                    disease.name = res[i].name;
                    disease.department = res[i].department_id;
                    diseases.push(disease);
                }

            }
        }
        catch (e)
        {
            utils.sendMail(e.message, e.stack);
            log.error(e.message);
            err = e;
        }
        finally
        {
            utils.invokeCallback(cb, err, diseases);
        }

    });
}

diseaseDao.getDiseasesByDepartmentId = function ( id, cb )
{
    var sql = 'select * from disease where department_id = ?';
    var args = [id];
    pomelo.app.get('dbclient').insert(sql, args, function ( err, res)
    {
        var diseases = new Array();
        try
        {
            if (err)
            {
                log.error('select * from disease failed !' + err.stack);
            }
            else
            {

                for (var i = 0; i < res.length; i++)
                {
                    var disease = new Disease;
                    disease.id = res[i].id;
                    disease.name = res[i].name;
                    disease.department = res[i].department_id;
                    diseases.push(disease) ;
                }

            }
        }
        catch (e)
        {
            utils.sendMail(e.message, e.stack);
            log.error(e.message);
            err = e;
        }
        finally
        {
            utils.invokeCallback(cb, err, diseases);
        }

    });
}