/**
 * Created by cp on 1/14/14.
 */
var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;
var pomelo = require('pomelo');

var consts = require('../consts/consts');
var utils = require('../util/utils');

var Price = require('../entity/price');

priceDao = module.exports;

priceDao.getPrices = function ( cb)
{
   var prices = pomelo.app.get('prices');
    if( !prices )
    {
        prices = new Array();
        var sql = "select * from prices";
        pomelo.app.get('dbclient').query( sql, null, function ( err, res)
        {

            try
            {
                if( !err && res && res.length > 0)
                {
                    for (var i = 0; i< res.length; i++)
                    {
                        var price = new Price(res[i]);
                        prices[price.id] = price;
                    }
                    pomelo.app.set('prices', prices);
                }
                else if( err)
                {
                    log.error(err);
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
                utils.invokeCallback( cb, err, prices);
            }

        })
    }
    else
    {
        cb( null, prices);
    }
}