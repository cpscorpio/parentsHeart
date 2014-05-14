/**
 * Created by cp on 1/6/14.
 */
//
//var disease = require('../app/entity/disease');
//var test = new Array();
//for( var i = 0; i < 3; i++){
//    var dise = new disease;
//    dise.id = i;
//    dise.name = "is" + i;
//    test.push(dise) ;
//}
//
//console.log(test);
////
//function DateFormat( date, format)
//{
//    var o = {
//        "M+" : date.getMonth()+1, //month
//        "d+" : date.getDate(), //day
//        "h+" : date.getHours(), //hour
//        "m+" : date.getMinutes(), //minute
//        "s+" : date.getSeconds(), //second
//        "q+" : Math.floor((date.getMonth()+3)/3), //quarter
//        "S" : date.getMilliseconds() //millisecond
//    }
//
//    if(/(y+)/.test(format)) {
//        format = format.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
//    }
//
//    for(var k in o) {
//        if(new RegExp("("+ k +")").test(format)) {
//            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
//        }
//    }
//    return format;
//}
//try
//{
//    a = 1;
//    var now = new Date();
//    console.log(now)
//    console.log(DateFormat(now, 'yyyy-MM-dd hh:mm:ss'));
//
//    var str = undefined;
//    if( str == undefined)
//    {
//        str = {};
//        str['s'] = 1;
//        str['a'] = 1;
//    }
//    console.log(str);
//    console.log(JSON.stringify(str));
//    delete str.s
//    console.log(JSON.stringify(str));
//
//
//    if( str && str.length >= 11)
//    {
//        console.log(1);
//    }
//}
//catch (e)
//{
//    //throw  e;
//    console.error(e);
//}
//finally
//{
//    console.log("finished!")
//}
//
//var error = new Error('12');
//console.log(error.stack);
//console.log(error.code);
//
//var testp = {
//    1:1212,
//    2:'asdas'
//}
//console.log(testp[2]);


var utils = require('../app/util/utils');
var http = require('http');

function getLine() {
    var e = new Error();
    // now magic will happen: get line number from callstack
    console.log(e.stack);
    var line = e.stack.split('\n')[3].split(':')[1];
    return line;
}


function get( )
{
    return getLine();
}
console.log(get());

//utils.virtualNumberOpen("01001","18801308641","18684959011",60,5,function(data)
//{
//    if(data)
//    {
//        data = eval('('+data+')');
//        console.log(data);
//        if(data && data.status == 1)
//        {
//            console.log(data.id, data.virtualNumber);
////        utils.virtualNumberClose("01001",data.id,function ( data)
////        {
////            console.log(data);
////        })
//        }else
//        {
//            console.log(data.status);
//        }
//    }
//
//});
//
//utils.virtualNumberClose("01001",124,function ( data)
//{
//            console.log(data);
//})

//utils.get("http://test.wgwb.cui9.com/v2/company.php?act=open&companyCode=01001&phoneNumber=18689419610&realNumber=18689419609&expTime=1392200083&avaTime=2",function (data){
//    console.log(1,arguments);
//});


//var rsautl = require('rsautl')
//rsautl.encrypt('a:2:{s:11:"companyCode";s:5:"01001";s:2:"id";s:4:"1468";}',key,function(err, date)
//{
//    console.log(arguments);
//    if(date)
//    {
//        utils.get("http://test.wgwb.cui9.com/v2/company.php?act=close&param="+new Buffer(date).toString('base64'),function (data){
//            console.log(arguments);
//        });
//    }
//})
//utils.virtualNumberClose("01001",105 ,function (data)
//{
//    console.log(data);
//})
//utils.post("http://127.0.0.1:3001/recordFileDownload",{data:"122"}, function ( data)
//{
//    console.log(arguments)
//})

//var date = new Date()
//date.setDate(date.getDate()  - 1)
//console.log(date)

//utils.download_file_curl("http://hdkj.qiniudn.com/20140226111033_15901035597_18801308641_01001.wav?e=1393989042&token=wESXr27331fEislxBlBloc_FOMVkgDbNhN_ofHXn:f7WVhyjQQHpTqD4UfFwQNLasGfs=");

//utils.get("http://hdkj.qiniudn.com/20140122120026_18684959011_18801308641_01001.wav?e=1390968038&token=wESXr27331fEislxBlBloc_FOMVkgDbNhN_ofHXn:90cJmb28QbZOBlHicnztsqirUJc=",function(date)
//{
//    console.log( typeof date)
//    var fs = require('fs');
//})
//

//// Dependencies
//var fs = require('fs');
//var url = require('url');
//var http = require('http');
//var exec = require('child_process').exec;
//var spawn = require('child_process').spawn;
//
//// App variables
//var file_url = 'http://hdkj.qiniudn.com/20140122120026_18684959011_18801308641_01001.wav?e=1390968038&token=wESXr27331fEislxBlBloc_FOMVkgDbNhN_ofHXn:90cJmb28QbZOBlHicnztsqirUJc=';
//var DOWNLOAD_DIR = './downloads/';
//
//// We will be downloading the files to a directory, so make sure it's there
//// This step is not required if you have manually created the directory
//var mkdir = 'mkdir -p ' + DOWNLOAD_DIR;
////var child = exec(mkdir, function(err, stdout, stderr) {
////    if (err) throw err;
////    else download_file_httpget(file_url);
////});
//
//// Function to download file using HTTP.get
//var download_file_httpget = function(file_url) {
//    try{
//        var options = {
//            host: url.parse(file_url).host,
//            port: 80,
//            path: url.parse(file_url).pathname
//        };
//
//        var file_name = url.parse(file_url).pathname.split('/').pop();
//        var file = fs.createWriteStream(DOWNLOAD_DIR + file_name);
//
//        http.get(options, function(res) {
//            res.on('data', function(data) {
//                file.write(data);
//            }).on('end', function() {
//                    file.end();
//                    console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
//                });
//        });
//    }
//    catch (e)
//    {
//        console.error(e.stack);
//    }
//
//};
//
// Function to download file using curl
//var download_file_curl = function(file_url) {   //ok
//
//    // extract the file name
//    var file_name = url.parse(file_url).pathname.split('/').pop();
//    // create an instance of writable stream
//    var file = fs.createWriteStream(DOWNLOAD_DIR + file_name);
//    // execute curl using child_process' spawn function
//    var curl = spawn('curl', [file_url]);
//    // add a 'data' event listener for the spawn instance
//    curl.stdout.on('data', function(data) { file.write(data); });
//    // add an 'end' event listener to close the writeable stream
//    curl.stdout.on('end', function(data) {
//        file.end();
//        console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
//    });
//    // when the spawn child process exits, check if there were any errors and close the writeable stream
//    curl.on('exit', function(code) {
//        if (code != 0) {
//            console.log('Failed: ' + code);
//        }
//    });
//};
//download_file_curl(file_url)

//download_file_httpget(file_url);


//var schedule = require('pomelo-schedule')
//var id = 0;
//var times = 0;
//var simpleJob = function(data){
//    console.log(this);
//    times ++;
//    console.log("run Job :" + data.name);
//    if(times == 5)
//    {
//        schedule.cancelJob(this.id);
//    }
//}
//
//id = schedule.scheduleJob({start:Date.now(), period:1000}, simpleJob, {name: 'simpleJobExample'});
//console.log(id);
//
//console.log(schedule);
