/**
 * Created by cp on 1/7/14.
 */

var chatRemote = require('../remote/chatRemote');
var schedule = require('pomelo-schedule');
process.env.LOGGER_LINE = true;
var async = require('async');

var log = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var logDao = require('../../../dao/logDao')
var consts = require('../../../consts/consts');
var utils = require('../../../util/utils');
var jobTitleDao = require('../../../dao/jobTitleDao');
var userDao = require('../../../dao/userDao');
var doctorDao = require('../../../dao/doctorDao');
var priceDao = require('../../../dao/priceDao');
var orderDao = require('../../../dao/orderDao');
var workerOrderDao = require('../../../dao/workerOrderDao');
var haoyuanDao = require('../../../dao/haoyuanDao');
var workerDao = require('../../../dao/workerDao');
var serviceDao = require('../../../dao/serviceDao');
var departmentDao = require('../../../dao/departmentDao');
var diseaseDao = require('../../../dao/diseaseDao');
var hospitalDao = require('../../../dao/hospitalDao');

var OrderFindDoctor = require('../../../entity/order_find_doctor');
var OrderRegistration = require('../../../entity/order_registration');

module.exports = function(app)
{
    return new Handler(app);
};

var Handler = function(app)
{
    this.app = app;
};

var handler = Handler.prototype;

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.send = function(msg, session, next)
{

    next(null, {
        route: msg.route,
        type: msg.msgtype,
        msg:msg
    });
};

handler.Balance = function(msg, session, next)
{
    if(session.uid)
    {
        next(null, {
                error:utils.Error(null),
                balance:session.get('money')
            }
        )
    }
    else
    {
        next(null, {
                error:consts.ERROR.USER_NOT_LOGIN,
                balance:0
            }
        )
    }

}
handler.DoctorList = function(msg, session, next)
{
    try
    {
        console.log(msg);
        var params = null;
        if ( msg.price_id && msg.subject_id)
        {   //找医生
            params = {
                subject:msg.subject_id,
                illness:msg.illness_id,
                price:msg.price_id,
                category:msg.category,
                only_online:msg.only_online ? true : false
            };

        }
        else if(msg.hospital_id && msg.subject_id)
        {
            params = {
                subject:msg.subject_id,
                hospital:msg.hospital_id,
                category:msg.category,
                only_online:msg.only_online ? true : false
            };
        }
        else
        {
            params = {
                category:msg.category,
                only_online:msg.only_online ? true : false
            };
        }

        doctorDao.getDoctors(params, function ( err, doctors)
        {
            next(null,{
                    error:utils.Error(err),
                    doctors:doctors
                }

            )
        })

    }catch (e)
    {
        log.error(e.stack);
        utils.sendMail(e.message, e.stack);
        next( null, {
            error:utils.Error(e),
            doctors:null
        })
    }
}

handler.OrderFindDoctorFinish = function (msg, session, next)
{
    if(msg.order_id )
    {
        if( session.uid && session.get('id'))
        {
            var userType = session.uid.split('*')[1];
            if(session.uid.split('*')[1] === consts.USER.Doctor)
            {
                orderDao.getVirtualNumberIdByDoctorId(session.get('id'),msg.order_id, function ( err,uuid)
                {
                    if(uuid)
                    {
                        orderDao.setOrderFindDoctor('order_id',msg.order_id,['status'],[consts.ORDER_STATUS.NoComment],function ( err, res)
                        {
                            if(err) log.error(err.message);
                            if ( res) log.info(res);
                        });
                        utils.virtualNumberClose('01001',uuid, function(data){
                            if(data)
                            {
                                data = eval('(' + data + ')');
                            }
                            logDao.CloseVirtualNumberLog({
                                companycode:'01001',
                                uuid:uuid,
                                status:data.status,
                                time:new Date()
                            },function (){});
                            if(data && data.status === 1)
                            {
                                next(null, {
                                    error: utils.Error(null)
                                })
                            }
                            else
                            {
                                next(null, {
                                    error: utils.Error(new Error('close error'))
                                })
                            }
                        });
                    }
                    else
                    {
                        next(null, {
                            error: utils.Error(new Error('没找到id'))
                        })
                    }
                });
            }
            else if(session.uid.split('*')[1] === consts.USER.User)
            {
                orderDao.getVirtualNumberIdByUserId(session.get('id'),msg.order_id, function ( err,uuid)
                {
                    if(uuid)
                    {
                        orderDao.setOrderFindDoctor('order_id',msg.order_id,['status'],[consts.ORDER_STATUS.NoComment],function ( err, res)
                        {
                            if(err) log.error(err.message);
                            if ( res) log.info(res);
                        });

                        utils.virtualNumberClose('01001',uuid, function(data){
                            if(data)
                            {
                                data = eval('(' + data + ')');
                            }
                            logDao.CloseVirtualNumberLog({
                                companycode:'01001',
                                uuid:uuid,
                                status:data.status,
                                time:new Date()
                            },function (){});
                            if(data && data.status === 1)
                            {
                                next(null, {
                                    error: utils.Error(null)
                                })
                            }
                            else
                            {
                                next(null, {
                                    error: utils.Error(new Error('close error'))
                                })
                            }
                        });
                    }
                    else
                    {
                        next(null, {
                            error: utils.Error(new Error('没找到id'))
                        })
                    }

                });
            }
            else
            {
                next(null, {
                    error:consts.ERROR.BAD_USER_TYPE
                })
            }
        }
        else
        {
            next(null, {
                error:consts.ERROR.USER_NOT_LOGIN
            })
        }
    }
    else
    {
        next(null, {
            error:consts.ERROR.MISSING_PARAMS
        })
    }
}
handler.CloseOrder = function(msg, session, next)
{
    if(msg.order_id )
    {
        if( session.uid && session.get('id'))
        {
            var userType = session.uid.split('*')[1];
            if(session.uid.split('*')[1] === consts.USER.Doctor)
            {
                orderDao.getVirtualNumberIdByDoctorId(session.get('id'),msg.order_id, function ( err,uuid)
                {
                    if(uuid)
                    {
                        utils.virtualNumberClose('01001',uuid, function(data){
                            if(data)
                            {
                                data = eval('(' + data + ')');
                            }
                            logDao.CloseVirtualNumberLog({
                                companycode:'01001',
                                uuid:uuid,
                                status:data.status,
                                time:new Date()
                            },function (){});
                            if(data && data.status === 1)
                            {
                                next(null, {
                                    error: utils.Error(null)
                                })
                            }
                            else
                            {
                                next(null, {
                                    error: utils.Error(new Error('close error'))
                                })
                            }
                        });
                    }
                    else
                    {
                        next(null, {
                            error: utils.Error(new Error('没找到id'))
                        })
                    }
                });
            }
            else if(session.uid.split('*')[1] === consts.USER.User)
            {
                orderDao.getVirtualNumberIdByUserId(session.get('id'),msg.order_id, function ( err,uuid)
                {
                    if(uuid)
                    {
                        utils.virtualNumberClose('01001',uuid, function(data){
                            if(data)
                            {
                                data = eval('(' + data + ')');
                            }
                            logDao.CloseVirtualNumberLog({
                                companycode:'01001',
                                uuid:uuid,
                                status:data.status,
                                time:new Date()
                            },function (){});
                            if(data && data.status === 1)
                            {
                                next(null, {
                                    error: utils.Error(null)
                                })
                            }
                            else
                            {
                                next(null, {
                                    error: utils.Error(new Error('close error'))
                                })
                            }
                        });
                    }
                    else
                    {
                        next(null, {
                            error: utils.Error(new Error('没找到id'))
                        })
                    }

                });
            }
            else
            {
                next(null, {
                    error:consts.ERROR.BAD_USER_TYPE
                })
            }
        }
        else
        {
            next(null, {
                error:consts.ERROR.USER_NOT_LOGIN
            })
        }
    }
    else
    {
        next(null, {
            error:consts.ERROR.MISSING_PARAMS
        })
    }
}
handler.DoctorById = function(msg, session, next)
{
    if( msg.doctor_id !== undefined)
    {
        var id = msg.doctor_id;
        doctorDao.getDoctorById(id, function ( err, doctor)
        {
            if( err){
                next( null, {error:utils.Error(err)});
            }else{

                jobTitleDao.getJobTitles( function ( error, jobTitles) {
                    console.log(jobTitles);
                    if( error || jobTitles[doctor.job_title] == undefined){
                        next( null, { error:utils.Error(err)})
                    }else{
                        var res = {
                            error:utils.Error(err),
                            doctor_id:doctor.id,
                            name:doctor.name,
                            title:jobTitles[doctor.job_title].name,
                            hospital:doctor.hospital,
                            subjects:doctor.departments,
                            illnesses:doctor.diseases,
                            price:doctor.price,
                            image:utils.getImage(doctor.id),
                            online:doctor.online

                        }
                        next( null, res);
                    }

                })

            }
        })
    }else{
        next(null,{ error:consts.ERROR.MISSING_PARAMS});
    }

}

handler.Order = function(msg, session, next) {

    if( session.uid && session.get('id'))
    {
        async.parallel([
            function(callback)
            {
                orderDao.getOrderFindDoctorByKey(['user_id'],[session.get('id')],function( err, orders)
                {
                    callback( err, orders);
                })

            },
            function(callback)
            {
                orderDao.getOrderRegistrationByKey(['user_id'],[session.get('id')],function ( err,orders)
                {
                    callback( err, orders);
                });
            },
            function (callback)
            {
                orderDao.getServiceOrder({user_id:session.get('id')},function ( err, orders)
                {
                    callback( err, orders);
                });
            },
            function( callback)
            {
                departmentDao.getDepartmentsMap(function( err, res)
                {
                    callback( err, res);
                });
            },
            function( callback)
            {
                diseaseDao.getDiseases( function (err, res){
                    callback(err, res);
                });
            }
        ],
            function( err, result)
            {

                var findDoctorList = result[0];
                var findDoctors = [];

                var departments = result[3];
                var diseases = result[4];
                if(findDoctorList && findDoctorList.length > 0)
                {
                    for( var i = 0; i < findDoctorList.length; i++)
                    {
                        var order = findDoctorList[i];
                        if( order)
                        {
                            if(order.status == 1 )
                            {
                                order.subject = departments[order.subject].name;
                                order.illness = diseases[order.illness].name;
                            }
                            order.category = consts.TYPE_NAME[order.category];
                            findDoctors.push(order)
                        }
                    }
                }

                var registrationList = result[1];
                var registrations = [];
                if(registrationList && registrationList.length > 0)
                {
                    for( var i = 0; i < registrationList.length; i++)
                    {
                        console.log(registrationList[i]);
                        registrations.push({
                            order_id:registrationList[i].order_id,
                            worker_contact:registrationList[i].worker_contact,	//劳务人员联系方式
                            worker_id:registrationList[i].worker_id,				//劳务人员id。可查看详细信息
                            worker_name:registrationList[i].worker_name,		//劳务姓名
                            need_time:registrationList[i].need_time,	//需号时间
                            ctime:registrationList[i].ctime,
                            type:registrationList[i].type,
                            city:registrationList[i].city,
                            category:registrationList[i].category,
                            subject:registrationList[i].department,
                            comment:registrationList[i].comment,
                            status:registrationList[i].status,
                            comment_desc:registrationList[i].comment_desc,
                            patient:{
                                name:registrationList[i].name,
                                sex:registrationList[i].sex,
                                birthday:registrationList[i].birthday,
                                id_card:registrationList[i].id_card,
                                contact:registrationList[i].user_contact,
                                need_medical_record:registrationList[i].need_medical_record,
                                have_health_insurance:registrationList[i].have_health_insurance
                            }
                        })
                    }

                }
                var serviceOrders = result[2];
                var customer_services = [];
                if(serviceOrders && serviceOrders.length > 0)
                {
                    for( var i = 0; i < serviceOrders.length; i++)
                    {
                        customer_services.push({
                            order_id:serviceOrders[i].order_id,
                            service_id:serviceOrders[i].service_id,		//客服id
                            user_phone_number:serviceOrders[i].user_phone_number,		//用户来电号码
                            comment:serviceOrders[i].comment,
                            comment_desc:serviceOrders[i].comment_desc,
                            status:serviceOrders[i].status,
                            ctime:utils.DateFormat(serviceOrders[i].ctime)
                        });
                    }
                }
                next( null, {
                    error:utils.Error(err),
                    find_doctor:findDoctors,
                    customer_services:customer_services,
                    registration:registrations
                });
            }
        );
    }
    else
    {
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        });
    }



}

handler.OrderByOrderId = function ( msg, session, next)
{
    if( session.uid && session.get('id'))
    {
        if ( msg.order_id && msg.order_type)
        {
            async.parallel([
                function( callback)
                {
                    departmentDao.getDepartmentsMap(function( err, res)
                    {
                        callback( err, res);
                    });
                },
                function( callback)
                {
                    diseaseDao.getDiseases( function (err, res){
                        callback(err, res);
                    });
                }
            ],
                function(error, results)
                {
                    if( error)
                    {
                        log.error(error.stack);
                        utils.sendMail(error.message, error.stack);
                        next( null, {
                            error:utils.Error(error)
                        })
                    }
                    else
                    {
                        var departments = results[0];
                        var diseases = results[1];
                        if(msg.order_type == consts.ORDER_TYPE_ID.OrderDoctor)
                        {
                            orderDao.getOrderFindDoctorByKey(['order_id'],[msg.order_id], function ( err, orders)
                            {
                                if( !err)
                                {
                                    if( orders && orders[0])
                                    {
                                        var order = orders[0];
                                        if(order.status == 1 )
                                        {
                                            order.subject = departments[order.subject].name;
                                            order.illness = diseases[order.illness].name;
                                        }
                                        order.category = consts.TYPE_NAME[order.category];
                                        next( null, {
                                            error:utils.Error(null),
                                            order:order
                                        })
                                    }
                                    else
                                    {
                                        next( null, {
                                            error:consts.ERROR.ORDER_NULL
                                        })
                                    }
                                }
                                else
                                {
                                    log.error(err.stack);
                                    utils.sendMail(err.message, err.stack);
                                    next( null, {
                                        error:utils.Error(err)
                                    })
                                }
                            });
                        }
                        else if(msg.order_type == consts.ORDER_TYPE_ID.OrderWork)
                        {
                            orderDao.getOrderRegistrationByKey(['order_id'],[msg.order_id], function( err, orders)
                            {
                                if( !err)
                                {
                                    if( orders && orders[0])
                                    {
                                        var order = {
                                            order_id:orders[0].order_id,
                                            worker_contact:orders[0].worker_contact,	//劳务人员联系方式
                                            worker_id:orders[0].worker_id,				//劳务人员id。可查看详细信息
                                            worker_name:orders[0].worker_name,		//劳务姓名
                                            need_time:orders[0].need_time,	//需号时间
                                            ctime:orders[0].ctime,
                                            type:orders[0].type,
                                            city:orders[0].city,
                                            category:orders[0].category,
                                            subject:orders[0].department,
                                            comment:orders[0].comment,
                                            status:orders[0].status,
                                            comment_desc:orders[0].comment_desc,
                                            patient:{
                                                name:orders[0].name,
                                                sex:orders[0].sex,
                                                birthday:orders[0].birthday,
                                                id_card:orders[0].id_card,
                                                contact:orders[0].user_contact,
                                                need_medical_record:orders[0].need_medical_record,
                                                have_health_insurance:orders[0].have_health_insurance
                                            }
                                        };

                                        next ( null , {
                                            error:utils.Error(null),
                                            order:order
                                        })
                                    }
                                    else
                                    {
                                        next( null, {
                                            error:consts.ERROR.ORDER_NULL
                                        })
                                    }
                                }
                                else
                                {
                                    log.error(err.stack);
                                    utils.sendMail(err.message, err.stack);
                                    next( null, {
                                        error:utils.Error(err)
                                    })
                                }
                            });
                        }
                        else if(msg.order_type == consts.ORDER_TYPE_ID.OrderService)
                        {
                            orderDao.getServiceOrder({order_id:msg.order_id}, function( err, orders)
                            {
                                if( !err)
                                {
                                    if( orders && orders[0])
                                    {
                                        var order = {
                                            order_id:orders[0].order_id,
                                            service_id:orders[0].service_id,		//客服id
                                            user_phone_number:orders[0].user_phone_number,		//用户来电号码
                                            comment:orders[0].comment,
                                            comment_desc:orders[0].comment_desc,
                                            status:orders[0].status,
                                            ctime:utils.DateFormat(orders[0].ctime)
                                        };

                                        next ( null , {
                                            error:utils.Error(null),
                                            order:order
                                        })
                                    }
                                    else
                                    {
                                        next( null, {
                                            error:consts.ERROR.ORDER_NULL
                                        })
                                    }
                                }
                                else
                                {
                                    log.error(err.stack);
                                    utils.sendMail(err.message, err.stack);
                                    next( null, {
                                        error:utils.Error(err)
                                    })
                                }
                            });
                        }
                        else
                        {
                            next( null , {
                                error:consts.ERROR.BAD_ORDER_TYPE
                            })
                        }
                    }
                }
            );
        }
        else
        {
            next( null , {
                error:consts.ERROR.MISSING_PARAMS
            })
        }
    }
    else
    {
        next( null , {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }

}


handler.OrderFindDoctorGenerate = function(msg, session, next) {
    var self = this;
    var uid = "";
    var userType = "";
    if( session.uid)
    {
        var arr = session.uid.split('*');
        uid = arr[0];
        userType =  arr[1];
    }

    var subject = msg.subject;
    var price = msg.price;
    var category = msg.category;
    var illness = msg.illness;
    var phone_number = msg.phone_number;
    var disease_desc = msg.illness_desc;
    if(!disease_desc)
    {
        disease_desc = '没有描述!';
    }
    var patient_name = msg.patient_name;
    if( !patient_name)
    {
        patient_name = session.get('name');
    }
    if( uid && userType)
    {

        orderDao.clearOrderByUser(session.get('id'), function ( err, res)
        {
            console.log(err, res);
            orderDao.checkUserOrder(session.get('id'), function (err1,res)
            {
                console.log(err1, res);
                if( res)
                {
                    async.parallel([
                        function( callback)//查找用户
                        {
                            userDao.getUserByMobile(uid, function ( err, res)
                            {
                                callback( err, res);
                            })
                        },
                        function(callback)//查找在线医生
                        {
                            doctorDao.getOnlineDoctors(subject, illness, price, function ( err, res)
                            {
                                callback(err,res);
                            })
                        },
                        function( callback)
                        {
                            priceDao.getPrices( function ( err, res)
                            {
                                callback(err,res);
                            })
                        },
                        function ( callback)
                        {
                            departmentDao.getDepartmentsMap(function ( err, res)
                            {
                                callback( err, res);
                            });
                        },
                        function ( callback)
                        {
                            diseaseDao.getDiseasesMap(function ( err, res)
                            {
                                callback( err, res);
                            });
                        }

                    ],
                        function( err, result)
                        {
                            try
                            {
                                if( err)
                                {
                                    log.error(err.stack);
                                    next( null, {
                                        error:utils.Error(err)
                                    })
                                    return;
                                }
                                var user = result[0];
                                var doctors = result[1];
                                var prices = result[2];
                                var departments = result[3];
                                var diseases = result[4];
                                if(user &&  user.phone_number !== null && user.phone_number!== "")
                                {
                                    if( doctors && doctors.length > 0)
                                    {
                                        //生成订单
                                        var order = new OrderFindDoctor;
                                        order.user_id = user.id;
                                        order.user_name = patient_name;
                                        order.category = category;
                                        order.user_contact = phone_number;
                                        order.disease = illness;
                                        order.price = prices[price].price;
                                        order.department = subject;
                                        order.status = consts.ORDER_STATUS.DidNotPay;
                                        order.disease_desc = disease_desc;
                                        order.order_id = utils.DateFormat( new Date(), "yyyyMMddhhmmss") + user.id;

                                        orderDao.addOrderFindDoctor(order, function(err, res)   //add order to db
                                        {
                                            try
                                            {
                                                if( !err)
                                                {
                                                    // add phone_number to database
                                                    var phone_numbers = "";
                                                    if( !utils.ArrayIsContains(user.phone_numbers,order.user_contact))
                                                    {
                                                        user.phone_numbers.push(phone_number);
                                                        phone_numbers = user.phone_numbers.toString();
                                                    }
                                                    order.user_uid = session.uid;
                                                    order.user_sid = session.frontendId;

                                                    log.debug(JSON.stringify(order));

                                                    var order_Doctor = pomelo.app.get(consts.ORDER_TYPE.OrderDoctor);   //TODO 各服务器同步
                                                    order_Doctor[order.order_id] = order;

                                                    //user is ok
                                                    if( user.money >= prices[price].price)
                                                    {
                                                        user.money = user.money - prices[price].price;

                                                        log.debug(res);
                                                        order_Doctor[order.order_id].status = consts.ORDER_STATUS.NotAccept;


                                                        order.department = departments[order.department].name;
                                                        order.disease = diseases[order.disease].name;

                                                        order.status = consts.ORDER_STATUS.NotAccept;
                                                        var channelService = pomelo.app.get('channelService');
                                                        var params = {
                                                            order_id:order.order_id,
                                                            subject:order.department,
                                                            illness:order.disease,
                                                            illness_desc:order.disease_desc,
                                                            category:consts.TYPE_NAME[order.type],
                                                            price:prices[price].price,
                                                            patient_name:order.user_name,
                                                            ctime: utils.DateFormat(new Date()),
                                                            status:order.status
                                                        }
                                                        for ( var k = 0; k < doctors.length; k ++)
                                                        {
                                                            if(doctors[k] && doctors[k].uid)
                                                            {
                                                                order.doctors.push( doctors[k].uid.split('*')[0] + '*' + doctors[k].sid);
                                                            }
                                                        }
                                                        log.debug(order.doctors);

                                                        //save order status
                                                        orderDao.setOrderFindDoctor('order_id',order.order_id,['doctors','status','department','disease'],
                                                            [order.doctors.toString(),consts.ORDER_STATUS.NotAccept,order.department,order.disease],function (err, res)
                                                            {
                                                                if(err) log.error(err.stack);
                                                                if( res) log.error(res);
                                                            })

                                                        channelService.pushMessageByUids(consts.PushMessage.findDoctorOrderGenerate,
                                                            params,
                                                            doctors,
                                                            function(err, res)
                                                            {
                                                                if(!err)
                                                                {
                                                                    if( res && res.length > 0)
                                                                    {
                                                                        log.debug(res.toString());
                                                                    }
                                                                }
                                                                else
                                                                {
                                                                    log.error(err.message,err.stack);
                                                                }
                                                            }
                                                        );
                                                        var param = ['money'];
                                                        var args = [user.money];
                                                        if(phone_numbers && phone_numbers !== '')
                                                        {
                                                            param.push('phone_numbers');
                                                            args.push(phone_numbers);
                                                        }
                                                        userDao.setUser('phone_number',user.phone_number,param,args,function(err,res)
                                                        {
                                                            if(!err)
                                                            {
                                                                next( null, {
                                                                    error:utils.Error(null),
                                                                    balance:user.money
                                                                });
                                                            }
                                                            else
                                                            {
                                                                log.error(err.stack);
                                                                next( null, {
                                                                    error:utils.Error(err)
                                                                });
                                                            }
                                                        });
                                                    }
                                                    else
                                                    {
                                                        next( null, {
                                                            error:consts.ERROR.MONEY_NOT_ENOUGH
                                                        })
                                                    }
                                                }
                                                else
                                                {
                                                    log.error(err.stack ? err.stack : err.message);
                                                    next( null, {
                                                        error:utils.Error(err)
                                                    })
                                                }
                                            }
                                            catch (e)
                                            {
                                                log.error(e.stack);
                                                utils.sendMail(e.message, e.stack);
                                                next( null, {
                                                    error:utils.Error(e)
                                                })
                                            }
                                        })

                                    }
                                    else
                                    {
                                        next( null, {
                                            error:consts.ERROR.NO_DOCTOR_ONLINE
                                        })
                                    }

                                }
                                else
                                {

                                    next( null, {
                                        error:consts.ERROR.USER_NOT_LOGIN
                                    })
                                }
                            }
                            catch (e)
                            {
                                log.error(e.stack);
                                utils.sendMail(e.message, e.stack);
                                next( null, {
                                    error:utils.Error(e)
                                })
                            }

                        }
                    );
                }
                else
                {
                    next( null, {
                        error:consts.ERROR.HAVE_ONT_FINISHED_ORDER
                    })
                }
            });
        });

    }
    else
    {
        log.error(uid,userType,session.uid);
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }


}
/**
 * push挂号消息 to 劳务，定时器
 * @param order
 */
var pushRegistration = function ( order)
{
    if(order)
    {
        var channelService = pomelo.app.get('channelService');
        var params = {
            order_id:order.order_id,
            subject:order.department,
            illness:order.disease,
            hospital:order.hospital,
            category:order.type,
            city:order.city,
            type:order.type,
            client_name:order.name,
            patient_name:order.name,
            sex:order.sex,
            birthday:order.birthday,
            identifyCard:order.id_card,
            ctime: utils.DateFormat(new Date()),
            status:order.status,
            medicalrecord:order.need_medical_record ? 1:0,
            medicalpatient:order.have_health_insurance ? 1:0,
            registration:order.need_time
        }
        var order_Worker = pomelo.app.get(consts.ORDER_TYPE.OrderWork);   //TODO 各服务器同步

        if(order_Worker && order_Worker[order.order_id] && order_Worker[order.order_id].length > 0)
        {
            var worker = order_Worker[order.order_id].shift();  //获取劳务id

            log.info('push to worker',JSON.stringify(worker));
            order_Worker['push'+order.order_id] = worker;       //保存当前push劳务


            channelService.pushMessageByUids("onOrderGeneratePush",
                params,
                [worker],
                function(err, res)
                {
                    if(!err)
                    {
                        if( res && res.length > 0)
                        {
                            log.debug(res.toString());
                        }
                    }
                    else
                    {
                        log.error(err.message,err.stack);
                    }
                });
            workerOrderDao.insert(order.order_id,worker['uid'].split('*')[0], function ( err, res)
            {
                if( err) log.error( err.stack);
                console.log(res);
            });
        }
        else
        {
            log.warn('order_Worker is null cancelJob!');
            schedule.cancelJob(this.id);
        }
    }
    else
    {
        log.warn('order is null cancelJob!');
        schedule.cancelJob(this.id);
    }

}


/**
 * 挂号下单，找劳务
 * @param msg
 * @param session
 * @param next
 * @constructor
 */
handler.OrderRegistrationGenerate = function(msg, session, next) {
    var self = this;
    var uid = "";
    var userType = "";
    if( session.uid)
    {
        console.log(session.uid)
        var arr = session.uid.split('*');
        uid = arr[0];
        userType =  arr[1];
    }
    else
    {
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
        return;
    }

    var subject = msg.subject;
    var hospital = msg.hospital;
    var category = msg.category;
    var city = msg.city;
    var type = msg.type;
    var need_time = msg.need_time;
    var patient = msg.patient;

    if( uid && userType)
    {
        async.parallel([
            function(callback)
            {
                userDao.getUserByMobile(uid, function ( err, res)
                {
                    callback( err, res);
                })
            },
            function ( callback)
            {
                workerDao.getOnlineWorkers( city, function ( err, res)
                {
                    callback( err, res);
                });
            },
            function ( callback)
            {
                departmentDao.getDepartmentsMap(function ( err, res)
                {
                    callback( err, res);
                });
            },
            function ( callback)
            {
                hospitalDao.getHospitalsMap( function ( err, res)
                {
                    callback( err, res);
                });
            }
        ],
            function (err, result){
                try
                {
                    if( err)
                    {
                        log.error(err.stack ? err.stack : err.message);
                        next( null, {
                            error:utils.Error(err)
                        })
                        return;
                    }
                    else
                    {
                        var user = result[0];
                        var workers = result[1];
                        var departments = result[2];
                        var hospitals = result[3];
                        subject = departments[subject].name;
                        category = consts.TYPE_NAME[category];
                        hospital = hospitals[hospital].name;

                        if(user &&  user.phone_number !== null && user.phone_number!== "")
                        {
                            if( workers && workers.length > 0)
                            {
                                //下单
                                var order = new OrderRegistration;
                                order.order_id = utils.DateFormat( new Date(), "yyyyMMddhhmmss") + user.id;
                                order.user_id = user.id;
                                order.user_contact = patient.contact;
                                order.type = type;
                                order.category = category;
                                order.hospital = hospital;
                                order.city = city;
                                order.department = subject;
                                order.need_medical_record = patient.need_medical_record;
                                order.have_health_insurance = patient.have_health_insurance;
                                order.name = patient.name;
                                order.sex = patient.sex;
                                order.id_card = patient.id_card;
                                order.need_time = need_time;
                                order.birthday = patient.birthday;
                                order.status = consts.Registration_ORDER_STATUS.NotDispose;

                                orderDao.addOrderRegistration(order, function( err, res)
                                {
                                    try
                                    {
                                        if( !err)
                                        {
                                            order.user_uid = session.uid;
                                            order.user_sid = session.frontendId;

                                            var order_Worker = pomelo.app.get(consts.ORDER_TYPE.OrderWork);   //TODO 各服务器同步
                                            order_Worker[order.order_id] = workers;
                                            order_Worker['order'+order.order_id] = order;

                                            order_Worker['schedule' + order.order_id] = schedule.scheduleJob({
                                                start:Date.now(),
                                                period:consts.LAO_WU_ORDER_TIME    //1分钟
                                            },pushRegistration,order);

                                            next( null, {
                                                error:utils.Error(null)
                                            })
                                        }
                                        else
                                        {
                                            log.error(err.stack ? err.stack : err.message);
                                            next( null, {
                                                error:utils.Error(err)
                                            })
                                        }
                                    }
                                    catch (e)
                                    {
                                        log.error(e.stack);
                                        utils.sendMail(e.message, e.stack);
                                        next( null, {
                                            error:utils.Error(e)
                                        })
                                    }
                                });

                            }
                            else
                            {
                                next( null, {
                                    error:consts.ERROR.NO_WORKER_ONLINE
                                });
                            }
                        }
                        else
                        {
                            next( null, {
                                error:consts.ERROR.USER_NOT_LOGIN
                            });
                        }

                    }
                }
                catch ( e)
                {
                    log.error(e.stack);
                    utils.sendMail(e.message, e.stack);
                    next( null, {
                        error:utils.Error(e)
                    })
                }
            }
        );

    }
    else
    {
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }
}

/**
 * 发i否在线，worker or doctor
 * @param message
 * @param session
 * @param next
 * @constructor
 */
handler.IsOnline = function ( message, session, next)
{
    var isLogin = false;
    if( session.uid)
    {
        var userType = session.uid.split('*')[1];
        if( userType === consts.USER.Doctor || userType === consts.USER.Worker)
        {
            isLogin = true;
            next ( null, { error:utils.Error(null), isOnline:session.get('online')});
        }
    }

    if( isLogin == false){
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }
}
// for doctor
handler.OnLine = function(msg, session, next){
    var isLogin = false;
    if( session.uid){
        var uid = session.uid.split('*')[0];
        var userType = session.uid.split('*')[1];
        var dao ;
        if( userType == consts.USER.Doctor)
        {
            dao = doctorDao;
        }
        else if( userType == consts.USER.Worker)
        {
            dao = workerDao;
        }
        else
        {
            next( null, {
                error:consts.ERROR.USER_NOT_LOGIN
            })
            return;
        }
        if( uid) {
            isLogin = true;
            dao.setOnline(uid, 1 ,function ( err, flag){
                if( !err && flag){
                    session.set('online', true);
                    session.pushAll( function(err)
                    {
                        if(err)
                        {
                            log.error('set session service failed! error is : %j', err.stack);
                        }
                    });
                    next(null,{
                        error:utils.Error(err)
                    });
                }else{
                    next( null,{
                        error:utils.Error(err)
                    })
                }

            });
        }
    }

    if( isLogin == false){
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }

}
handler.OffLine = function(msg, session, next){
    var isLogin = false;
    if( session.uid){
        var uid = session.uid.split('*')[0];
        var userType = session.uid.split('*')[1];
        var dao ;
        if( userType == consts.USER.Doctor)
        {
            dao = doctorDao;
        }
        else if( userType == consts.USER.Worker)
        {
            dao = workerDao;
        }
        else
        {
            next( null, {
                error:consts.ERROR.USER_NOT_LOGIN
            })
            return;
        }

        if( uid) {
            isLogin = true;
            dao.setOnline(uid, 0 ,function ( err, flag){
                if( !err && flag){
                    session.set('online', false);
                    session.pushAll( function(err)
                    {
                        if(err)
                        {
                            log.error('set session service failed! error is : %j', err.stack);
                        }
                    });
                    next(null,{
                        error:utils.Error(null)
                    });
                }else{
                    next( null,{
                        error:utils.Error(err)
                    })
                }

            });
        }
    }

    if( isLogin == false){
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }
}

/**
 * 订单响应
 * @param msg
 * @param session
 * @param next
 * @constructor
 */
handler.OrderConfirmation = function(msg, session, next){
    var self = this;
    var isLogin = false;
    console.log(msg);
    if( session.uid){
        var uid = session.uid.split('*')[0];
        var userType = session.uid.split('*')[1];
        if( uid && userType == consts.USER.Doctor) //find doctor
        {
            isLogin = true;
            var order_id = msg.order_id;
            var order_Doctor = pomelo.app.get(consts.ORDER_TYPE.OrderDoctor);


            async.parallel([
                function( callback)
                {
                    if( !order_Doctor[order_id])
                    {
                        orderDao.getOrderFindDoctorByKey(['order_id'],[order_id], function ( err, res)
                        {
                            callback( err, res);
                        })
                    }
                    else
                    {
                        callback(null,null);
                    }
                }
            ],
                function ( error, result)
                {

                    if(error)
                    {
                        next( null, {
                            error:utils.Error(error)
                        })
                    }
                    else
                    {
                        if(result[0] && result.length > 0)
                        {
                            var order = new OrderFindDoctor(result[0][0]);
                            if(order.order_id == order_id && order_Doctor[order_id] == undefined)
                            {
                                order_Doctor[order_id] = order;
                            }
                        }
                        if( order_id && order_Doctor[order_id])
                        {
                            if( order_Doctor[order_id].status == consts.ORDER_STATUS.NotAccept)    //异步问题？TODO 直接DELETE ？
                            {
                                order_Doctor[order_id].status = consts.ORDER_STATUS.Accepted;

                                //申请临时号码
                                utils.virtualNumberOpen("01001",order_Doctor[order_id].user_contact,session.get('phone_number'),
                                    consts.VIRTUAL_NUMBER.EXP_TIME,consts.VIRTUAL_NUMBER.AVA_TIME,function ( data)
                                {
                                    log.info(data);
                                    if(data)
                                    {
                                        data = eval('('+data+')');
                                    }
                                    var exptime = Math.ceil(new Date().getTime()/1000) + 60 * consts.VIRTUAL_NUMBER.EXP_TIME;
                                    logDao.OpenVirtualNumberLog({
                                        ctime:new Date(),
                                        exptime:exptime,
                                        avatime:consts.VIRTUAL_NUMBER.AVA_TIME,
                                        phonenumber:order_Doctor[order_id].user_contact,
                                        realnumber:session.get('phone_number'),
                                        companyCode:"01001",
                                        status: data ? data.status : '-1',
                                        uuid: data ? data.id : 0,
                                        virtualnumber: data ? data.virtualNumber : ""

                                    },function ( err,data)
                                    {
                                        log.info("OpenVirtualNumberLog ", data);
                                    });

                                    if(data && data.id)
                                    {

                                        orderDao.setOrderFindDoctor('order_id',order_id,
                                            ['status','doctor_id','contact','uuid','doctor_name','exptime','avatime'],
                                            [consts.ORDER_STATUS.Accepted,session.get('id'),data.virtualNumber,data.id,session.get('name'),exptime,consts.VIRTUAL_NUMBER.AVA_TIME],
//                                            [consts.ORDER_STATUS.Accepted,session.get('id'),session.get('phone_number')],
                                            function( err, res)
                                            {
                                                if(err)
                                                {
                                                    log.error(err.message , err.stack);
                                                    next( null, {
                                                        error:utils.Error( err)
                                                    })
                                                }
                                                else
                                                {
                                                    //TODO PUSH TO USER
                                                    var channelService = self.app.get('channelService');
                                                    var arr = new Array();

                                                    if(order_Doctor[order_id].user_uid && order_Doctor[order_id].user_sid)
                                                    {//todo 离线消息
                                                        arr.push({
                                                            uid:order_Doctor[order_id].user_uid,
                                                            sid:order_Doctor[order_id].user_sid
                                                        });
                                                        var values = {
                                                            doctor_contact:data.virtualNumber,
                                                            doctor_name:session.get('name')
                                                        }
                                                        channelService.pushMessageByUids( 'onFindDoctor', values, arr, function ( err, users)
                                                        {
                                                            for ( var i = 0; i<users.length;i++)
                                                            {//未找到的用户//todo 离线消息
                                                                console.log(users[i]);
                                                            }
                                                        })
                                                    }


                                                    //TODO PUSH TO OTHER DOCTOR
                                                    var doctorList = order_Doctor[order_id].doctors;
                                                    var doctorsPushList = new Array();
                                                    for( var i = 0; i < doctorList.length ; i++)
                                                    {
                                                        var ids = doctorList[i].split('*');
                                                        if( ids[0] !== uid)
                                                        {
                                                            doctorsPushList.push({
                                                                uid:ids[0] + '*' + consts.USER.Doctor,
                                                                sid:ids[1]
                                                            })
                                                        }
                                                    }
                                                    var params = {
                                                        order_id:order_id
                                                    }
                                                    if(doctorsPushList.length > 0)
                                                    {
                                                        channelService.pushMessageByUids( 'onOrderCancelPush', params, doctorsPushList, function ( err, users)
                                                        {
                                                            if(err) log.error(err.stack);
                                                            if( users) log.debug(users.toString());
                                                        })
                                                    }


                                                    next( null, {
                                                        error:utils.Error( null),
                                                        phone_number:data.virtualNumber
                                                    })
                                                }
                                            })
                                    }else
                                    {
                                        order_Doctor[order_id].status = consts.ORDER_STATUS.NotAccept;
                                        next( null, {
                                            error:consts.ERROR.HAVE_ONT_FINISHED_ORDER
                                        })
                                    }
                                });

                            }
                            else
                            {
                                //没抢到
                                next( null, {
                                    error:consts.ERROR.ORDER_IS_ACCEPTED
                                })
                            }
                        }
                        else
                        {
                            log.error(order_id, order_Doctor ? JSON.stringify(order_Doctor):'undefine');
                            next( null, {
                                error:consts.ERROR.ORDER_NULL
                            })
                        }
                    }
                }
            )

        }
        else if( uid && userType == consts.USER.Worker) //挂号订单
        {
            isLogin = true;
            var order_id = msg.order_id;
            var order_Worker = pomelo.app.get(consts.ORDER_TYPE.OrderWork);
            console.log(order_Worker)
            var worker = order_Worker['push'+order_id];
            if(worker && worker['uid'] == session.uid)    //验证订单是否对劳务人员失效
            {
                if( msg.accept_type && msg.accept_type == 1)
                {
                    //接受
                    //清除定时，清除order
                    delete  order_Worker[order_id];
                    delete order_Worker['push'+order_id];

                    if(order_Worker['schedule' + order_id])
                    {
                        schedule.cancelJob(order_Worker['schedule' + order_id]);
                        delete  order_Worker['schedule' + order_id];
                    }
                    var order = order_Worker['order'+order_id];

                    //update datebases
                    orderDao.setOrderRegistration('order_id',order_id,['worker_id','worker_contact','status','worker_name'],
                        [session.get('id'),session.get('phone_number'),consts.Registration_ORDER_STATUS.Accepted,session.get('name')],
                        function ( err, res)
                        {
                            if( err) log.error(err.stack?err.stack:err.message);
                            if( res) log.debug(res);
                        });
                    workerOrderDao.accept( order_id, session.get('phone_number'), function ( err, res)
                    {
                        if( err) log.error(err.stack?err.stack:err.message);
                        console.log( 'res', res);

                    });
                    //push to User
                    var users = {
                        uid:order.user_uid,
                        sid:order.user_sid
                    }
                    console.log(users);
                    var parmas = {
                        worker:session.get('name'),
                        contact:session.get('phone_number'),
                        time:utils.DateFormat(new Date())
                    }
                    var channelService = self.app.get('channelService');
                    if(channelService)
                    {
                        channelService.pushMessageByUids( 'onRegistration', parmas, [users], function ( err, users)
                        {
                            if(err) log.error(err.stack);
                            if( users) log.debug(users.toString());
                        })
                    }

                    if(order)
                    {
                        next( null, {
                            error:utils.Error(null),
                            phone_number:order.user_contact
                        })
                    }
                    else
                    {
                        next( null, {
                            error:utils.Error(null)
                        });
                    }

                }
                else
                {


                    var reason = msg.reason;
                    workerOrderDao.refuse( order_id, session.get('phone_number'),reason, function ( err, res)
                    {
                        if( err) log.error(err.stack?err.stack:err.message);
                        console.log( 'res', res);

                    });
                    //拒绝
                    delete order_Worker['push'+order_id]

                    if(order_Worker['schedule' + order_id])
                    {
                        //重新开始定时

                        schedule.cancelJob(order_Worker['schedule' + order_id]);
                        var order = order_Worker['order' + order_id];
                        order_Worker['schedule' + order_id] = schedule.scheduleJob({
                            start:Date.now(),
                            period:consts.LAO_WU_ORDER_TIME    //60分钟
                        },pushRegistration,order);
                    }
                    next( null, {
                        error:utils.Error(null)
                    });

                }
            }
            else if( !worker)
            {
                //查数据库

                orderDao.getOrderRegistrationByKey(['order_id'],[order_id],function ( err, orders)
                {
                    if( err)
                    {
                        next( null, {
                            error:utils.Error(err)
                        })
                    }
                    else
                    {
                        if( orders && orders.length > 0)
                        {
                            var order = orders[0];
                            if( msg.accept_type && msg.accept_type == 1 && order.status == consts.Registration_ORDER_STATUS.NotDispose)
                            {
                                //update datebases
                                orderDao.setOrderRegistration('order_id',order_id,['worker_id','worker_contact','status'],
                                    [session.get('id'),session.get('phone_number'),consts.Registration_ORDER_STATUS.Accepted],
                                    function ( err, res)
                                    {
                                        if( err) log.error(err.stack?err.stack:err.message);
                                        if( res) log.debug(res);
                                    });

                                workerOrderDao.accept( order_id, session.get('phone_number'), function ( err, res)
                                {
                                    if( err) log.error(err.stack?err.stack:err.message);
                                    console.log( 'res', res);

                                });
                                //push to User
                                userDao.getUser(order.user_id, function ( err, user)
                                {
                                    if( err)
                                    {
                                        console.log(err);
                                    }
                                    else
                                    {
                                        var channelService = self.app.get('channelService');
                                        var channel = channelService.getChannel(consts.USER.User,false);
                                        var uid = user.phone_number + "*" + consts.USER.User;
                                        var userM = channel.getMember(uid);
                                        var users = new Array();
                                        if(userM)
                                        {
                                            users.push({
                                                uid:uid,
                                                sid:userM['sid']
                                            })
                                        }

                                        console.log(users);
                                        var parmas = {
                                            worker:session.get('name'),
                                            contact:session.get('phone_number'),
                                            time:utils.DateFormat(new Date())
                                        }

                                        if(channelService)
                                        {
                                            channelService.pushMessageByUids( 'onRegistration', parmas, users, function ( err, users)
                                            {
                                                if(err) log.error(err.stack);
                                                if( users) log.debug(users.toString());
                                            })
                                        }
                                    }

                                });


                                if(order)
                                {
                                    next( null, {
                                        error:utils.Error(null),
                                        phone_number:order.user_contact
                                    })
                                }
                                else
                                {
                                    next( null, {
                                        error:utils.Error(null)
                                    });
                                }
                            }
                            else if( order.status == consts.Registration_ORDER_STATUS.NotDispose)
                            {
                                var reason = msg.reason;
                                workerOrderDao.refuse( order_id, session.get('phone_number'),reason, function ( err, res)
                                {
                                    if( err) log.error(err.stack?err.stack:err.message);
                                    console.log( 'res', res);

                                });
                                next( null, {
                                    error:utils.Error(null)
                                });
                            }
                            else
                            {
                                next( null, {
                                    error:utils.Error(null)
                                });
                            }
                        }
                        else
                        {
                            next( null, {
                                error:consts.ERROR.ORDER_NULL
                            })
                        }
                    }
                })
            }
            else
            {
                console.log(worker,uid,worker['uid'],session.uid)
                next(null, {
                    error:consts.ERROR.ORDER_OVER_UDE
                })
            }
        }
    }

    if( isLogin == false){
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }
}
/**
 * 今天的劳务订单
 * @param msg
 * @param session
 * @param next
 * @constructor
 */
handler.OrderToday = function ( msg, session, next)
{
    var isLogin = false;
    if( session.uid){
        var uid = session.uid.split('*')[0];
        if( uid) {
            isLogin = true;

            var count = msg.count;
            var orderby = msg.orderby;
            var begin = msg.begintime;
            orderDao.getRegistrationRecordToday(uid,count,orderby,begin,function ( err, orders)
            {
                try
                {
                    if( err)
                    {
                        log.error(err.stack)
                        next( null,{
                            error:utils.Error(err)
                        })
                    }
                    else
                    {
                        var  records = new Array();
                        for( var i = 0; i < orders.length; i++)
                        {

                            if(orders[i].worker_id == session.get('id') || orders[i].status == consts.Registration_ORDER_STATUS.NotDispose)
                            {

                                records.push({
                                    order_id:orders[i].order_id,
                                    subject:orders[i].department,
                                    category:orders[i].category,
                                    hospital:orders[i].hospital,
                                    city:orders[i].city,
                                    client_name:orders[i].name,
                                    patient_name:orders[i].name,
                                    sex:orders[i].sex,
                                    birthday:orders[i].birthday,
                                    identifyCard:orders[i].id_card,
                                    type:orders[i].type,
                                    comment:orders[i].comment,
                                    comment_desc:orders[i].comment_desc,
                                    ctime:utils.DateFormat(orders[i].ctime),
                                    status:orders[i].status,
                                    medicalrecord:orders[i].need_medical_record,
                                    medicalpatient:orders[i].have_health_insurance,
                                    registration:utils.DateFormat(orders[i].need_time,"yyyy-MM-dd"),
                                    user_contact: orders[i].worker_id == session.get('id') ? orders[i].user_contact:undefined
                                });
                            }
                            else
                            {
                                records.push({
                                    order_id:orders[i].order_id,
                                    subject:orders[i].department,
                                    category:orders[i].category,
                                    hospital:orders[i].hospital,
                                    city:orders[i].city,
                                    client_name:orders[i].name,
                                    type:orders[i].type,
                                    comment:orders[i].comment,
                                    comment_desc:orders[i].comment_desc,
                                    ctime:utils.DateFormat(orders[i].ctime),
                                    status:consts.Registration_ORDER_STATUS.Refuse,
                                    refuseReason:orders[i].refuseReason,
                                    medicalrecord:orders[i].need_medical_record,
                                    medicalpatient:orders[i].have_health_insurance,
                                    registration:utils.DateFormat(orders[i].need_time,"yyyy-MM-dd")
                                });
                            }

                        }
                        next( null,{
                            error:utils.Error(null),
                            rescords:records
                        })
                    }
                }
                catch (e)
                {
                    log.error(e.stack);
                    utils.sendMail(e.message, e.stack);
                    next( null, {
                        error:utils.Error( e)
                    })
                }
            })
        }
    }
    if( isLogin == false){
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }
}

/**
 * 劳务订单查询
 * @param msg
 * @param session
 * @param next
 * @constructor
 */
handler.OrderRecord = function(msg, session, next){
    var isLogin = false;
    if( session.uid){
        var uid = session.uid.split('*')[0];
        if( uid) {
            isLogin = true;

            var count = msg.count;
            var orderby = msg.orderby;
            var begin = msg.begintime;
            orderDao.getRegistrationRecord(uid,count,orderby,begin,function ( err, orders)
            {
                try
                {
                    if( err)
                    {
                        log.error(err.stack)
                        next( null,{
                            error:utils.Error(err)
                        })
                    }
                    else
                    {
                        var  records = new Array();
                        for( var i = 0; i < orders.length; i++)
                        {

                            if(orders[i].worker_id == session.get('id') || orders[i].status == consts.Registration_ORDER_STATUS.NotDispose)
                            {
                                records.push({
                                    order_id:orders[i].order_id,
                                    subject:orders[i].department,
                                    category:orders[i].category,
                                    hospital:orders[i].hospital,
                                    city:orders[i].city,
                                    client_name:orders[i].name,
                                    patient_name:orders[i].name,
                                    sex:orders[i].sex,
                                    birthday:orders[i].birthday,
                                    identifyCard:orders[i].id_card,
                                    type:orders[i].type,
                                    comment:orders[i].comment,
                                    comment_desc:orders[i].comment_desc,
                                    ctime:utils.DateFormat(orders[i].ctime),
                                    status:orders[i].status,
                                    medicalrecord:orders[i].need_medical_record,
                                    medicalpatient:orders[i].have_health_insurance,
                                    registration:utils.DateFormat(orders[i].need_time,"yyyy-MM-dd"),
                                    user_contact: orders[i].worker_id == session.get('id') ? orders[i].user_contact:undefined

                                });
                            }
                            else
                            {
                                records.push({
                                    order_id:orders[i].order_id,
                                    subject:orders[i].department,
                                    category:orders[i].category,
                                    hospital:orders[i].hospital,
                                    city:orders[i].city,
                                    client_name:orders[i].name,
                                    type:orders[i].type,
                                    comment:orders[i].comment,
                                    comment_desc:orders[i].comment_desc,
                                    ctime:utils.DateFormat(orders[i].ctime),
                                    status:consts.Registration_ORDER_STATUS.Refuse,
                                    refuseReason:orders[i].refuseReason,
                                    medicalrecord:orders[i].need_medical_record,
                                    medicalpatient:orders[i].have_health_insurance,
                                    registration:utils.DateFormat(orders[i].need_time,"yyyy-MM-dd")
                                });
                            }

                        }
                        next( null,{
                            error:utils.Error(null),
                            rescords:records
                        })
                    }
                }
                catch (e)
                {
                    log.error(e.stack);
                    utils.sendMail(e.message, e.stack);
                    next( null, {
                        error:utils.Error( e)
                    })
                }
            })
        }
    }
    if( isLogin == false){
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }
}
handler.TelephoneRecord = function(msg, session, next){

    var isLogin = false;
    if( session.uid){
        var uid = session.uid.split('*')[0];
        if( uid) {
            isLogin = true;

            var count = msg.count;
            var orderby = msg.orderby;
            var begin = msg.begintime;
            orderDao.getDoctorTelephoneRecord(uid,count,orderby,begin, function(err, orders)
            {
                try
                {
                    if( err)
                    {
                        log.error(err.stack)
                        next( null,{
                            error:utils.Error(err)
                        })
                    }
                    else
                    {
                        var  records = new Array();
                        for( var i = 0; i < orders.length; i++)
                        {

                            if(orders[i].doctor_id == session.get('id') || orders[i].status == consts.ORDER_STATUS.NotAccept)
                            {
                                records.push({
                                    order_id:orders[i].order_id,
                                    subject:orders[i].subject,
                                    illness:orders[i].illness,
                                    illness_desc:orders[i].illness_desc,
                                    category:orders[i].category,
                                    price:orders[i].price,
                                    patient_name:orders[i].user_name,
                                    comment:orders[i].comment,
                                    comment_desc:orders[i].comment_desc,
                                    ctime:utils.DateFormat(orders[i].ctime),
                                    status:orders[i].status
                                });
                            }
                            else
                            {
                                records.push({
                                    order_id:orders[i].order_id,
                                    subject:orders[i].subject,
                                    illness:orders[i].illness,
                                    illness_desc:orders[i].illness_desc,
                                    category:orders[i].category,
                                    price:orders[i].price,
                                    patient_name:orders[i].user_name,
                                    comment:0,
                                    comment_desc:"",
                                    ctime:utils.DateFormat(orders[i].ctime),
                                    status:0
                                });
                            }

                        }
                        next( null,{
                            error:utils.Error(null),
                            rescords:records
                        })
                    }
                }
                catch (e)
                {
                    log.error(e.stack);
                    utils.sendMail(e.message, e.stack);
                    next( null, {
                        error:utils.Error( e)
                    })
                }
            });


        }
    }

    if( isLogin == false){
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }
}

handler.TelephoneToday = function(msg, session, next){

    var isLogin = false;
    if( session.uid){
        var uid = session.uid.split('*')[0];
        if( uid) {
            isLogin = true;

            var count = msg.count;
            var orderby = msg.orderby;
            var begin = msg.begintime;
            orderDao.getDoctorTelephoneToday(uid,count,orderby,begin, function(err, orders)
            {
                try
                {
                    if( err)
                    {
                        log.error(err.stack)
                        next( null,{
                            error:utils.Error(err)
                        })
                    }
                    else
                    {
                        var  records = new Array();
                        for( var i = 0; i < orders.length; i++)
                        {

                            if(orders[i].doctor_id == session.get('id') || orders[i].status == consts.ORDER_STATUS.NotAccept)
                            {
                                if( orders[i].status == consts.ORDER_STATUS.Accepted)
                                {
                                    records.push({
                                        order_id:orders[i].order_id,
                                        subject:orders[i].subject,
                                        illness:orders[i].illness,
                                        illness_desc:orders[i].illness_desc,
                                        category:orders[i].category,
                                        price:orders[i].price,
                                        phone_number:orders[i].contact,
                                        patient_name:orders[i].user_name,
                                        comment:orders[i].comment,
                                        comment_desc:orders[i].comment_desc,
                                        ctime:utils.DateFormat(orders[i].ctime) ,
                                        status:orders[i].status
                                    });
                                }
                                else
                                {
                                    records.push({
                                        order_id:orders[i].order_id,
                                        subject:orders[i].subject,
                                        illness:orders[i].illness,
                                        illness_desc:orders[i].illness_desc,
                                        category:orders[i].category,
                                        price:orders[i].price,
                                        patient_name:orders[i].user_name,
                                        comment:orders[i].comment,
                                        comment_desc:orders[i].comment_desc,
                                        ctime:utils.DateFormat(orders[i].ctime) ,
                                        status:orders[i].status
                                    });
                                }
                            }
                            else
                            {
                                records.push({
                                    order_id:orders[i].order_id,
                                    subject:orders[i].subject,
                                    illness:orders[i].illness,
                                    illness_desc:orders[i].illness_desc,
                                    category:orders[i].category,
                                    price:orders[i].price,
                                    patient_name:orders[i].user_name,
                                    comment:0,
                                    comment_desc:"",
                                    ctime:utils.DateFormat(orders[i].ctime),
                                    status:0
                                });
                            }

                        }
                        next( null,{
                            error:utils.Error(null),
                            rescords:records
                        })
                    }
                }
                catch (e)
                {
                    log.error(e.stack);
                    utils.sendMail(e.message, e.stack);
                    next( null, {
                        error:utils.Error( e)
                    })
                }
            });

        }
    }

    if( isLogin == false){
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }
}

handler.Earnings = function(msg, session, next){
    var isLogin = false;
    if( session.uid){
        var uid = session.uid.split('*')[0];
        if( uid) {
            isLogin = true;
            next( null, {
                error:utils.Error(null),
                earnings:session.get('earnings')
            })
        }
    }

    if( isLogin == false){
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }
}
handler.Credits = function(msg, session, next){
    var isLogin = false;
    if( session.uid){
        var uid = session.uid.split('*')[0];
        if( uid) {
            isLogin = true;
            next( null, {
                error:utils.Error(null),
                credits:session.get('credits')
            })
        }
    }

    if( isLogin == false){
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }
}
handler.Appeal = function(msg, session, next){
    var isLogin = false;
    if( session.uid){
        var uid = session.uid.split('*')[0];
        if( uid) {
            isLogin = true;
            //TODO
            next( null, {
                error:utils.Error( null)
            })
        }
    }

    if( isLogin == false){
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }
}
handler.RankingList = function(msg, session, next){
    var isLogin = false;
    if( session.uid){
        var uid = session.uid.split('*')[0];
        if( uid) {
            isLogin = true;
            //TODO
            next( null, {
                error:utils.Error( null),
                ranklist:[]
            })
        }
    }

    if( isLogin == false){
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }
}


//handler.BindMobile = function( msg, session, next){
//    var phoneNumber = msg.phone_number;
//    var name = msg.name;
//    var uid ;
//    if(session.uid)
//    {
//        uid = session.uid.split('*')[0];
//        if(uid)
//        {
//            if( session.get('phone_number') != null)
//            {
//                log.error("session.get('phone_number')=",session.get('phone_number'))
//                next( null, {
//                    error:utils.Error( new Error('already bind!'))
//                })
//            }
//            else
//            {
//                userDao.getUserByMobile(phoneNumber,function(err,user)
//                {
//                    if( err)
//                    {
//                        log.error(err.message, err.stack);
//                        next( null, {
//                            error:utils.Error( err)
//                        })
//                    }
//                    else if( user && user.id != 0)
//                    {
//                        session.set('phone_number',phoneNumber);
//                        session.pushAll( function(err)
//                        {
//                            if(err)
//                            {
//                                log.error('set for session service failed! error is : %j', err.stack);
//                            }
//                        });
//                        if( user.uid == '' || user.uid != uid)  //TODO
//                        {
//                            userDao.setUser('phone_number',phoneNumber,['uid'],[uid], function ( err, res)
//                            {
//                                if(err)
//                                {
//                                    log.error(err.message, err.stack);
//                                    next( null, {
//                                        error:utils.Error(err)
//                                    })
//                                }
//                                else
//                                {
//                                    next( null, {
//                                        error:utils.Error( null),
//                                        userinfo:{
//                                            phone_number:user.phone_number,
//                                            phone_numbers:user.phone_numbers,
//                                            balance:user.money
//                                        }
//                                    })
//                                }
//                            })
//                        }
//                        else if(user.uid != uid)
//                        {//TODO 在其他设备绑定过 先不做验证
//                            log.warn("***********")
//                        }
//                        else
//                        {
//                            next( null, {
//                                error:utils.Error( null),
//                                userinfo:{
//                                    phone_number:user.phone_number,
//                                    phone_numbers:user.phone_numbers,
//                                    balance:user.money
//                                }
//                            })
//                        }
//                    }
//                    else
//                    {
//                        //user is null ok
//                        userDao.setUser('uid',uid,['phone_number'],[phoneNumber], function ( err, res)
//                        {
//                            if(err)
//                            {
//                                log.error(err.message, err.stack);
//                                next( null, {
//                                    error:utils.Error(err)
//                                })
//                            }
//                            else
//                            {
//                                userDao.getUserByMobile(phoneNumber, function ( err, res)
//                                {
//                                    if(!err && res && res.id != 0)
//                                    {
//                                        next( null, {
//                                            error:utils.Error( null),
//                                            userinfo:{
//                                                phone_number:res.phone_number,
//                                                phone_numbers:res.phone_numbers,
//                                                balance:res.money
//                                            }
//                                        })
//                                    }
//                                    else
//                                    {
//                                        log.error(err.message, err.stack);
//                                        next( null, {
//                                            error:utils.Error( err)
//                                        })
//                                    }
//
//                                })
//                            }
//                        })
//                    }
//                })
//            }
//        }
//        else
//        {
//            next( null, {
//                error:utils.Error( new Error('not login init!'))
//            })
//        }
//
//    }
//    else
//    {
//        next( null, {
//            error:utils.Error( new Error('not login init!'))
//        })
//    }
//
//
//}

handler.GetInitInfo = function( msg, session, next)
{
    var dao = require('../../../dao/initInfoDao');
    dao.getUserInitInfo( function ( err, info)
    {
        next( null, {
            error:utils.Error(err),
            info:info
        });
    });
}

handler.Comment = function ( msg, session, next)
{
    if( session.uid && session.get('id'))
    {
        var arr = session.uid.split('*');
        var uid = arr[0];
        var userType =  arr[1];

        if( msg.order_id && msg.order_type && msg.comment)
        {
            var order_id = msg.order_id;

            if( msg.order_type == consts.ORDER_TYPE_ID.OrderDoctor)
            {
                orderDao.getOrderFindDoctorByKey(['order_id','user_id'],[order_id,session.get('id')],function (err, orders)
                {
                    if( !err && orders && orders[0])
                    {
                        var order = orders[0];
                        if( order.status == consts.ORDER_STATUS.NoComment)
                        {
                            //ok
                            var comment = msg.comment;
                            var comment_desc = msg.comment_desc;
                            if(comment < consts.CREDITS.length)
                            {
                                if( consts.ORDER_TABLE[msg.order_type])
                                {
                                    orderDao.giveComment(order_id, consts.ORDER_TABLE[msg.order_type],comment,
                                        comment_desc, consts.ORDER_STATUS.Finished, function( err, res)
                                    {
                                        if(err)
                                        {
                                            log.error(err.stack);
                                            next( null, {
                                                error:utils.Error(err)
                                            });
                                        }
                                        else
                                        {
                                            log.info(JSON.stringify(res));
                                            console.log(res)
                                            //TODO PUSH TO DOCTOR
                                            next( null, {
                                                error:utils.Error(null)
                                            });
                                        }

                                    });
                                }
                                else
                                {
                                    next( null, {
                                        error:consts.ERROR.BAD_ORDER_TYPE
                                    });
                                }
                            }
                            else
                            {
                                next( null, {
                                    error:consts.ERROR.BAD_COMMENT
                                })
                            }
                        }
                        else
                        {
                            next( null, {
                                error:consts.ERROR.ORDER_CANT_COMMENT
                            });
                        }
                    }
                    else
                    {
                        next( null, {
                            error:consts.ERROR.ORDER_NULL
                        });
                    }
                });
            }
            else if( msg.order_type == consts.ORDER_TYPE_ID.OrderWork)
            {
                orderDao.getOrderRegistrationByKey(['order_id','user_id'],[order_id,session.get('id')],function (err, orders)
                {
                    if( !err && orders && orders[0])
                    {
                        var order = orders[0];
                        if( order.comment == 0 && order.status > 1)
                        {
                            //ok
                            var comment = msg.comment;
                            var comment_desc = msg.comment_desc;
                            if(comment < consts.CREDITS.length)
                            {
                                if( consts.ORDER_TABLE[msg.order_type])
                                {
                                    orderDao.giveComment(order_id, consts.ORDER_TABLE[msg.order_type],comment,
                                        comment_desc, consts.Registration_ORDER_STATUS.Finished,function( err, res)
                                    {
                                        if(err)
                                        {
                                            log.error(err.stack);
                                            next( null, {
                                                error:utils.Error(err)
                                            });
                                        }
                                        else
                                        {
                                            log.info(JSON.stringify(res));
                                            console.log(res)
                                            //TODO PUSH TO DOCTOR
                                            next( null, {
                                                error:utils.Error(null)
                                            });
                                        }

                                    });
                                }
                                else
                                {
                                    next( null, {
                                        error:consts.ERROR.BAD_ORDER_TYPE
                                    });
                                }
                            }
                            else
                            {
                                next( null, {
                                    error:consts.ERROR.BAD_COMMENT
                                })
                            }
                        }
                        else
                        {
                            next( null, {
                                error:consts.ERROR.ORDER_CANT_COMMENT
                            });
                        }
                    }
                    else
                    {
                        next( null, {
                            error:consts.ERROR.ORDER_NULL
                        });
                    }
                });
            }
            else if( msg.order_type == consts.ORDER_TYPE_ID.OrderService)
            {
                orderDao.getServiceOrder({
                    order_id:order_id,
                    user_id:session.get('id')
                },function (err, orders)
                {
                    if( !err && orders && orders[0])
                    {
                        var order = orders[0];
                        if( order.comment == 0)
                        {
                            //ok
                            var comment = msg.comment;
                            var comment_desc = msg.comment_desc;
                            if(comment < consts.CREDITS.length)
                            {
                                if( consts.ORDER_TABLE[msg.order_type])
                                {
                                    orderDao.giveComment(order_id, consts.ORDER_TABLE[msg.order_type],comment,
                                        comment_desc,consts.SERVICE_ORDER_STATUS.Finished, function( err, res)
                                    {
                                        if(err)
                                        {
                                            log.error(err.stack);
                                            next( null, {
                                                error:utils.Error(err)
                                            });
                                        }
                                        else
                                        {
                                            log.info(JSON.stringify(res));
                                            console.log(res)
                                            //TODO PUSH TO DOCTOR
                                            next( null, {
                                                error:utils.Error(null)
                                            });
                                        }

                                    });
                                }
                                else
                                {
                                    next( null, {
                                        error:consts.ERROR.BAD_ORDER_TYPE
                                    });
                                }
                            }
                            else
                            {
                                next( null, {
                                    error:consts.ERROR.BAD_COMMENT
                                })
                            }
                        }
                        else
                        {
                            next( null, {
                                error:consts.ERROR.ORDER_CANT_COMMENT
                            });
                        }
                    }
                    else
                    {
                        next( null, {
                            error:consts.ERROR.ORDER_NULL
                        });
                    }
                });
            }else{
                next( null, {
                    error:consts.ERROR.BAD_ORDER_TYPE
                });
            }
        }
        else
        {
            next( null, {
                error:consts.ERROR.MISSING_PARAMS
            })
        }

    }

}

handler.GetCitys = function ( msg, session, next)
{
    var dao = require('../../../dao/cityDao');
    dao.getCityList( function ( err, citys)
    {
        next( null, {
            error:utils.Error(err),
            citys:citys
        })
    });
}

handler.Handup = function ( msg, session, next)
{
    var self = this;
    console.log(msg);
    if(msg.order_id){
        orderDao.getOrderFindDoctorByKey(['order_id'],[msg.order_id], function ( err, order)
        {
            console.log(err, order);
            if( err)
            {
                next( null, {
                    error:err
                })
            }
            else
            {
                if( order && order.length > 0)
                {
                    order = order[0];
                    console.log(order.status)
                    if(order.status == consts.ORDER_STATUS.Accepted)
                    {
                        async.parallel([
                            function( callback)
                            {
                                userDao.getUserByKey(['id'],[order.user_id], function ( err, user)
                                {
                                    callback( err, user);
                                } )
                            },
                            function( callback)
                            {
                                doctorDao.getDoctorById(order.doctor_id, function ( err, doctor)
                                {
                                    callback( err, doctor);
                                })
                            }
                        ],
                            function( err, result){
                                try
                                {
                                    if( err)
                                    {
                                        console.log(err);
                                        next( null, {
                                            error:utils.Error(err)
                                        })
                                    }
                                    else
                                    {
                                        console.log(result);
                                        var users = result[0];
                                        var user = users[0];
                                        var doctor = result[1];
                                        if( user && user.phone_number && doctor && doctor.uid)
                                        {
                                            var channelService = self.app.get('channelService');
                                            var channelUser = channelService.getChannel(consts.USER.User, false);
                                            var channelDoctor = channelService.getChannel(consts.USER.Doctor, false);
                                            var doctorUid = doctor.uid + '*' + consts.USER.Doctor;
                                            var userUid = user.phone_number + '*' + consts.USER.User;
                                            var doctorM = channelDoctor.getMember( doctorUid);
                                            var userM = channelUser.getMember( userUid)
                                            var pushUsers = new Array();
                                            console.log(doctorM);
                                            console.log(userM);
                                            if(doctorM)
                                            {
                                                pushUsers.push({
                                                    uid:doctorUid,
                                                    sid:doctorM['sid']
                                                })
                                            }
                                            if(userM)
                                            {
                                                pushUsers.push({
                                                    uid:userUid,
                                                    sid:userM['sid']
                                                });
                                            }
                                            var params = {
                                                order_id:order.order_id
                                            }
                                            channelService.pushMessageByUids("onOrderFinished",params, pushUsers, function ( err, users)
                                            {
                                                if(err) log.error(err.stack);
                                                if(users) log.error(users.toString());
                                            });
                                            next( null, 'ok');
                                        }
                                        else
                                        {
                                            console.log( user, user.phone_number, doctor, doctor.uid)
                                            next( null, 'error');
                                        }


                                    }
                                }
                                catch (e)
                                {
                                    log.error(e.stack);
                                    utils.sendMail(e.message, e.stack);
                                    next( null, e);
                                }



                            }
                        );
                    }
                    else
                    {
                        next( null, 'order status = ' + order.status);
                    }


                }
                else
                {
                    next( null, 'order is null');
                }
            }
        });
    }
    else
    {
        next( null, {
            error:consts.ERROR.MISSING_PARAMS
        })
    }

}


handler.HaoyuanList = function ( msg, session, next)
{
    if( msg.hospital)
    {
        haoyuanDao.getHaoyuan(msg.hospital, function ( err, haoyuans)
        {
            if(err)
            {
                next(null,{
                    error:utils.Error(err)
                });
            }
            else
            {
                next(null,{
                    error:utils.Error(null),
                    desc:"",
                    number:haoyuans
                })
            }
        })
    }
    else
    {
        next(null,{
            error:consts.ERROR.MISSING_PARAMS
        });
    }
}
handler.HaoyuanHospitalList = function ( msg, session, next)
{

    if(msg.city)
    {
        haoyuanDao.getHaoyuanHospitalByCity(msg.city, function ( err, res)
        {
            if(err)
            {
                next(null,{
                    error:utils.Error(err)
                });
            }
            else
            {
                next(null,{
                    error:utils.Error(null),
                    hospitals:res
                })
            }

        });
    }
    else
    {
        next(null,{
            error:consts.ERROR.MISSING_PARAMS
        });
    }
}
handler.HaoyuanInit = function ( msg, session, next)
{

    async.parallel([
        function( callbadk)
        {
            haoyuanDao.getHaoyuanSubject(function( err, res)
            {
                callbadk(err, res);
            })
        },
        function( callbadk)
        {
            haoyuanDao.getHaoyuanType(function( err, res)
            {
                callbadk(err, res);
            })
        }
    ],
        function( error, result)
        {

            if(error)
            {
                next( null, {
                    error:utils.Error(error)
                });
            }
            else
            {
                next( null, {
                    error:utils.Error(null),
                    subjects:result[0],
                    types:result[1]
                })
            }
        }
    );
}

handler.Recharge = function ( msg, session, next)
{
    var self = this;
    var uid = "";
    var userType = "";
    if( session.uid)
    {
        var arr = session.uid.split('*');
        uid = arr[0];
        userType =  arr[1];
    }

    if( uid && userType && userType == consts.USER.User)
    {
        var money = msg.money;
        if(money)
        {
            userDao.addMoney(uid, money, function (err, res)
            {
                console.log(err, res);
                next(null, {
                        error:utils.Error(err)
                    });
            });
        }
        else
        {
            next( null, {
                error:consts.ERROR.MISSING_PARAMS
            })
        }
    }
    else
    {
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }
}
handler.PayOrder = function ( msg, session, next)
{
    var self = this;
    var uid = "";
    var userType = "";
    if( session.uid)
    {
        var arr = session.uid.split('*');
        uid = arr[0];
        userType =  arr[1];
    }

    var orderId = msg.order_id;
    if( uid && userType)
    {
        if( orderId)
        {
            async.parallel([
                function ( callback)
                {
                    orderDao.getOrderFindDoctorByKey(['order_id'],[orderId],function ( err, orders)
                    {
                        callback( err, orders);
                    });
                },
                function ( callback)
                {
                    userDao.getUserByMobile(uid, function ( err, user)
                    {
                        callback( err, user);
                    });
                },
                function( callback)
                {
                    priceDao.getPrices( function ( err, res)
                    {
                        callback(err,res);
                    })
                },
                function ( callback)
                {
                    departmentDao.getDepartmentsMap(function ( err, res)
                    {
                        callback( err, res);
                    });
                },
                function ( callback)
                {
                    diseaseDao.getDiseasesMap(function( err, res)
                    {
                        callback( err, res);
                    });
                }
            ],
                function( err, results)
                {
                    try
                    {
                        if( err)
                        {
                            log.error(err.stack);
                            next( null, {
                                error:utils.Error(err)
                            })
                            return;
                        }
                        var orders = results[0];
                        var user = results[1];
                        var prices = results[2];
                        var departments = results[3];
                        var diseases = results[4];
                        if( user && user.phone_number)
                        {
                            if( orders && orders.length == 1)
                            {
                                var order = orders[0];
                                var priceIndex = utils.getPriceIndex(prices,order.price);
                                console.log(priceIndex,prices[priceIndex]);
                                if( order.status == consts.ORDER_STATUS.DidNotPay)
                                {
                                    if( user.money >= order.price)
                                    {
                                        doctorDao.getOnlineDoctors(order.subject, order.illness, priceIndex, function ( err, res)
                                        {
                                            try
                                            {
                                                console.log('online Doctors',res);
                                                if(!err && res && res.length > 0)
                                                {
                                                    log.info('~~~');
                                                    var doctors = res;
                                                    user.money = user.money - order.price;
                                                    var params = ['money'];
                                                    var args = [user.money];
                                                    log.info('~~~');
                                                    console.log(user.phone_numbers,order.user_contact,params,args);
                                                    if( !utils.ArrayIsContains(user.phone_numbers,order.user_contact))
                                                    {
                                                        log.info('~~');
                                                        user.phone_numbers.push(order.user_contact);
                                                        params.push('phone_numbers');
                                                        args.push(user.phone_numbers.toString());
                                                    }
                                                    log.info('~~~');
                                                    userDao.setUser('phone_number',user.phone_number,params,args,function(err,res)
                                                    {
                                                        if(!err)//扣费成功
                                                        {
                                                            try
                                                            {
                                                                log.debug(JSON.stringify(res));
                                                                order.user_uid = session.uid;
                                                                order.user_sid = session.frontendId;
                                                                order.status = consts.ORDER_STATUS.NotAccept;
                                                                console.log(order.illness);
                                                                console.log(diseases);
                                                                console.log(diseases[order.illness]);
                                                                order.subject = departments[order.subject].name;
                                                                order.illness = diseases[order.illness].name;
                                                                log.debug(JSON.stringify(order));

                                                                var order_Doctor = pomelo.app.get(consts.ORDER_TYPE.OrderDoctor);   //TODO 各服务器同步
                                                                order_Doctor[order.order_id] = order;
                                                                orderDao.setOrderFindDoctor('order_id',order.order_id,['status','department','disease'],
                                                                    [order.status,order.subject,order.illness],function (err, res)
                                                                {
                                                                    if(err) log.error(err.stack);
                                                                    if( res) log.error(res);
                                                                });


                                                                var channelService = pomelo.app.get('channelService');
                                                                var params = {
                                                                    order_id:order.order_id,
                                                                    subject:order.subject,
                                                                    illness:order.illness,
                                                                    illness_desc:order.illness_desc,
                                                                    category:consts.TYPE_NAME[order.category],
                                                                    price:order.price,
                                                                    patient_name:user.name,
                                                                    ctime: utils.DateFormat(new Date()),
                                                                    status:order.status
                                                                }
                                                                channelService.pushMessageByUids(consts.PushMessage.findDoctorOrderGenerate,
                                                                    params,
                                                                    doctors,
                                                                    function(err, res)
                                                                    {
                                                                        if(!err)
                                                                        {
                                                                            if( res && res.length > 0)
                                                                            {
                                                                                log.debug(res.toString());
                                                                            }
                                                                        }
                                                                        else
                                                                        {
                                                                            log.error(err.message,err.stack);
                                                                        }
                                                                    });
                                                                next( null, {
                                                                    error:utils.Error(null),
                                                                    balance:user.money
                                                                })
                                                            }
                                                            catch (e)
                                                            {
                                                                log.error(e.stack);
                                                                utils.sendMail(e.message, e.stack);
                                                                next( null, {
                                                                    error:utils.Error(e)
                                                                });
                                                            }

                                                        }
                                                        else
                                                        {


                                                            log.error(err.stack ? err.stack : err.message);
                                                            next( null, {
                                                                error:utils.Error(err)
                                                            })
                                                        }
                                                    });


                                                }
                                                else
                                                {
                                                    next( null, {
                                                        error:consts.ERROR.NO_DOCTOR_ONLINE
                                                    })
                                                }
                                            }
                                            catch (e)
                                            {
                                                log.error(e.stack);
                                                utils.sendMail(e.message, e.stack);
                                                next( null, {
                                                    error:utils.Error(e)
                                                });
                                            }

                                        });
                                    }
                                    else
                                    {
                                        next( null, {
                                            error:consts.ERROR.MONEY_NOT_ENOUGH
                                        })
                                    }

                                }
                                else
                                {
                                    //状态不对 或已支付
                                    next( null, {
                                        error:consts.ERROR.ORDER_CANT_PAY
                                    })
                                }
                            }
                            else
                            {
                                next( null, {
                                    error:consts.ERROR.ORDER_NULL
                                })
                            }
                        }
                        else
                        {
                            next( null, {
                                error:consts.ERROR.USER_NOT_LOGIN
                            })
                        }

                    }catch (e)
                    {
                        log.error(e.stack);
                        utils.sendMail(e.message, e.stack);
                        next( null, {
                            error:utils.Error(e)
                        })
                    }
                }
            );

        }
        else
        {
            next( null, {
                error:consts.ERROR.MISSING_PARAMS
            })
        }

    }
    else
    {
        next( null, {
            error:consts.ERROR.USER_NOT_LOGIN
        })
    }

}
handler.ServiceOrderFindDoctor = function ( msg, session, next)
{
    var self = this;

    var subject = msg.subject;
    var price = msg.price;
    var category = msg.category;
    var illness = msg.illness;
    var phone_number = msg.phone_number;
    var service = msg.service;
    var disease_desc = msg.illness_desc;
    var user = msg.user;
    if( !subject || !price || !phone_number || !service || !user)
    {
        log.error('null');
        next( null, {
            error:consts.ERROR.MISSING_PARAMS
        })
        return;
    }

    serviceDao.check(service, function (err, res)
    {
        console.log(err, res);
        if(!err)
        {
            async.parallel([
                function( callback)//查找用户
                {
                    userDao.getUserByMobile(user, function ( err, res)
                    {
                        console.log(err,res);
                        callback( err, res);
                    })
                },
                function( callback)
                {
                    priceDao.getPrices( function ( err, res)
                    {
                        console.log(err,res);
                        callback(err,res);
                    })
                }

            ],
                function( err, result)
                {
                    console.log(err,result);
                    try
                    {
                        if( err)
                        {
                            log.error(err.stack);
                            next( null, {
                                error:utils.Error(err)
                            })
                            return;
                        }
                        var user = result[0];
                        var prices = result[1];

                        if(user &&  user.phone_number)
                        {
                            //生成订单
                            var order = new OrderFindDoctor;
                            order.user_id = user.id;
                            order.user_name = user.name;
                            order.category = category;
                            order.user_contact = phone_number;
                            order.disease = illness;
                            order.disease_desc = disease_desc;
                            order.price = prices[price].price;
                            order.department = subject;
                            order.status = consts.ORDER_STATUS.DidNotPay;
                            order.order_id = utils.DateFormat( new Date(), "yyyyMMddhhmmss") + user.id;

                            log.debug(order.doctors);
                            orderDao.addOrderFindDoctor(order, function(err, res)   //add order to db
                            {
                                try
                                {
                                    if( !err)
                                    {
                                        next( null, {
                                            error:utils.Error(null)
                                        })
                                    }
                                    else
                                    {
                                        log.error(err.stack ? err.stack : err.message);
                                        next( null, {
                                            error:utils.Error(err)
                                        })
                                    }
                                }
                                catch (e)
                                {
                                    log.error(e.stack);
                                    utils.sendMail(e.message, e.stack);
                                    next( null, {
                                        error:utils.Error(e)
                                    })
                                }
                            });



                        }
                        else
                        {

                            next( null, {
                                error:consts.ERROR.USER_NOT_REGISTER
                            })
                        }
                    }
                    catch (e)
                    {
                        log.error(e.stack);
                        utils.sendMail(e.message, e.stack);
                        next( null, {
                            error:utils.Error(e)
                        })
                    }

                }
            );
        }
        else
        {
            next( null, {
                error:utils.Error(err)
            })
        }
    });

}
handler.ServiceOrderRegistration = function ( msg, session, next)
{
    var self = this;
    var client = msg.user;
    var service = msg.service;

    var subject = msg.subject;
    var hospital = msg.hospital;
    var category = msg.category;
    var city = msg.city;
    var type = msg.type;
    var need_time = msg.need_time;
    var patient = msg.patient;
    console.log(subject,client,hospital,service,type,need_time,patient)

    if( !subject || !client || !hospital || !service ||
        !type || !need_time || !patient)
    {
        log.error('null');
        next( null, {
            error:consts.ERROR.MISSING_PARAMS
        })
        return;
    }

    serviceDao.check(service, function (err, res)
    {
        console.log(err, res);
        if(!err)
        {
            async.parallel([
                function(callback)
                {
                    userDao.getUserByMobile(client, function ( err, res)
                    {
                        callback( err, res);
                    })
                },
                function ( callback)
                {
                    workerDao.getOnlineWorkers( city, function ( err, res)
                    {
                        callback( err, res);
                    });
                },
                function ( callback)
                {
                    departmentDao.getDepartmentsMap(function ( err, res)
                    {
                        callback( err, res);
                    });
                },
                function ( callback)
                {
                    hospitalDao.getHospitalsMap( function ( err, res)
                    {
                        callback( err, res);
                    });
                }
            ],
                function (err, result){
                    try
                    {
                        if( err)
                        {
                            log.error(err.stack ? err.stack : err.message);
                            next( null, {
                                error:utils.Error(err)
                            })
                            return;
                        }
                        else
                        {
                            var user = result[0];
                            var workers = result[1];
                            var departments = result[2];
                            var hospitals = result[3];
                            subject = departments[subject].name;
                            category = consts.TYPE_NAME[category];
                            hospital = hospitals[hospital].name;
                            if(user &&  user.phone_number)
                            {
                                if( workers && workers.length > 0)
                                {
                                    //下单
                                    var order = new OrderRegistration;
                                    order.order_id = utils.DateFormat( new Date(), "yyyyMMddhhmmss") + user.id;
                                    order.user_id = user.id;
                                    order.user_contact = patient.contact;
                                    order.type = type;
                                    order.category = category;
                                    order.hospital = hospital;
                                    order.city = city;
                                    order.department = subject;
                                    order.need_medical_record = patient.need_medical_record;
                                    order.have_health_insurance = patient.have_health_insurance;
                                    order.name = patient.name;
                                    order.sex = patient.sex;
                                    order.id_card = patient.id_card;
                                    order.need_time = need_time;
                                    order.birthday = patient.birthday;
                                    order.status = consts.Registration_ORDER_STATUS.NotDispose;
                                    console.log(order);
                                    orderDao.addOrderRegistration(order, function( err, res)
                                    {
                                        try
                                        {
                                            if( !err)
                                            {
                                                order.user_uid = client + "*" + consts.USER.User;
                                                var channelService = self.app.get('channelService');
                                                var channel = channelService.getChannel(consts.USER.User,false);
                                                var userM = null;
                                                if(channel)
                                                {
                                                    var userM = channel.getMember(order.user_uid);
                                                }

                                                if(userM)
                                                {
                                                    order.user_sid = userM['sid'];
                                                }
                                                else
                                                {
                                                    order.user_sid = session.frontendId;
                                                }

                                                var order_Worker = pomelo.app.get(consts.ORDER_TYPE.OrderWork);   //TODO 各服务器同步
                                                order_Worker[order.order_id] = workers;
                                                order_Worker['order'+order.order_id] = order;

                                                order_Worker['schedule' + order.order_id] = schedule.scheduleJob({
                                                    start:Date.now(),
                                                    period:consts.LAO_WU_ORDER_TIME    //1分钟
                                                },pushRegistration,order);

                                                next( null, {
                                                    error:utils.Error(null)
                                                })
                                            }
                                            else
                                            {
                                                log.error(err.stack ? err.stack : err.message);
                                                next( null, {
                                                    error:utils.Error(err)
                                                })
                                            }
                                        }
                                        catch (e)
                                        {
                                            log.error(e.stack);
                                            utils.sendMail(e.message, e.stack);
                                            next( null, {
                                                error:utils.Error(e)
                                            })
                                        }
                                    });

                                }
                                else
                                {
                                    next( null, {
                                        error:consts.ERROR.NO_WORKER_ONLINE
                                    });
                                }
                            }
                            else
                            {
                                next( null, {
                                    error:consts.ERROR.USER_NOT_LOGIN
                                });
                            }

                        }
                    }
                    catch ( e)
                    {
                        log.error(e.stack);
                        utils.sendMail(e.message, e.stack);
                        next( null, {
                            error:utils.Error(e)
                        })
                    }
                }
            );
        }
        else
        {
            next( null, {
                error:utils.Error(err)
            })
        }

    });
}
