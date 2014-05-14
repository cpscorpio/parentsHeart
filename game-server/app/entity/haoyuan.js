/**
 * Created by cp on 1/24/14.
 */

var utils = require('../util/utils')
function Haoyuan(opts)
{
    if( arguments.length == 0)
    {
        this.id = 0;
        this.hospital = 0;
        this.subject = 0;
        this.type = 1;
        this.doctor = "";
        this.date = "";
        this.number = 0;
    }
    else
    {
        this.id = opts.id;
        this.hospital = opts.hospital;
        this.subject = opts.subject;
        this.type = opts.type;
        this.doctor = opts.doctor;
        this.date = opts.date;
        this.number = opts.number;
    }

}


module.exports = Haoyuan;

Haoyuan.prototype.toJSON = function()
{
    return {
        id : this.id,
        hospital : this.hospital,
        subject : this.subject,
        type : this.type,
        doctor : this.doctor ,
        date : utils.DateFormat(this.date,"yyyy-MM-dd"),
        number : this.number
    };
};

Haoyuan.prototype.data = function()
{
    return {
        subject : this.subject,
        type : this.type,
        doctor : this.doctor ,
        date : utils.DateFormat(this.date,"yyyy-MM-dd"),
        number : this.number
    };
};