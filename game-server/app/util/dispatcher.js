/**
 * Created by cp on 1/6/14.
 */
var crc = require('crc');

module.exports.dispatch = function(uid, connectors) {
    var index = Number(uid) % connectors.length;
    return connectors[index];
};
