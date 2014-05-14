/**
 * Created by cp on 1/22/14.
 */

var utils = require('../util/utils')

function Worker(opts){
    if(arguments.length == 0){
        this.id = 0;
        this.name = "";
        this.phone_number = "";
        this.online = false;
        this.credits = 0;
        this.ctime = new Date();
        this.city = 0;
        this.hospitals = new Array();
//        this.uid = "";
//        this.token = "";
//        this.image = "";

    }else{
        this.id = opts.id;
        this.online = Boolean(opts.online);
        this.name = opts.name;
        this.phone_number = opts.phone_number;
        this.credits = opts.credits;
        this.ctime = opts.ctime;
        this.city = opts.city;

        if( opts.hospitals && "string"==(typeof opts.hospitals))
        {

            this.hospitals = opts.hospitals.split(",");
            this.hospitals = utils.toIntArray(this.hospitals);
        }
        else
        {
            this.hospitals = opts.hospitals;
        }
    }

}

module.exports = Worker;

Worker.prototype.toJSON = function()
{

    return {
        id: this.id,
        name: this.name,
        online:this.online,
        phone_number:this.phone_number,
        ctime:utils.DateFormat(this.ctime),
        credits:this.credits,
        city:this.city,
        hospitals:this.hospitals
    };
};
