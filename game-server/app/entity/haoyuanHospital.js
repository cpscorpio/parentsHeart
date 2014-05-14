/**
 * Created by cp on 1/24/14.
 */

function HaoyuanHospital(opts)
{
    if( arguments.length == 0)
    {
        this.id = 0;
        this.name = "";
        this.city = 0;
        this.orderby = 0;
    }
    else
    {
        this.id = opts.id;
        this.name = opts.name;
        this.city = opts.city;
        this.orderby = opts.orderby;
    }

}

module.exports = HaoyuanHospital;

HaoyuanHospital.prototype.toJSON = function()
{
    return {
        id : this.id,
        name : this.name,
        city : this.city
    };
};

HaoyuanHospital.prototype.data = function()
{
    return {
        hospital_id : this.id,
        hospital_name : this.name,
        city_id : this.city
    };
};
HaoyuanHospital.prototype.dataNoCity = function()
{
    return {
        hospital_id : this.id,
        hospital_name : this.name
    };
};
