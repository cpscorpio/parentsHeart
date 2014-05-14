/**
 * Created by cp on 1/14/14.
 */

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var pomelo = require('pomelo');

var consts = require('../consts/consts');
var utils = require('../util/utils');

var JobTitle = require('../entity/job_title');

jobTitleDao = module.exports;

jobTitleDao.getJobTitles = function ( cb)
{
    var jobTitles = pomelo.app.get('jobtitle');
    if( !jobTitles )
    {
        jobTitles = new Array();
        var sql = "select * from job_title";
        pomelo.app.get('dbclient').query( sql, null, function ( err, res)
        {
            try
            {
                if( !err && res && res.length > 0)
                {
                    for (var i = 0; i< res.length; i++)
                    {
                        var jobTitle = new JobTitle(res[i]);
                        jobTitles[jobTitle.id] = jobTitle;
                    }
                    pomelo.app.set('jobtitle', jobTitles);
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
                utils.invokeCallback( cb, err, jobTitles);
            }
        })
    }
    else
    {
        cb( null, jobTitles);
    }
}