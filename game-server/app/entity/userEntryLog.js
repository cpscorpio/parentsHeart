/**
 * Created by cp on 1/20/14.
 */
function UserEntryLog(opts){
    if(arguments.length == 0)
    {
        this.id = 0;
        this.uid = "";
        this.device_token = "";
        this.client = "";
        this.version = "";
    }
    else
    {
        this.id = opts.id;
        this.uid = opts.uid;
        this.device_token = opts.device_token;
        this.client = opts.client;
        this.version = opts.version;
    }

}

module.exports = UserEntryLog;

UserEntryLog.prototype.toJSON = function()
{
    return {
        id: this.id,
        uid: this.uid,
        device_token: this.device_token,
        client: this.client,
        version: this.version
    };
};