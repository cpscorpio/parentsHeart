/**
 * Created by cp on 1/21/14.
 */

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var pomelo = require('pomelo');

var consts = require('../consts/consts');
var utils = require('../util/utils');

var City = require('../entity/city');

cityDao = module.exports;

cityDao.getCityList = function (cb)
{
    var sql = "select * from city";
    pomelo.app.get('dbclient').query( sql, null, function ( err, res)
    {
        if( err)
        {
            log.error(err.stack);
            cb(err, null);
        }
        else
        {
            if(res && res.length > 0)
            {
                var citys = new Array();
                for( var i = 0; i < res.length; i++)
                {
                    var city = new City(res[i]);
                    citys.push( city.data());
                }
                cb ( null, citys);
            }
            else
            {
                log.error('no results');
                cb ( null, null);
            }
        }
    })
}