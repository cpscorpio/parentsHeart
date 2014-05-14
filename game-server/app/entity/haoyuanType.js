/**
 * Created by cp on 1/24/14.
 */

function HaoyuanType(opts)
{
    if( arguments.length == 0)
    {
        this.id = 0;
        this.name = "";
        this.orderby = 0;
    }
    else
    {
        this.id = opts.id;
        this.name = opts.name;
        this.orderby = opts.orderby;
    }

}

module.exports = HaoyuanType;

HaoyuanType.prototype.toJSON = function()
{
    return {
        id : this.id,
        name : this.name
    };
};

HaoyuanType.prototype.data = function()
{
    return {
        type_id : this.id,
        type_name : this.name
    };
};
