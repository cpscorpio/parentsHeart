/**
 * Created by cp on 1/6/14.
 */

var formula = module.exports;


/**
 * convert the date according to format
 * @param {Object} date
 * @param {String} format
 * @param {String}
 */
formula.timeFormat = function(date) {
    var n = date.getFullYear();
    var y = date.getMonth() + 1;
    var r = date.getDate();
    var mytime = date.toLocaleTimeString();
    var mytimes = n + "-" + y + "-" + r + " " + mytime;
    return mytimes;
}

function check(num) {
    return num > 9 ? num : '0' + num;
}