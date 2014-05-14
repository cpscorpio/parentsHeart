/**
 * Created by cp on 1/6/14.
 */
function Price(opts)
{
    if( arguments.length == 0)
    {
        this.id = 0;
        this.price = "";
    }
    else
    {
        this.id = opts.id;
        this.price = opts.price;
    }

}


module.exports = Price;

Price.prototype.toJSON = function()
{
    return {
        price_id: this.id,
        price:this.price
    };
};