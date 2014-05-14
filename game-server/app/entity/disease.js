/**
 * Created by cp on 1/6/14.
 */

function Disease()
{
    this.id = 0;
    this.name = "";
    this.department = 0;
}


module.exports = Disease;

Disease.prototype.toJSON = function()
{
    return {
        illness_id: this.id,
        illness:this.name
    };
};