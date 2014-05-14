#父母心
---

使用 基于 Node.JS 的 [pomelo](http://pomelo.netease.com/) 引擎开发

##安装
---
###node 安装
推荐使用[Node Version Manager ](https://github.com/creationix/nvm/)

    # curl https://raw.githubusercontent.com/creationix/nvm/v0.7.0/install.sh | sh

下载、编译和安装 node v0.10.x 的最新版

    # nvm install 0.10
    # nvm use 0.10  //使用已安装的node版本
    # nvm alias default 0.10    //设置默认

###Pomelo 安装
pomelo [中文文档](https://github.com/NetEase/pomelo/wiki/Home-in-Chinese)

使用npm(node包管理工具)全局安装pomelo:

	$ npm install pomelo -g		// -g 全局安装

可以通过如下命令下载源代码的方式安装

	$ git clone https://github.com/NetEase/pomelo.git
	$ cd pomelo
	$ npm install -g
	
###父母亲安装

	$ cd ParentsHeart/src
	$ ./npm-install.sh		//for linux, os x
	$ ./npm-install.bat		//for windows
	
##运行
---

运行game server

	$ cd game-server
	$ pomelo start

运行web server

	$ cd web-server
	$ node app.js

	
##配置
---

*	game-server 	//游戏服务目录
*	images			//医生头像图片目录
*	recordfiles		//通话录音目录
*	shared			//游戏服务和web服务共享目录
*	web-server		//web服务器目录

###数据库 Mysql

数据库配置文件 `shared/config/mysql.json`

game-server 和 web-server 共享mysql配置文件

#####mysql

*	app/dao/mysql/mysql.js		//mysql类
*	app/dao/mysql/dao-pool.js	//Mysql connection pool

#####在app.js中配置

	app.loadConfig('mysql', app.getBase() + '/../shared/config/mysql.json');//导入配置
	var dbclient = require('./app/dao/mysql/mysql').init(app);
    app.set('dbclient', dbclient);

#####获取mysql client

	pomelo.app.get('dbclient')
	
###Game Server

#####配置文件 game-server/config/

*	各个服务器配置 `services.json`
*	主服务器配置(master server)	`master.json`
*	clientProtos,serverProtos用于protobuf压缩，没有使用

##### app.js 配置

创建服务

	var app = pomelo.createApp();
	app.set('name', 'parentsheart');		//设置服务名
	app.set('version','1.0.0');				//设置版本
	app.set('__host', "42.121.106.17");	//设置ip

配置mysql连接

	app.loadConfig('mysql', app.getBase() + '/../shared/config/mysql.json');//导入配置
	var dbclient = require('./app/dao/mysql/mysql').init(app);
    app.set('dbclient', dbclient);

httpServer

	require('./app/util/httpServer')(app);	//用于与呼叫中心交互

错误处理

	app.set('errorHandler', function ( err, msg,un1, session,un2, cb) {
        console.log('errorHandler', arguments);
        utils.sendMail(err.message, err.stack);
        cb(null,{
            error:{
                code:400,
                message:err.message
            }
        });
    })
    app.set('uncaughtException',function(){
        console.log("uncaughtException",arguments);
    })
    app.set('globalErrorHandler',function(){
        console.log("globalErrorHandler",arguments);
    })
    app.set('rpcErrorHandler',function(){
        console.log("rpcErrorHandler",arguments);
    })
    

异常抛出

	process.on('uncaughtException', function (err) {
    	console.log(arguments);
    	console.error(' Caught exception: ' + err.stack);
    	utils.sendMail(err.message, err.stack);  //发送邮件通知
	});

#####Services

*	app/servers/auth/remote/authRemote.js		//用于用户和医生的注册
*	app/servers/chat/handler/chatHanlder.js 	//主要的业务处理
*	app/servers/chat/remote/chatRemote.js		//用户管理，用户登录，获取用户信息
*	app/servers/connector/handler/entryHandler.js //处理客户端连接
*	app/util/httpServer.js		//http服务，与呼叫中心交互

###Web Server

##### app.js 配置

	app.set('port', process.env.PORT || 3000);	//配置IP
	
	log4js.configure({	//log4js配置
		appenders: [
        	{
            	type: 'console'
        	} //控制台输出
        	,
        	{
            	"type": "file",
            	"filename": __dirname + "/logs/log.log",
            	"pattern": "web",
            	"maxLogSize": 1048576,
            	"layout": {
                	"type": "basic"
            	},
            	"backups": 5,
            	"category": "web-log"
        	}
    	],
    	replaceConsole: true
	});
	
	//上传路径
	app.use(express.bodyParser({uploadDir:path.join(__dirname,'upload')}));
	
	//路由配置
	app.use(express.static(path.join(__dirname, 'public'))); //配置静态访问路径

	app.use(log4js.connectLogger(logger, {level: 'auto', format:':method :url'})); //connect Logger，在静态路径配置之后(不打印连接静态文件日志)
	
	app.use(app.router);	
	var routes = require('./routes');	//路由文件 routes.js
	app.use(routes(app));
	
	//处理未找到请求
	app.use(function(req, res, next){
    	logger.error('no %s method on %s . return 404', req.method, req.url);

	    res.render('404', {
    	    status: 404,
        	title: '未找到页面'
    	});
	});

	//异常错误处理
	app.use( function ( err, req, res, next)
	{
    	console.error(err.stack);
    	utils.sendMail(err.message, err.stack); //发送邮件
    	res.render('500', {
		});
	});

###mysql 配置
同game server: `lib/dao`