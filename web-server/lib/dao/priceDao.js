/**
 * Created by chenpeng on 14-2-26.
 */

var priceDao = module.exports;
var utils = require('../util/utils');
var mysql = require('./mysql/mysql').init();

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;


priceDao.add = function ( price, cb)
{
    var sql = "insert into  prices ( price) values ( ?)";
    var args = [price];
    mysql.query( sql, args, function ( err, res)
    {
        console.log( err, res);
        if( !err && res )
        {
            cb( null, {
                id:res.insertId,
                price:price
            })
        }
        else{
            cb ( err, null);
        }
    });
}
priceDao.del = function ( ids, cb)
{
    var sql = 'delete from prices where id in (?)';
    var args = [ids];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}
priceDao.alter = function ( id, price,cb)
{
    var sql = 'update prices set price=? where id=?';
    var args = [price, id];
    mysql.query( sql, args, function (err, res)
    {
        cb(err, res);
    });
}
priceDao.getprices = function ( cb)
{
    var app = require('../../app');
    var prices = app.get('__prices');
    if( prices)
    {
        cb( null, prices);
        return ;
    }

    var sql = 'select * from prices';
    mysql.query(sql, null, function ( err, res)
    {
        prices = [];
        try
        {
            if (err)
            {
                log.error('select * from prices failed !' + err.stack);

            }
            else
            {
                for ( var i = 0; i < res.length ; i ++)
                {
                    var price = {
                        id:res[i].id,
                        price:res[i].price
                    };
                    prices[price.id] =  price;
                }
                if( prices && prices.length > 0)
                {
                    app.set('__prices',prices);
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
            cb(err, prices);
        }


    });
}