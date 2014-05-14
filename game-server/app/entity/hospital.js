/**
 * Created by cp on 1/9/14.
 */
function Hospital(opts)
{
    if(arguments.length == 0)
    {
        this.id = 0;
        this.name = "";
        this.code = 0;
        this.city = 0;
        this.province = 0;
        this.departments_str = "";
        this.departments = new Array();

    }
    else
    {
        this.id = opts.id;
        this.name = opts.name;
        this.code = opts.code;
        this.city = opts.city;
        this.province = opts.province;
        this.departments_str = opts.departments_str;
        this.departments = opts.departments;
    }

}

module.exports = Hospital;

Hospital.prototype.toJSON = function()
{
    return {
        hospital_id: this.id,
        hospital: this.name,
        subjects:this.departments,
        city:this.city,
        province:this.province
    };
};