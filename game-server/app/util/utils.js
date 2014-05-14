/**
 * Created by cp on 1/6/14.
 */


var consts = require('../consts/consts')
var pomelo = require('pomelo')
var utils = module.exports;

// control variable of func "myPrint"
//var isPrintFlag = false;
var isPrintFlag = true;

utils.getImage = function ( id)
{
    if(id && id > 0)
    {
        return "http://" + pomelo.app.get("__host") + ":3000/Image_doctor" + id +".jpg";
    }
    else
    {
        return "http://" + pomelo.app.get("__host") + ":3000/Image_doctor" +".jpg";
    }

}
/**
 * Check and invoke callback function
 */
utils.invokeCallback = function(cb)
{
    if(!!cb && typeof cb === 'function')
    {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

utils.getPriceIndex = function (prices, price)
{
    console.log(prices, price);
    var maxPriceIndex = 0;
    var priceIndex = -1;
    for ( var i = 0; i < prices.length; i++)
    {
        if(prices[i])
        {
            if(prices[maxPriceIndex])
            {
                maxPriceIndex = prices[maxPriceIndex].price < prices[i].price ? i : maxPriceIndex;
            }
            else
            {
                maxPriceIndex = i;
            }
            if(prices[i].price >= price)
            {
                if( priceIndex < 0 || prices[i].price < prices[priceIndex].price)
                {
                    priceIndex = i;
                }

            }
        }
    }
    if(priceIndex < 0)
    {
        return maxPriceIndex;
    }
    else
    {
        return priceIndex;
    }
}
utils.Error = function (err)
{
    if(err)
    {
        return {
            code:err.code == undefined ? 500 : err.code,
            message:err.message
        }
    }
    else
    {
        return {
            code:0,
            message:""
        }
    }
}
utils.ArrayIsContains = function (arr, key)
{
    console.log(arr,key);
    for ( var i = 0; i < arr.length; i++)
    {
        console.log(i);
        if( arr[i] == key)
        {
            return true;
        }
    }
    return false;
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

utils.DateFormat = function ( date, format)
{
    if(format == undefined || format == "")
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
// print the file name and the line number ~ end

function request(url,data,method,fn)
{
    data = data || {};
    var content=require('querystring').stringify(data);
    var parse_u=require('url').parse(url,true);
    var isHttp=parse_u.protocol=='http:';
    var options = {
        host:parse_u.hostname,
        port:parse_u.port||(isHttp?80:443),
        path:parse_u.path,
        method:method,
        headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'Content-Length':content.length
        }
    };
    var req = require(isHttp?'http':'https').request(options,function(res){
        var _data='';
        res.on('data', function(chunk){
            _data += chunk;
        });
        res.on('end', function(){
            fn!=undefined && fn(_data);
        });
    });
    req.write(content);
    req.end();
}

utils.post = function(url, data, cb)
{
    request(url,data,"POST",cb);
}

utils.get = function(url, cb)
{
    request(url,null,"GET",cb);
}
/**
 * 申请临时号码
 * @param companyCode   企业代码
 * @param phoneNumber   用户号码
 * @param realNumber    专家号码
 * @param expTime       有效时间,单位:分钟
 * @param avaTime       购买通话时间,单位:分钟
 * @param cb            回掉结果
 */
utils.virtualNumberOpen = function ( companyCode, phoneNumber, realNumber, expTime, avaTime, cb)
{
    if(companyCode && phoneNumber && realNumber && expTime && avaTime)
    {
        expTime = Math.ceil(new Date().getTime()/1000) + expTime * 60;   //有效时间 Unix时间戳:秒
//        var url = "http://test.wgwb.cui9.com/v2/company.php?act=open" +
//                    "&companyCode=" + companyCode +
//                    "&phoneNumber=" + phoneNumber +
//                    "&realNumber=" + realNumber +
//                    "&expTime=" + expTime +
//                    "&avaTime=" + avaTime;
//        console.log(url);
//        utils.get(url,cb);

        utils.rsa_encrypt({
            companyCode:companyCode,
            phoneNumber:phoneNumber,
            realNumber:realNumber,
            expTime:expTime,
            avaTime:avaTime,
            dialCount:consts.VIRTUAL_NUMBER.DIAL_COUNT
        }, function ( data)
        {
            var url = "http://wgwb.cui9.com/v2/company.php?act=open&param=" + data;
            utils.get( url, cb);
        });
    }
    else
    {
        cb({error:consts.ERROR.MISSING_PARAMS})
    }

}
/**
 * 关闭临时号码
 * @param companyCode   企业代码
 * @param id            唯一表示ID
 * @param cb
 */
utils.virtualNumberClose = function ( companyCode, id , cb)
{
    if( companyCode && id)
    {
        utils.rsa_encrypt({
            companyCode:companyCode,
            id:id
        }, function ( data)
        {
            var url = "http://wgwb.cui9.com/v2/company.php?act=close&param=" + data;
            utils.get( url, cb);
        });
    }
    else
    {
        cb({error:consts.ERROR.MISSING_PARAMS})
    }
}

utils.download_file_curl = function(file_url) {   //ok
    var spawn = require('child_process').spawn;
    var fs = require('fs');
    var url = require('url');

    var DOWNLOAD_DIR = pomelo.app.getBase();
    DOWNLOAD_DIR = DOWNLOAD_DIR.substring(0,DOWNLOAD_DIR.lastIndexOf("/") + 1) + "recordfiles/";

    var file_name = url.parse(file_url).pathname.split('/').pop();

    var file = fs.createWriteStream(DOWNLOAD_DIR + file_name);
    // execute curl using child_process' spawn function
    var curl = spawn('curl', [file_url]);
    // add a 'data' event listener for the spawn instance
    curl.stdout.on('data', function(data) { file.write(data); });
    // add an 'end' event listener to close the writeable stream
    curl.stdout.on('end', function(data) {
        file.end();
        console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
    });
    // when the spawn child process exits, check if there were any errors and close the writeable stream
    curl.on('exit', function(code) {
        if (code != 0) {
            console.log('Failed: ' + code);
        }
    });
};

function toStr(str)
{
    if(typeof str == 'string')
    {
        return 's:' + str.length + ':"' + str + '";';
    }
    else if( typeof str == 'number')
    {
        return "i:" + str + ";";
    }
    return '';
}

function serialize(data)
{
    var result = '';
    var i = 0;
    for( var k in data)
    {
        i ++;
        result = result + toStr(k) + toStr(data[k]);
    }
    return "a:"+ i +":{" + result + "}";
}

utils.rsa_encrypt = function ( str, callback)
{

    var rsautl = require('rsautl')
    var util = require('util')
    var Readable = require('stream').Readable
    var Transform = require('stream').Transform


    var pubKey = '-----BEGIN PUBLIC KEY-----\n' +
        'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCsblMTk26gI9dQB3l9rAREO3Dc\n' +
        '0o7O8+AZw+6TNcxBKe4yWByIUhzHwJO1yeYb92EUPJ5bXPJVZkrwRUnY4VShw/vz\n' +
        'gdEiMd3r2dRUDghlgRaoP3N13r28tUxMXeIEAp4vQrK3/izVPUXXJUTLuQ+E6k+9\n' +
        'I/5Cn3gwO+6WHq+7SwIDAQAB\n' +
        '-----END PUBLIC KEY-----';

    util.inherits(EncriptStream, Transform)

    function EncriptStream(pubKey) {
        Transform.call(this)
        this.pubKey = pubKey
    }

    EncriptStream.prototype._transform = function(data, encoding, cb) {
        rsautl.encrypt(data.toString('utf8'), this.pubKey, function(err, data) {
            if (err)
                return cb && cb(err)
            this.push(data+"||")
            cb && cb()
        }.bind(this))
    }

    util.inherits(CutStream, Readable)

    function CutStream(str, size) {
        Readable.call(this)
        this.defaultSize = size
        this.str = str.split('')
    }

    CutStream.prototype._read = function() {
        var out
        var size = this.defaultSize

        if (!this.str.length) {
            return this.push(null)
        }
        out = this.str.splice(0, size).join('')
        this.push(out)
    }

    console.log(str,serialize(str));
    var cutter = new CutStream(serialize(str), 80)
    var encrypter = new EncriptStream(pubKey)
    var concat = require('concat-stream');

    var write = concat(function(data){
        var str = data.toString('utf8');
        var result = new Buffer(str.slice(0,-2),'utf8');
        callback(result.toString('base64'));
    })

    cutter
        .pipe(encrypter)
        .pipe(write)
}


utils.sendMail = function (message, error)
{
    var mail = require('nodemailer');
    var email = "844653009@qq.com";
    var content = message + " <br /><br />" + utils.DateFormat(new Date()) + " <br /><br />" + error.replace(new RegExp('\n','g'),'<br/>\n') ;

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
    })
}