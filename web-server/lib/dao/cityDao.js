/**
 * Created by chenpeng on 14-2-24.
 */
var cityDao = module.exports;
var utils = require('../util/utils');

var mysql = require('./mysql/mysql').init();

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;

cityDao.getCityList = function ( cb)
{
    var app = require('../../app');
    var citys = app.get('__citys');
    if( citys)
    {
        cb( null, citys);
        return ;
    }
    var sql = 'select * from city';
    mysql.query(sql, null, function ( err, res)
    {
        citys = [];
        try
        {
            if (err)
            {
                log.error('select * from city failed !' + err.stack);

            }
            else
            {
                for ( var i = 0; i < res.length ; i ++)
                {
                    var city = {
                        id:res[i].province_id,
                        name:res[i].name
                    };
                    citys[city.id] =  city;
                }
                if( citys && citys.length > 0)
                {
                    app.set('__citys',citys);
                }
            }
        }
        catch ( e)
        {
            log.error(e.stack);
            utils.sendMail(e.message, e.stack);
            err = e;
        }
        finally
        {
            cb(err, citys);
        }


    });
}