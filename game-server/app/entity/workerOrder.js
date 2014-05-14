/**
 * Created by chenpeng on 14-2-18.
 */

var utils = require('../util/utils')

function workerOrder ( opts) {
    if(arguments.length == 0)
    {
        this.id = 0;
        this.order_id = "";
        this.worker = "";
        this.reason = "";
        this.ctime = new Date();
        this.refuse = 0;
    }
    else
    {
        this.id = opts.id;
        this.order_id = opts.order_id;
        this.worker = opts.worker;
        this.reason = opts.reason;
        this.ctime = opts.ctime;
        this.refuse = opts.refuse;
    }

}

module.exports = workerOrder;

workerOrder.prototype.toJSON = function()
{
    return {
        id : this.id,
        order_id : this.order_id,
        worker : this.worker,
        reason : this.reason,
        ctime : this.ctime,
        refuse : this.refuse
    };
};