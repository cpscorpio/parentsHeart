/**
 * Created by chenpeng on 14-3-4.
 */

var async = require('async');
var consts = require('./lib/consts/consts');
var utils = require('./lib/util/utils');
var hospitalDao = require('./lib/dao/hospitalDao');
var departmentDao = require('./lib/dao/departmentDao');
var diseaseDao = require('./lib/dao/diseaseDao');
var cityDao = require('./lib/dao/cityDao');
var jobTitleDao = require('./lib/dao/jobTitleDao');
var priceDao = require('./lib/dao/priceDao');
var hyTypeDao = require('./lib/dao/hyTypeDao');
var hySubjectDao = require('./lib/dao/hySubjectDao');
var hyHospitalDao = require('./lib/dao/hyHospitalDao');
var hyNumberDao = require('./lib/dao/hyNumberDao');
var userDao = require('./lib/dao/userDao');
var clientUserDao = require('./lib/dao/clientUserDao');
var orderDao = require('./lib/dao/orderDao');
var recordDao = require('./lib/dao/recordDao');
var doctorDao = require('./lib/dao/doctorDao');

var log = require('pomelo-logger').getLogger(__filename);
process.env.LOGGER_LINE = true;

module.exports = function (app) {

    app.get('/', function ( req, res)
    {
        log.info('get', req.path);
        console.log('get',req.path,req.params);
        if(req.session.user && req.session.user.name)
        {
            if(req.session.client)
            {
                orderDao.getFindDoctorOrder( req.session.client.id, function ( err1, orders)
                {
                    res.render('userOrders',{
                        client:req.session.client,
                        title:"欢迎使用客服系统",
                        subjects:app.get('__departments'),
                        diseases:app.get('__diseases'),
                        prices:app.get('__prices'),
                        hospitals:app.get('__hospitals'),
                        citys:app.get('__citys'),
                        orders:orders,
                        user:req.session.user,
                        page:0,
                        error:err1
                    });
                });
            }else
            {
                res.render("index",{
                    title:"欢迎使用客服系统",
                    user:req.session.user,
                    page:0
                });
            }
        }
        else
        {
            try
            {
                res.render("login",{ title:'Login'});
            }catch(e)
            {
                log.error(e.stack);
                utils.sendMail(e.message, e.stack);
            }

        }

    });

    app.post('/', function (req, res)
    {
        console.log('post',req.path, req.params,req.body);
        console.log(req.session.user);

        if( req.body)
        {
            var data = req.body;
            if( data.username)
            {
                if(data.password)
                {
                   userDao.getUser ( data.username, function ( err, user)
                    {
                        console.log( err, user);
                        if ( err)
                        {
                            res.render("login",{ title:'Login',alertMsg:err.message});
                        }
                        else
                        {
                            if( user.name === data.username && user.password === data.password)
                            {
                                req.session.user = { id:user.id, name:user.name, uid:user.uid, service_name:user.service_name};
                                res.render("index",{
                                    title:"欢迎使用客服系统",
                                    user:user,
                                    page:0
                                });
                            }
                            else
                            {
                                res.render("login",{ title:'Login',alertMsg:"password error"});
                            }

                        }
                    });
                }
                else
                {
                    res.render("login",{ title:'Login',alertMsg:"password is null"});
                }
            }
            else
            {
                if( data.logout)
                {
                    delete req.session.user;
                }
                res.render("login",{ title:'Login'});
            }

        }
        else
        {
            if( req.session.user && req.session.user.name)
            {
                if(req.session.client)
                {
                    orderDao.getFindDoctorOrder( req.session.client.id, function ( err1, orders)
                    {
                        res.render('userOrders',{
                            client:req.session.client,
                            title:"欢迎使用客服系统",
                            subjects:app.get('__departments'),
                            diseases:app.get('__diseases'),
                            prices:app.get('__prices'),
                            hospitals:app.get('__hospitals'),
                            citys:app.get('__citys'),
                            orders:orders,
                            user:req.session.user,
                            page:0,
                            error:err1
                        });
                    });
                }
                else
                {
                    res.render("index",{
                        title:"欢迎使用客服系统",
                        user:req.session.user,
                        page:0
                    });
                }

                return ;
            }else
            {
                res.render("login",{ title:'Login'});
            }

        }
    } );
    app.get("/serviceOrderById:id",function ( req, res)
    {
        console.log(req.path, req.params['id']);
        var id = req.params['id'];
        if( req.session.user && req.session.user.name)
        {
            if(req.session.client)
            {
                if( id)
                {
                    orderDao.getServiceOrderByOrderId(req.session.client.id,id,function ( error1,orders)
                    {
                        var order = orders[0];
                        console.log(arguments);
                        res.render('serviceOrder',{
                            client:req.session.client,
                            title:"客服订单信息",
                            order:orders[0],
                            user:req.session.user,
                            page:0,
                            error:error1
                        });

                    });
                }
                else
                {
                    orderDao.getFindDoctorOrder( req.session.client.id, function ( err1, orders)
                    {
                        res.render('userOrders',{
                            client:req.session.client,
                            title:"欢迎使用客服系统",
                            subjects:app.get('__departments'),
                            diseases:app.get('__diseases'),
                            prices:app.get('__prices'),
                            hospitals:app.get('__hospitals'),
                            citys:app.get('__citys'),
                            orders:orders,
                            user:req.session.user,
                            page:0,
                            error:"没有订单信息"
                        });
                    });
                }
            }
            else
            {
                res.render("index",{
                    title:"欢迎使用客服系统",
                    user:req.session.user,
                    page:0
                });
            }
        }
        else
        {
            res.render("login",{ title:'Login'});
        }
    });

    app.get("/registrationOrderById:id",function ( req, res)
    {
        console.log(req.path, req.params['id']);
        var id = req.params['id'];
        if( req.session.user && req.session.user.name)
        {
            if(req.session.client)
            {
                if( id)
                {
                    orderDao.getGuaHaoOrderByOrderId(req.session.client.id,id,function ( error1,orders)
                    {
                        var order = orders[0];
                        console.log(arguments);
                        res.render('registrationOrder',{
                                client:req.session.client,
                                title:"挂号订单信息",
                                order:orders[0],
                                user:req.session.user,
                                page:0,
                                error:error1
                            });

                    });
                }
                else
                {
                    orderDao.getFindDoctorOrder( req.session.client.id, function ( err1, orders)
                    {
                        res.render('userOrders',{
                            client:req.session.client,
                            title:"欢迎使用客服系统",
                            subjects:app.get('__departments'),
                            diseases:app.get('__diseases'),
                            prices:app.get('__prices'),
                            hospitals:app.get('__hospitals'),
                            citys:app.get('__citys'),
                            orders:orders,
                            user:req.session.user,
                            page:0,
                            error:"没有订单信息"
                        });
                    });
                }
            }
            else
            {
                res.render("index",{
                    title:"欢迎使用客服系统",
                    user:req.session.user,
                    page:0
                });
            }
        }
        else
        {
            res.render("login",{ title:'Login'});
        }
    });
    app.get("/findDoctorOrderById:id",function ( req, res)
    {
        console.log(req.path, req.params['id']);
        var id = req.params['id'];
        if( req.session.user && req.session.user.name)
        {
//            if(req.session.client)
//            {
                if( id)
                {
                    orderDao.getFindDoctorOrderByOrderId(null,id,function ( error1,orders)
                    {
                        var order = orders[0];
                        console.log(arguments);
                        if(order && order.uuid)
                        {
                            console.log('有号码')
                            recordDao.getRecordByUUID(order.uuid, function (error2,records)
                            {console.log(arguments);
                                res.render('findDoctorOrder',{
                                    client:req.session.client,
                                    title:"找医生订单信息",
                                    order:orders[0],
                                    records:records,
                                    user:req.session.user,
                                    page:0,
                                    error:error1
                                });
                            });
                        }
                        else
                        {
                            res.render('findDoctorOrder',{
                                client:req.session.client,
                                title:"找医生订单信息",
                                order:orders[0],
                                user:req.session.user,
                                page:0,
                                error:error1
                            });
                        }
                    });
                }
                else
                {
                    if ( req.session.client)
                    {
                        orderDao.getFindDoctorOrder( req.session.client.id, function ( err1, orders)
                        {
                            res.render('userOrders',{
                                client:req.session.client,
                                title:"欢迎使用客服系统",
                                subjects:app.get('__departments'),
                                diseases:app.get('__diseases'),
                                prices:app.get('__prices'),
                                hospitals:app.get('__hospitals'),
                                citys:app.get('__citys'),
                                orders:orders,
                                user:req.session.user,
                                page:0,
                                error:"没有订单信息"
                            });
                        });
                    }else
                    {

                        res.render("index",{
                            title:"欢迎使用客服系统",
                            user:req.session.user,
                            page:0
                        });
                    }

                }
//            }
//            else
//            {
//                res.render("index",{
//                    title:"欢迎使用客服系统",
//                    user:req.session.user,
//                    page:0
//                });
//            }
        }
        else
        {
            res.render("login",{ title:'Login'});
        }

    });

    app.get('/getRecordFile:name', function (req,res,next)
    {
        console.log('get',req.path,req.params['name']);
        var fs = require('fs');

        var path = __dirname.substring(0,__dirname.lastIndexOf('web-server')) + "recordfiles/";
        fs.readFile(path + req.params['name'],function(err,data)
        {
            console.log(err,data);
            if( err)
            {
                next(err);
            }
            else
            {
                res.send(data);
            }

        });
    });
    app.post('/closeService', function ( req,res)
    {
        console.log(req.path, req.params,req.body);
        if( req.session.user && req.session.user.name)
        {
            if(req.body.type && req.session.client)
            {
                var type = req.body.type;
                var userId = req.session.client.id;
                var serviceId = req.session.user.id;
                var serviceName = req.session.user.service_name;
                var phone_number = req.session.client.phone_number;
                orderDao.addServiceOrder(type,utils.DateFormat(new Date(),'yyyyMMddhhmmssS') + serviceId + userId,serviceId,serviceName, userId,phone_number,
                    function(){
                        console.log(arguments);
                    });
                //TODO 添加客服订单

            }

            delete req.session.client;
            res.render('index',{
                title:"欢迎使用客服系统",
                user:req.session.user,
                page:0
            });
        }
        else
        {
            res.render("login",{ title:'Login'});
        }

    });
    app.post("/getClientOrder", function ( req,res)
    {
        if( req.session.user && req.session.user.name)
        {
            console.log(req.path ,req.body.phoneNumber);
            if(req.body.phoneNumber)
            {

                async.parallel([
                    function ( callback)
                    {
                        clientUserDao.getUserInfo(req.body.phoneNumber, function ( err, user)
                        {
                            callback( err, user);
                        })
                    },
                    function ( callback)
                    {
                        departmentDao.getDepartments( function ( err, result)
                        {
                            callback( err, result);
                        });
                    },
                    function ( callback)
                    {
                        diseaseDao.getDiseases( function ( err, result)
                        {
                            callback( err, result);
                        });
                    },
                    function ( callback)
                    {
                        priceDao.getprices( function ( err, result)
                        {
                            callback( err, result);
                        });
                    },
                    function ( callback)
                    {
                        hospitalDao.getHospitalsMap( function ( err, result)
                        {
                            callback( err, result);
                        });
                    },
                    function ( callback)
                    {
                        cityDao.getCityList( function ( err, result)
                        {
                            callback( err, result);
                        });
                    }
                ],
                    function (error, results)
                    {
                        if( !error && results)
                        {
                            var user = results[0];
                            var subjects = results[1];
                            var diseases = results[2];
                            var prices = results[3];
                            var hospitals = results[4];
                            var citys = results[5];

                            req.session.client = {
                                id:user.id,
                                name:user.name,
                                phone_number:user.phone_number,
                                money:user.money
                            };
                            orderDao.getFindDoctorOrder( user.id, function ( err1, orders)
                            {
                                res.render('userOrders',{
                                    client:user,
                                    title:"欢迎使用客服系统",
                                    subjects:subjects,
                                    diseases:diseases,
                                    prices:prices,
                                    hospitals:hospitals,
                                    citys:citys,
                                    orders:orders,
                                    user:req.session.user,
                                    page:0
                                });
                            });
                        }
                        else
                        {
                            res.render('index',{
                                title:"欢迎使用客服系统",
                                user:req.session.user,
                                page:0,
                                error:error,
                                client:null
                            });
                        }
                    }
                );

            }
            else
            {
                res.render('index',{
                    title:"欢迎使用客服系统",
                    user:req.session.user,
                    page:0
                });
            }
        }
        else
        {
            res.render("login",{ title:'Login'});
        }
    });
    app.post('/getOrdersBy:orderType', function ( req, res)
    {
        console.log(req.path, req.params['orderType'],req.body);
        var orderType = req.params['orderType'];
        if(orderType == 0)
        {
            orderDao.getFindDoctorOrder(req.session.client.id, function ( err, orders)
            {
                console.log(err);
                res.send(orders);
            });
        }
        else if( orderType == 1)
        {
            orderDao.getGuaHaoOrder(req.session.client.id, function ( err, orders)
            {
                console.log(err);
                res.send(orders);
            });
        }
        else if( orderType == 2)
        {
            orderDao.getServiceOrder(req.session.client.id, function ( err, orders)
            {
                console.log(err);
                res.send(orders);
            });
        }
        else
        {
            res.send('error orderType: ' + orderType);
        }

    });
    app.post('/hyHospital:action',function ( req,res)
    {
        console.log(req.path, req.params['action'],req.body);
        var action = req.params['action'];

        if(action === consts.ACTION.ADD)
        {
            hyHospitalDao.add(req.body.name,req.body.city, function ( err, result)
            {
                res.send(result)
            });
        }
        else if(action === consts.ACTION.ALTER)
        {
            hyHospitalDao.alter(req.body.id, req.body.name,req.body.city, function ( err, result)
            {
                res.send(result)
            });
        }
        else if(action === consts.ACTION.DELETE)
        {
            hyHospitalDao.del(req.body.id, function ( err, result)
            {
                res.send(result)
            });
        }
    });
    app.post('/hyNumber:action',function ( req,res)
    {
        console.log(req.path, req.params['action'],req.body);
        var action = req.params['action'];

        if(action === consts.ACTION.ADD)
        {
            hyNumberDao.add(req.body, function ( err, result)
            {
                res.send(result)
            });
        }
        else if(action === consts.ACTION.ALTER)
        {
            hyNumberDao.alter(req.body.id, req.body.doctor,req.body.number, function ( err, result)
            {
                res.send(result)
            });
        }
        else if(action === consts.ACTION.DELETE)
        {
            hyNumberDao.del(req.body.id, function ( err, result)
            {
                res.send(result)
            });
        }
    });
    app.post('/hySubject:action',function ( req,res)
    {
        console.log(req.path, req.params['action'],req.body);
        var action = req.params['action'];

        if(action === consts.ACTION.ADD)
        {
            hySubjectDao.add(req.body.name, function ( err, result)
            {
                res.send(result)
            });
        }
        else if(action === consts.ACTION.ALTER)
        {
            hySubjectDao.alter(req.body.id, req.body.name, function ( err, result)
            {
                res.send(result)
            });
        }
        else if(action === consts.ACTION.DELETE)
        {
            hySubjectDao.del(req.body.id, function ( err, result)
            {
                res.send(result)
            });
        }
    });
    app.post('/hyType:action',function ( req,res)
    {
        console.log(req.path, req.params['action'],req.body);
        var action = req.params['action'];

        if(action === consts.ACTION.ADD)
        {
            hyTypeDao.add(req.body.name, function ( err, result)
            {
                res.send(result)
            });
        }
        else if(action === consts.ACTION.ALTER)
        {
            hyTypeDao.alter(req.body.id, req.body.name, function ( err, result)
            {
                res.send(result)
            });
        }
        else if(action === consts.ACTION.DELETE)
        {
            hyTypeDao.del(req.body.id, function ( err, result)
            {
                res.send(result)
            });
        }
    });
    app.post('/fSubject:action', function ( req, res)
    {
        console.log(req.path, req.params['action'],req.body);
        var action = req.params['action'];

        if(action === consts.ACTION.ADD)
        {
            departmentDao.add(req.body.category,req.body.name, function ( err, result)
            {
                res.send(result);
            })
        }
        else if(action === consts.ACTION.DELETE)
        {
            departmentDao.del(req.body.id, function ( err, result)
            {
                res.send(result);
            })
        }
        else if(action === consts.ACTION.ALTER)
        {
            departmentDao.alter(req.body.id, req.body.name, req.body.category, function ( err, result)
            {
                res.send(result);
            })
        }
    });

    app.post('/fDisease:action', function ( req, res)
    {
        console.log(req.path, req.params['action'],req.body);
        var action = req.params['action'];

        if(action === consts.ACTION.ADD)
        {
            diseaseDao.add(req.body.department_id,req.body.name, function ( err, result)
            {
                res.send(result);
            })
        }
        else if(action === consts.ACTION.DELETE)
        {
            diseaseDao.del(req.body.id, function ( err, result)
            {
                res.send(result);
            })
        }
        else if(action === consts.ACTION.ALTER)
        {
            diseaseDao.alter(req.body.id, req.body.name, req.body.department_id, function ( err, result)
            {
                res.send(result);
            })
        }
    });

    app.post('/fJobTitle:action', function ( req, res)
    {
        console.log(req.path, req.params['action'],req.body);
        var action = req.params['action'];

        if(action === consts.ACTION.ADD)
        {
            jobTitleDao.add(req.body.name, function ( err, result)
            {
                res.send(result);
            })
        }
        else if(action === consts.ACTION.DELETE)
        {
            jobTitleDao.del(req.body.id, function ( err, result)
            {
                res.send(result);
            })
        }
        else if(action === consts.ACTION.ALTER)
        {
            jobTitleDao.alter(req.body.id, req.body.name, function ( err, result)
            {
                res.send(result);
            })
        }
    });

    app.post('/fPrice:action', function ( req, res)
    {
        console.log(req.path, req.params['action'],req.body);
        var action = req.params['action'];

        if(action === consts.ACTION.ADD)
        {
            priceDao.add(req.body.name, function ( err, result)
            {
                res.send(result);
            })
        }
        else if(action === consts.ACTION.DELETE)
        {
            priceDao.del(req.body.id, function ( err, result)
            {
                res.send(result);
            })
        }
        else if(action === consts.ACTION.ALTER)
        {
            priceDao.alter(req.body.id, req.body.name, function ( err, result)
            {
                res.send(result);
            })
        }
    });

    app.post('/fHospital:action', function(req, res)
    {


        console.log(req.path, req.params['action'],req.body);
        var action = req.params['action'];
        if(action === consts.ACTION.ADD)
        {
            hospitalDao.add(req.body.name, req.body.city, req.body.subject, function ( err, result)
            {
                res.send(result);
            });
        }
        else if(action === consts.ACTION.ALTER)
        {
            hospitalDao.alter({code:req.body.code},{name:req.body.name,city:req.body.city,departments:req.body.subject}, function( err, result)
            {
                res.send(result);
            });
        }
        else if(action === consts.ACTION.DELETE)
        {
            hospitalDao.del(req.body.code, function ( err, result)
            {
                res.send( result);
            })
        }
    });
    app.post('/alterHospital', function(req, res)
    {
        console.log(req.path,req.body);

        async.parallel([
            function ( callback)
            {
                departmentDao.getDepartments( function ( err, res)
                {
                    callback( err, res);
                })
            },
            function ( callback)
            {
                cityDao.getCityList( function ( err,res)
                {
                    callback( err, res);
                });
            }
            ,function ( callback)
            {
                hospitalDao.getById(req.body.id, function ( err, res)
                {
                    callback( err, res);
                })
            }
        ],
            function ( err, results)
            {
                if( err)
                {
                    res.render('index',{
                        title:'index',
                        user:req.session.user,
                        page:0

                    });
                }
                else
                {
                    var departments = results[0];
                    var citys = results[1];
                    var hospital = results[2];
                    res.render('alterHospital',{
                        title:'修改医院信息',
                        hospital:hospital,
                        departments:departments,
                        citys:citys,
                        user:req.session.user,
                        page:11

                    });
                }

            }
        );

    });
    app.post('/fDoctor:action', function(req, res)
    {
        console.log(req.path, req.params['action'],req.body);
        var action = req.params['action'];
        if(action === consts.ACTION.ADD)
        {
            doctorDao.addDoctor(req.body, function ( err, result)
            {
                res.send(result);
            });
        }
        else if(action === consts.ACTION.ALTER)
        {

            doctorDao.alter({id:req.body.id},req.body.doctor, function( err, result)
            {
                res.send(result);
            });
        }
        else if(action === consts.ACTION.DELETE)
        {
            doctorDao.del(req.body.id, function ( err, result)
            {
                res.send( result);
            })
        }
    });
    app.post('/alterDoctor', function(req, res)
    {
        console.log(req.path,req.body);

        async.parallel([
            function ( callback)
            {
                hospitalDao.getHospitalsMap( function ( err, result)
                {
                    callback(err,result);
                });
            },
            function ( callback)
            {
                cityDao.getCityList( function ( err, result)
                {
                    callback(err,result);
                });
            },
            function ( callback)
            {
                departmentDao.getDepartments( function ( err, result)
                {
                    callback(err,result);
                });
            },
            function ( callback)
            {
                diseaseDao.getDiseases(function (err, result)
                {
                    callback( err, result);
                });
            },
            function ( callback)
            {
                jobTitleDao.getjobTitles(function (err, result)
                {
                    callback( err, result);
                });
            },
            function ( callback)
            {
                priceDao.getprices(function (err, result)
                {
                    callback( err, result);
                });
            },
            function (callback)
            {

                doctorDao.getDoctorById(req.body.id, function ( err, res)
                {
                    callback( err, res);
                });
            }
        ],
            function ( err, results)
            {
                if( err)
                {
                    res.render('index',{
                        title:'index',
                        user:req.session.user,
                        page:0

                    });
                }
                else
                {
                    res.render("alterDoctor",{
                        title:"修改医院信息",
                        user:req.session.user,
                        hospitals:results[0],
                        citys:results[1],
                        departments:results[2],
                        diseases:results[3],
                        jobTitles:results[4],
                        prices:results[5],
                        doctor:results[6],
                        page:consts.PAGE.MANAGE_DOCTOR,
                        error:err
                    });
                }

            }
        );

    });

    app.post('/getHaoyuanNumber',function ( req,res)
    {
        console.log(req.path,req.body);
        var city = req.body.city;
        delete req.body.city;

        hyNumberDao.getHaoyuanByCity(city,req.body, function ( err, result)
        {
            res.send(result);
        });

    });
    app.post('/getCallList', function ( req, res)
    {
        recordDao.getRecordByPhoneNumber(req.body.phone_number, function ( err, list)
        {
            res.send(list);
        });
    });
    app.get('/page:id',function ( req,res)
    {

        var pages = 0;
        console.log('get',req.path,req.params['id']);
        if(req.session.user && req.session.user.name)
        {
            if(req.params['id'] && req.path === ('/page' + req.params['id']))
            {
                if(req.params['id'])
                {
                    pages = parseInt(req.params['id']);
                }

                if(pages === consts.PAGE.CALL_LIST)
                {
                    res.render("callList",{
                        title:"电话记录",
                        user:req.session.user,
                        page:pages
                    });
                }
                else if(pages === consts.PAGE.FIND_DOCTOR_HOSPITAL)
                {
                    async.parallel([
                        function ( callback)
                        {
                            departmentDao.getDepartments( function ( err, res)
                            {
                                callback( err, res);
                            })
                        },
                        function ( callback)
                        {
                            hospitalDao.getHospitalsMap( function ( err, res)
                            {
                                callback( err, res);
                            })
                        },
                        function ( callback)
                        {
                            cityDao.getCityList( function ( err, res)
                            {
                                callback( err, res);
                            })
                        }
                    ],
                        function ( err, results)
                        {
                            var departments = results[0];
                            var hospitals = results[1];
                            var citys = results[2];
                            res.render("FindDoctorHospital",{
                                title:"父母心-找医生-医院信息",
                                user:req.session.user,
                                hospitals:hospitals,
                                departments:departments,
                                citys:citys,
                                page:pages
                            });
                        }
                    )

                }
                else if(pages === consts.PAGE.FIND_DOCTOR_DEPARTMENT)
                {
                    departmentDao.getDepartments( function ( err, results)
                    {
                        res.render("FindDoctorSubject",{
                            title:"父母心-找医生-科室信息",
                            user:req.session.user,
                            subjects:results,
                            page:pages,
                            error:err
                        });
                    });
                }
                else if(pages === consts.PAGE.FIND_DOCTOR_DISEASE)
                {
                    async.parallel([
                        function ( callback)
                        {
                            departmentDao.getDepartments( function ( err, result)
                            {
                                callback( err,result)
                            });
                        },
                        function ( callback)
                        {
                            diseaseDao.getDiseases( function ( err, result)
                            {
                                callback( err, result);
                            });
                        }
                    ],
                        function ( err, results)
                        {
                            res.render("FindDoctorDisease",{
                                title:"父母心-找医生-疾病信息",
                                user:req.session.user,
                                subjects:results[0],
                                diseases:results[1],
                                page:pages,
                                error:err
                            });
                        }
                    );

                }
                else if(pages === consts.PAGE.FIND_DOCTOR_JOB_TITLE)
                {
                    jobTitleDao.getjobTitles( function ( err, result)
                    {
                        console.log(err, result);
                        res.render("FindDoctorJobTitle",{
                            title:"父母心-找医生-职位信息",
                            user:req.session.user,
                            jobTitles:result,
                            page:pages,
                            error:err
                        });
                    });
                }
                else if(pages === consts.PAGE.FIND_DOCTOR_PRICE)
                {
                    priceDao.getprices( function ( err, result)
                    {
                        console.log(err, result);
                        res.render("FindDoctorPrice",{
                            title:"父母心-找医生-价格",
                            user:req.session.user,
                            prices:result,
                            page:pages,
                            error:err
                        });
                    });
                }
                else if(pages === consts.PAGE.HAO_YUAN_SUBJECT)
                {
                    hySubjectDao.getSubjects( function ( err, result)
                    {
                        console.log(err, result);
                        res.render("HaoyuanSubject",{
                            title:"父母心-号源-科室信息",
                            user:req.session.user,
                            subjects:result,
                            page:pages,
                            error:err
                        });
                    });
                }
                else if(pages === consts.PAGE.HAO_YUAN_TYPE)
                {
                    hyTypeDao.getTypes( function ( err, result)
                    {
                        console.log(err, result);
                        res.render("HaoyuanType",{
                            title:"父母心-号源-科室信息",
                            user:req.session.user,
                            types:result,
                            page:pages,
                            error:err
                        });
                    });
                }
                else if(pages === consts.PAGE.HAO_YUAN_NUMBER)
                {
                    async.parallel([
                        function ( callback)
                        {
                            hyHospitalDao.getHospitals( function ( err, result)
                            {
                                callback(err,result);
                            });
                        },
                        function ( callback)
                        {
                            cityDao.getCityList( function ( err, result)
                            {
                                callback(err,result);
                            });
                        },
                        function ( callback)
                        {
                            hySubjectDao.getSubjects( function ( err, result)
                            {
                                callback(err,result);
                            });
                        },
                        function ( callback)
                        {
                            hyTypeDao.getTypes( function ( err, result)
                            {
                                callback(err,result);
                            });
                        },
                        function ( callback)
                        {
                            hyNumberDao.getHaoyuanByCity(1,{
                                date:utils.DateFormat(new Date(),'yyyy-MM-dd')
                            },function(err, result)
                            {
                                callback( err, result);
                            });
                        }
                    ],
                        function (err, results)
                        {

                            if( !err)
                            {
                                console.log(results);
                                res.render("Haoyuan",{
                                    title:"父母心-号源-号源信息",
                                    user:req.session.user,
                                    hospitals:results[0],
                                    subjects:results[2],
                                    citys:results[1],
                                    types:results[3],
                                    numbers:results[4],
                                    page:pages,
                                    error:null
                                });
                            }else
                            {
                                console.log(err);
                            }

                        }
                    );


                }
                else if(pages === consts.PAGE.MANAGE_DOCTOR)
                {
                    async.parallel([
                        function ( callback)
                        {
                            hospitalDao.getHospitalsMap( function ( err, result)
                            {
                                callback(err,result);
                            });
                        },
                        function ( callback)
                        {
                            cityDao.getCityList( function ( err, result)
                            {
                                callback(err,result);
                            });
                        },
                        function ( callback)
                        {
                            departmentDao.getDepartments( function ( err, result)
                            {
                                callback(err,result);
                            });
                        },
                        function ( callback)
                        {
                            diseaseDao.getDiseases(function (err, result)
                            {
                                callback( err, result);
                            });
                        },
                        function ( callback)
                        {
                            jobTitleDao.getjobTitles(function (err, result)
                            {
                                callback( err, result);
                            });
                        },
                        function ( callback)
                        {
                            priceDao.getprices(function (err, result)
                            {
                                callback( err, result);
                            });
                        },
                        function (callback)
                        {
                            doctorDao.getDoctors(function ( err, res)
                            {
                                callback( err, res);
                            });
                        }
                    ],
                        function (err, results)
                        {

                            if( !err)
                            {
                                console.log(results[6]);
                                res.render("doctorList",{
                                    title:"父母心-号源-医院信息",
                                    user:req.session.user,
                                    hospitals:results[0],
                                    citys:results[1],
                                    departments:results[2],
                                    diseases:results[3],
                                    jobTitles:results[4],
                                    prices:results[5],
                                    doctors:results[6],
                                    page:pages,
                                    error:err
                                });
                            }else
                            {
                                console.log(err);
                            }

                        }
                    );
                }
                else if(pages === consts.PAGE.HAO_YUAN_HOSPITAL)
                {
                    async.parallel([
                        function ( callback)
                        {
                            hyHospitalDao.getHospitals( function ( err, result)
                            {
                                callback(err,result);
                            });
                        },
                        function ( callback)
                        {
                            cityDao.getCityList( function ( err, result)
                            {
                                callback(err,result);
                            });
                        }
                    ],
                        function (err, results)
                        {

                            if( !err)
                            {
                                console.log(results);
                                res.render("HaoyuanHospital",{
                                    title:"父母心-号源-医院信息",
                                    user:req.session.user,
                                    hospitals:results[0],
                                    citys:results[1],
                                    page:pages,
                                    error:err
                                });
                            }else
                            {
                                console.log(err);
                            }

                        }
                    );
                }
                else
                {
                    if(req.session.client)
                    {
                        orderDao.getFindDoctorOrder( req.session.client.id, function ( err1, orders)
                        {
                            res.render('userOrders',{
                                client:req.session.client,
                                title:"欢迎使用客服系统",
                                subjects:app.get('__departments'),
                                diseases:app.get('__diseases'),
                                prices:app.get('__prices'),
                                hospitals:app.get('__hospitals'),
                                citys:app.get('__citys'),
                                orders:orders,
                                user:req.session.user,
                                page:0,
                                error:err1
                            });
                        });

                    }else
                    {
                        res.render("index",{
                            title:"欢迎使用客服系统",
                            user:req.session.user,
                            page:pages
                        });
                    }
                }

            }
            else
            {
                if(req.session.client)
                {
                    orderDao.getFindDoctorOrder( req.session.client.id, function ( err1, orders)
                    {
                        res.render('userOrders',{
                            client:req.session.client,
                            title:"欢迎使用客服系统",
                            subjects:app.get('__departments'),
                            diseases:app.get('__diseases'),
                            prices:app.get('__prices'),
                            hospitals:app.get('__hospitals'),
                            citys:app.get('__citys'),
                            orders:orders,
                            user:req.session.user,
                            page:0,
                            error:err1
                        });
                    });
                }else
                {
                    res.render("index",{
                        title:"欢迎使用客服系统",
                        user:req.session.user,
                        page:pages
                    });
                }
            }

        }
        else
        {
            res.render("login",{ title:'Login'});
        }
    });
    app.post('/uploadImage',function ( req, res)
    {
        console.log(req.body);
        console.log(req.files);

        var fs = require('fs');
        var tmp_path = req.files.Filedata.path;
        var target_path = __dirname.substring(0,__dirname.lastIndexOf('web-server')) + "images/" + req.body.name;
        // 移动文件
        fs.rename(tmp_path, target_path, function(err) {
            if (err) throw err;
            // 删除临时文件夹文件,
            fs.unlink(tmp_path, function() {
                if (err) throw err;
                console.log(target_path);
                res.send('File uploaded to: ' + target_path + ' - ' + req.files.Filedata.size + ' bytes');
            });
        });
    });
    app.get('/Image_:path',function ( req, res)
    {
        console.log('get',req.path,req.params['path']);
        var fs = require('fs');
        var path = __dirname.substring(0,__dirname.lastIndexOf('web-server')) + "images/";
        fs.readFile(path + req.params['path'],function(err,data)
        {
            console.log(err,data);
            if( err)
            {
                fs.readFile(path + 'doctor.jpg',function(err,data)
                {
                    console.log(err,data);
                    res.send(data);
                });
            }
            else
            {
                res.send(data);
            }

        });
    });
    return app.router;
};