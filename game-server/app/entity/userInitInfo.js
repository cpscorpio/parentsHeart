/**
 * Created by cp on 1/6/14.
 */

function UserInitInfo(opts)
{
    if( arguments.length == 0)
    {
        this.error = {};
        this.subjects = new Array();
        this.hospitals = new Array();
        this.prices = new Array();
        this.illnesses = new Array();
        this.titles = new Array();
    }
    else
    {
        this.error = opts.error;
        this.subjects = opts.subjects;
        this.hospitals = opts.hospitals;
        this.prices = opts.prices;
        this.illnesses = opts.illnesses;
        this.titles = opts.titles;
    }

}


module.exports = UserInitInfo;

UserInitInfo.prototype.toJSON = function()
{
    return {
        error:this.error,
        subjects:this.subjects,
        hospitals:this.hospitals,
        illnesses:this.illnesses,
        prices:this.prices,
        jobtitles:this.titles
    };
};