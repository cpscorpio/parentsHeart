/**
 * Created by chenpeng on 14-3-13.
 */

var utils = require('../util/utils')
function OrderFindDoctor(opts)
{
    if( arguments.length == 0)
    {
        this.id = 0;
        this.order_id = "";
        this.user_id = 0;
        this.doctor_id = 0;
        this.doctor_name = "";
        this.user_contact = "";
        this.type = 0;
        this.department = 0;
        this.disease = 0;
        this.disease_desc = "";
        this.price = 0;
        this.comment = 0;
        this.comment_desc = "";
        this.status = 0;
        this.ctime = null;
        this.mtime = null;
        this.user_uid = '';
        this.user_sid = '';
        this.doctors = new Array();
        this.contact ="";
        this.uuid = 0;
        this.exptime = 0;
        this.avatime = 0;
    }
    else
    {
        this.id = opts.id;
        this.order_id = opts.order_id;
        this.user_id = opts.user_id;
        this.doctor_id = opts.doctor_id;
        this.doctor_name = opts.doctor_name;
        this.user_contact = opts.user_contact;
        this.type = opts.type;
        this.department = opts.department;
        this.disease = opts.disease;
        this.disease_desc = opts.disease_desc;
        this.price = opts.price;
        this.comment = opts.comment;
        this.comment_desc = opts.comment_desc;
        this.status = opts.status;
        this.ctime = opts.ctime;
        this.mtime = opts.mtime;
        this.user_uid = opts.user_uid;
        this.user_sid = opts.user_sid;
        if(opts.doctors &&  typeof opts.doctors == 'string')
        {
            this.doctors = opts.doctors.split(',');
        }
        else
        {
            this.doctors = opts.doctors;
        }
        this.contact = opts.contact;
        this.uuid = opts.uuid;

        this.exptime = utils.DateMSFormat(opts.exptime);
        this.avatime = opts.avatime;
    }
}

module.exports = OrderFindDoctor;

OrderFindDoctor.prototype.toJSON = function()
{
    return {
        id : this.id,
        order_id:this.order_id,
        user_id:this.user_id,
        doctor_id:this.doctor_id,
        doctor_name:this.doctor_name,
        user_contact:this.user_contact,
        type:this.type,
        department:this.department,
        disease:this.disease,
        disease_desc:this.disease_desc,
        price:this.price,
        comment:this.comment,
        comment_desc:this.comment_desc,
        status:this.status,
        contact:this.contact,
        ctime:utils.DateFormat(this.ctime),
        mtime:utils.DateFormat(this.mtime),
        doctors:this.doctors,
        uuid:this.uuid,
        exptime:this.exptime,
        avatime:this.avatime
    };
};

OrderFindDoctor.prototype.simple = function()
{
    return {
        id : this.id,
        order_id:this.order_id,
        doctor_id:this.doctor_id,
        doctor_name:this.doctor_name,
        user_contact:this.user_contact,
        status:this.status,
        ctime:utils.DateFormat(this.ctime)
    };
};