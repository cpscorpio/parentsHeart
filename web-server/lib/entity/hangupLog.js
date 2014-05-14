/**
 * Created by chenpeng on 14-3-17.
 */

var utils = require('../util/utils')
function HandUpLog(opts)
{
    if( arguments.length == 0)
    {
        this.id = 0;
        this.ctime = "";
        this.uuid = 0;
        this.fromphone = 0;
        this.tovirtualnumber = "";
        this.fromphoneguishudi = "";
        this.torealphoneguishudi = 0;
        this.hung = 0;
        this.torealphone = 0;
        this.calltime = 0;
        this.receivetime = 0;
        this.endtime = 0;
        this.recordfile = null;
        this.exptime = null;
        this.avatime = '';
        this.order_id = null;
    }
    else
    {
        this.id = opts.id;
        this.ctime = utils.DateFormat(opts.ctime);
        this.uuid = opts.uuid;
        this.fromphone = opts.fromphone;
        this.tovirtualnumber = opts.tovirtualnumber;
        this.fromphoneguishudi = opts.fromphoneguishudi;
        this.torealphoneguishudi = opts.torealphoneguishudi;
        this.hung = opts.hung;
        this.torealphone = opts.torealphone;
        this.calltime = opts.calltime;
        this.receivetime = opts.receivetime;
        this.endtime = opts.endtime;
        this.recordfile = opts.recordfile;
        this.exptime = opts.exptime;
        this.avatime = opts.avatime;
        this.order_id = opts.order_id;
    }
}

module.exports = HandUpLog;

HandUpLog.prototype.toJSON = function()
{
    return {
        id : this.id,
        ctime : utils.DateFormat(this.ctime),
        uuid : this.uuid,
        fromphone : this.fromphone,
        tovirtualnumber : this.tovirtualnumber,
        fromphoneguishudi : this.fromphoneguishudi,
        torealphoneguishudi : this.torealphoneguishudi,
        hung : this.hung,
        torealphone : this.torealphone,
        calltime : utils.DateMSFormat(this.calltime),
        receivetime : utils.DateMSFormat(this.receivetime),
        endtime : utils.DateMSFormat(this.endtime),
        talktime : this.receivetime > 0 ? this.endtime - this.receivetime : this.receivetime , //通话时间
        recordfile : this.recordfile,
        exptime : this.exptime > 0 ? utils.DateMSFormat(this.exptime) : this.exptime,
        avatime : this.avatime,
        order_id : this.order_id ? this.order_id : undefined
    };
};