/**
 * Created by chenpeng on 14-3-13.
 */
var utils = require('../util/utils')
function OrderService(opts)
{
    if( opts)
    {
        this.id = opts.id;
        this.order_id = opts.order_id;
        this.type = opts.type;
        this.service_id = opts.service_id;
        this.mtime = utils.DateFormat(opts.mtime) ;
        this.ctime = utils.DateFormat(opts.ctime);
        this.user_id = opts.user_id;
        this.user_phone_number = opts.user_phone_number;
        this.comment = opts.comment;
        this.comment_desc = opts.comment_desc;
        this.status = opts.status;
        this.service_name = opts.service_name;
    }
    else
    {
        this.id = 0;
        this.order_id = "";
        this.type = 0;
        this.service_id = 0;
        this.mtime = utils.DateFormat();
        this.ctime = utils.DateFormat();
        this.user_id = 0;
        this.user_phone_number = "";
        this.comment = 0;
        this.comment_desc = "";
        this.status = 0;
        this.service_name = "";
    }
}

module.exports =OrderService;


OrderService.prototype.toJSON = function()
{
    return {
        id : this.id,
        order_id : this.order_id,
        type : this.type,
        service_id : this.service_id,
        mtime : utils.DateFormat(this.mtime),
        ctime : utils.DateFormat(this.ctime),
        user_id : this.user_id,
        user_phone_number : this.user_phone_number,
        comment : this.comment,
        comment_desc : this.comment_desc,
        status : this.status,
        service_name : this.service_name
    }
}

OrderService.prototype.simple = function()
{
    return {
        id : this.id,
        order_id : this.order_id,
        service_id : this.service_id,
        ctime : utils.DateFormat(this.ctime),
        user_contact : this.user_phone_number,
        status : this.status,
        service_name : this.service_name
    }
}
