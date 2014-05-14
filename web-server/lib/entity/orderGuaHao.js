/**
 * Created by chenpeng on 14-3-13.
 */


var utils = require('../util/utils')
function OrderGuaHao(opts)
{
    if( arguments.length == 0)
    {
        this.id = 0;
        this.order_id = "";
        this.user_id = 0;
        this.worker_id = 0;
        this.user_contact = "";
        this.worker_name = "";
        this.worker_contact = "";
        this.type = 0;
        this.category = 0;
        this.hospital = 0;
        this.city = 0;
        this.department = 0;
        this.price = 0;
        this.comment = 0;
        this.comment_desc = "";
        this.need_medical_record = 0;
        this.have_health_insurance = 0;
        this.name = "";
        this.sex = 0;
        this.id_card = "";
        this.need_time = "";
        this.birthday = "";
        this.status = 0;
        this.ctime = null;
        this.mtime = null;
        this.refuseReason = "";
        this.user_uid = '';
        this.user_sid = '';
        this.workers = new Array();
    }
    else
    {
        this.id = opts.id;
        this.order_id = opts.order_id;
        this.user_id = opts.user_id;
        this.worker_id = opts.worker_id;
        this.user_contact = opts.user_contact;
        this.worker_name = opts.worker_name;
        this.worker_contact = opts.worker_contact;
        this.type = opts.type;
        this.category = opts.category;
        this.hospital = opts.hospital;
        this.city = opts.city;
        this.department = opts.department;
        this.price = opts.price;
        this.comment = opts.comment;
        this.comment_desc = opts.comment_desc;
        this.need_medical_record = opts.need_medical_record;
        this.have_health_insurance = opts.have_health_insurance;
        this.name = opts.name;
        this.sex = opts.sex;
        this.id_card = opts.id_card;
        this.need_time = opts.need_time;
        this.birthday = opts.birthday;
        this.status = opts.status;
        this.ctime = opts.ctime;
        this.mtime = opts.mtime;
        this.refuseReason = opts.refuseReason;

        this.user_uid = opts.user_uid;
        this.user_sid = opts.user_sid;
        if(opts.workers &&  typeof opts.workers == 'string')
        {
            this.workers = opts.workers.split(',');
        }
        else
        {
            this.workers = opts.workers;
        }
    }
}

module.exports = OrderGuaHao;

OrderGuaHao.prototype.toJSON = function()
{
    return {
        id:this.id,
        order_id:this.order_id,
        user_id:this.user_id,
        worker_id:this.worker_id,
        worker_name:this.worker_name,
        user_contact:this.user_contact,
        worker_contact:this.worker_contact,
        type:this.type,
        category:this.category,
        hospital:this.hospital,
        city:this.city,
        department:this.department,
        price:this.price,
        comment:this.comment,
        comment_desc:this.comment_desc,
        need_medical_record:this.need_medical_record,
        have_health_insurance:this.have_health_insurance,
        name:this.name,
        sex:this.sex,
        id_card:this.id_card,
        need_time:utils.DateFormat(this.need_time,"yyyy-MM-dd"),
        birthday:utils.DateFormat(this.birthday,"yyyy-MM-dd"),
        status:this.status,
        ctime:utils.DateFormat(this.ctime),
        mtime:utils.DateFormat(this.mtime),
        workers:this.workers
    }
};

OrderGuaHao.prototype.simple = function()
{
    return {
        id:this.id,
        order_id:this.order_id,
        worker_id:this.worker_id,
        worker_name:this.worker_name,
        user_contact:this.user_contact,
        worker_contact:this.worker_contact,
        name:this.name,
        status:this.status,
        ctime:utils.DateFormat(this.ctime)
    }
};