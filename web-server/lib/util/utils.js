/**
 * Created by cp on 1/6/14.
 */


var consts = require('../consts/consts')
var utils = module.exports;

// control variable of func "myPrint"
//var isPrintFlag = false;
var isPrintFlag = true;


utils.ArrayIsContains = function (arr, key)
{
    for ( var i = 0; i < arr.length; i++)
    {
        if( arr[i] == key)
        {
            return true;
        }
    }
    return false;
}

utils.sendMail = function (message, error)
{
    var mail = require('nodemailer');
    var email = "844653009@qq.com";
    var content = message + " <br /><br />" + utils.DateFormat(new Date()) + " <br /><br />" +  error.replace(new RegExp('\n','g'),'<br/>\n');

    var smtpTransport = mail.createTransport("SMTP",{
        host: "smtp.exmail.qq.com",
        secureConnection: true, // 使用 SSL
        port: 465, // SMTP 端口
        auth: {
            user: "service@xnal.cn",
            pass: "jnh123"
        }
    });
    var mailOptions = {
        from: "service@xnal.cn", // sender address
        to: email, // list of receivers
        subject: "ParentsHeart gameServer Error" + message, // Subject line
        text: content, // plaintext body
        html: content // html body
    }
    smtpTransport.sendMail(mailOptions,function(error, response){
        console.log(error, response);
    });
}

utils.toIntArray = function ( arr)
{
    if(arr && arr.length > 0)
    {
        var newArr = new Array();
        for(var i = 0; i < arr.length; i++)
        {
            newArr.push(parseInt(arr[i]));
        }
        return newArr;
    }
    else
    {
        return [];
    }
}

utils.DateMSFormat = function (ms,format)
{
    if( ms > 0)
    {
        var date = new Date();
        date.setTime(ms * 1000);
        return utils.DateFormat(date,format);
    }
    else
    {
        return "0";
    }

}
utils.DateFormat = function ( date, format)
{
    if( !format )
    {
        format = "yyyy-MM-dd hh:mm:ss";
    }

    if(date == undefined) return "0000-00-00 00:00:00";
    if( typeof  date == "string") return date;

    var o = {
        "M+" : date.getMonth()+1, //month
        "d+" : date.getDate(), //day
        "h+" : date.getHours(), //hour
        "m+" : date.getMinutes(), //minute
        "s+" : date.getSeconds(), //second
        "q+" : Math.floor((date.getMonth()+3)/3), //quarter
        "S" : date.getMilliseconds() //millisecond
    }

    if(/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
    }

    for(var k in o) {
        if(new RegExp("("+ k +")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return format;
}
/**
 * clone an object
 */
utils.clone = function(origin)
{
    if(!origin)
    {
        return;
    }

    var obj = {};
    for(var f in origin)
    {
        if(origin.hasOwnProperty(f))
        {
            obj[f] = origin[f];
        }
    }
    return obj;
};

utils.size = function(obj)
{
    if(!obj)
    {
        return 0;
    }

    var size = 0;
    for(var f in obj)
    {
        if(obj.hasOwnProperty(f))
        {
            size++;
        }
    }

    return size;
};

// print the file name and the line number ~ begin
function getStack(){
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack)
    {
        return stack;
    };
    var err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
}

function getFileName(stack) {
    return stack[1].getFileName();
}

function getLineNumber(stack){
    return stack[1].getLineNumber();
}

utils.print = function() {
    if (isPrintFlag) {
        var len = arguments.length;
        if(len <= 0) {
            return;
        }
        var stack = getStack();
        var aimStr = '\'' + getFileName(stack) + '\' @' + getLineNumber(stack) + ' : {\n';
        for(var i = 0; i < len; ++i) {
            aimStr += '\t' + arguments[i] + '\n';
        }
        console.log('\n' + aimStr + '}');
    }
};