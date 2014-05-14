/**
 * Created by cp on 1/21/14.
 */
function City(opts)
{
    if( arguments.length == 0)
    {
        this.id = 0;
        this.province_id = 0;
        this.name = "";
    }
    else
    {
        this.id = opts.id;
        this.province_id = opts.province_id;
        this.name = opts.name;
    }

}


module.exports = City;

City.prototype.toJSON = function()
{
    return {
        id: this.id,
        province_id:this.province_id,
        name:this.name
    };
};

City.prototype.data = function()
{
    return {
        id: this.province_id,
        name:this.name
    };
};