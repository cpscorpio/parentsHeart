/**
 * Created by cp on 1/8/14.
 */
function Log()
{
    this.path = "/";
    this.line = 0;
    this.arguments = new Array();
}


module.exports = Log;

Log.prototype.toJSON = function()
{
    return {
        path: this.path,
        line:this.line,
        arguments:this.arguments
    };
};