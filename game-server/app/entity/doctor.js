/**
 * Created by cp on 1/8/14.
 */

/**
 * Created by cp on 1/8/14.
 */

var utils = require('../util/utils')
function Doctor(opts){
    if(arguments.length == 0){
        this.id = 0;
        this.name = "";
        this.uid = "";
        this.token = "";
        this.hospital = "";
        this.work_phone_number = "";
        this.self_phone_number = "";
        this.job_title = "";
        this.departments = new Array();
        this.diseases = new Array();
        this.price = 0.1;
        this.online = false;
        this.image = "";
        this.credits = 0;
        this.earnings = 0;
        this.ctime = new Date();

    }else{
        this.id = opts.id;
        this.image = opts.image;
        this.online = opts.online;
        this.name = opts.name;
        this.uid = opts.uid;
        this.token = opts.token;
        this.hospital = opts.hospital;
        this.work_phone_number = opts.work_phone_number;
        this.self_phone_number = opts.self_phone_number;
        this.job_title = opts.job_title;
        this.departments = opts.departments;
        this.diseases = opts.diseases;
        this.price = opts.price;
        this.credits = opts.credits;
        this.earnings = opts.earnings;
        this.ctime = opts.ctime;
    }

}

module.exports = Doctor;

Doctor.prototype.toJSON = function()
{

    return {
        doctor_id: this.id,
        name: this.name,
        hospital:this.hospital,
        subject:this.departments[0],
        online:this.online,
        image:utils.getImage(this.id),
        title:this.job_title
    };
};
Doctor.prototype.data = function()
{
    return {
        id: this.id,
        uid: this.uid,
        name: this.name,
        hospital:this.hospital,
        departments:this.departments,
        diseases:this.diseases,
        price:this.price,
        online:this.online,
        image:utils.getImage(this.id),
        token : this.token,
        work_phone_number:this.work_phone_number,
        self_phone_number: this.self_phone_number,
        job_title:this.job_title,
        credits:this.credits,
        earnings:this.earnings,
        ctime:utils.DateFormat(this.ctime)
    };
};