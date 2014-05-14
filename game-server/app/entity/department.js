/**
 * Created by cp on 1/6/14.
 */
var Disease = require('./disease')

var consts = require('../consts/consts');

function Department()
{
    this.id = 0;
    this.name = "";
    this.category = 0;
    this.illnesses = new Array();
}


module.exports = Department;

Department.prototype.toJSON = function()
{
    return {
        subject_id: this.id,
        subject:this.name,
        category : this.category,
        illnesses:this.illnesses
    };
};