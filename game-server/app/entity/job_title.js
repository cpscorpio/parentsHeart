/**
 * Created by cp on 1/14/14.
 */

function Job_title(opts)
{
    if( arguments.length == 0)
    {
        this.id = 0;
        this.name = "";
    }
    else
    {
        this.id = opts.id;
        this.name = opts.name;
    }

}


module.exports = Job_title;

Job_title.prototype.toJSON = function()
{
    return {
        job_title_id: this.id,
        name:this.name
    };
};