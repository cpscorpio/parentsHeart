/**
 * Created by chenpeng on 14-3-18.
 */

var utils = require('../util/utils')
function Doctor(opts)
{
    if( opts)
    {
        this.id = opts.id;
        this.name = opts.name;
        this.job_title = opts.job_title;
        this.hospital = opts.hospital;
        this.departments = opts.departments ;
        this.diseases = opts.diseases;
        this.uid = opts.uid;
        this.work_phone_number = opts.work_phone_number;
        this.self_phone_number = opts.self_phone_number;
        this.price = opts.price;
        this.credits = opts.credits;
        this.earnings = opts.earnings;
        this.ctime = utils.DateFormat(opts.ctime);
        this.device_token = opts.device_token;
        this.online = opts.online;
    }
    else
    {
        this.id = 0;
        this.name = "";
        this.job_title = 0;
        this.hospital = 0;
        this.departments = '';
        this.diseases = 0;
        this.uid = 0;
        this.work_phone_number = '';
        this.self_phone_number = '';
        this.price = 0;
        this.credits = 0;
        this.earnings = 0;
        this.ctime = utils.DateFormat();
        this.device_token = '';
        this.online = 0;
    }
}

module.exports =Doctor;


Doctor.prototype.toJSON = function()
{
    return {
        id : this.id,
        name : this.name,
        job_title : this.job_title,
        hospital : this.hospital,
        departments : this.departments ,
        diseases : this.diseases,
        uid : this.uid,
        work_phone_number : this.work_phone_number,
        self_phone_number : this.self_phone_number,
        price : this.price,
        credits : this.credits,
        earnings : this.earnings,
        ctime : utils.DateFormat(this.ctime),
        device_token : this.device_token,
        online : this.online
    }
}

Doctor.prototype.simple = function()
{
    return {
        id : this.id,
        name : this.name,
        job_title : this.job_title,
        hospital : this.hospital,
        departments : this.departments,
        uid : this.uid,
        work_phone_number : this.work_phone_number,
        price : this.price,
        credits : this.credits,
        earnings : this.earnings
    }
}
