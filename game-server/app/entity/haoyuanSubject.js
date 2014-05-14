/**
 * Created by cp on 1/24/14.
 */

function HaoyuanSubject(opts)
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

module.exports = HaoyuanSubject;

HaoyuanSubject.prototype.toJSON = function()
{
    return {
        id : this.id,
        name : this.name
    };
};

HaoyuanSubject.prototype.data = function()
{
    return {
        subject_id : this.id,
        subject_name : this.name
    };
};