/**
 * Created by chenpeng on 14-3-21.
 */

module.exports = function() {
    return new Filter();
}

var Filter = function() {
};

Filter.prototype.before = function (msg, session, next) {
    console.log(msg);

    next();
};

Filter.prototype.after = function (err, msg, session, resp, next) {
    if (session.__abuse__) {
        var user_info = session.uid.split('*');
        console.log('abuse:' + user_info[0] + " at room " + user_info[1]);
    }
    console.log(err.stack);
    next(err);
};