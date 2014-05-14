/**
 * Created by cp on 1/14/14.
 */
var pomelo = window.pomelo;
var host = "42.121.106.17";//
var port = "3010";
var user = '';
var client = '';
var regBox = {
    regEmail : /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,//邮箱
    regName : /^[a-z0-9_-]{3,16}$/,//用户名
    regMobile : /^0?1[3|4|5|8][0-9]\d{8}$/,//手机
    regTel : /^0[\d]{2,3}-[\d]{7,8}$/
}
function post(URL, PARAMS) {
    var temp = document.createElement("form");
    temp.action = URL;
    temp.method = "post";
    temp.style.display = "none";
    for (var x in PARAMS) {
        var opt = document.createElement("textarea");
        opt.name = x;
        opt.value = PARAMS[x];
        temp.appendChild(opt);
    }
    document.body.appendChild(temp);
    temp.submit();
    return temp;
}

//调用方法 如
//post('pages/statisticsJsp/excel.action', {html :prnhtml,cm1:'sdsddsd',cm2:'haha'});
function login()
{
    var username = $("#username").val();
    var password = $("#password").val();
    post("", {username:username,password:password});
}
function logout()
{
   post("/",{logout:1});
}
//when first time into.
$(document).ready(function() {
    console.log(user,client);
});

var views = ['findDoctor','guahao','notifyDoctor','notifyGuaHao'];
function show(id)
{

    for(var i = 0; i< views.length; i++)
    {
        console.log(views[i],document.getElementById(views[i]).getAttribute('style'));
        if( id !=  views[i]){
            document.getElementById(views[i]).setAttribute('style','display:none;');
        }
    }

    $('#' + id).fadeTo(400, 1, function ()
    {
        $('#' + id).slideDown(400);
    });
}

//function hiden()
//{
//    console.log('notify',document.getElementById('notify').getAttribute('style'),document.getElementById('notify').className);
//    $('#notify').fadeTo(400, 1, function ()
//    {
//        $('#notify').slideDown(400);
//    });
//
//}

function orderFindDoctor()
{

    var contact = $('#contact_Doctor').val();
    var sel_category = $('#sel_category').val();
    var sel_subject = $('#sel_subject').val();
    var sel_illness = $('#sel_illness').val();
    var sel_price = $('#sel_price').val();
    var illness_desc = $('#illness_desc').val();
    console.log(contact,sel_category,sel_subject,sel_illness,sel_price,illness_desc);
    if( contact && sel_category >= 0 && sel_category <= 1 && sel_illness >= 0 && sel_price && sel_subject && illness_desc)
    {
        if( !regBox.regMobile.exec(contact) && !regBox.regTel.exec(contact))
        {
            //error
        }
        pomelo.init({
            host: host,
            port: port,
            log: true
        }, function() {
            var args = {
                subject:sel_subject,
                category:sel_category,
                illness:sel_illness,
                price:sel_price,
                phone_number:contact,
                illness_desc:illness_desc,
                service:user,
                user:client
            }
            pomelo.request("chat.chatHandler.ServiceOrderFindDoctor", args, function(data) {

                console.log(data);
                if(data.error.code == 0)
                {
                    document.getElementById('notifyDoctor').className = 'notification success png_bg';
                    document.getElementById('notifyMessageDoctor').innerHTML = '下单成功！';
                    $('#notifyDoctor').fadeTo(400, 1, function ()
                    {
                        $('#notifyDoctor').slideDown(400);
                    });


                }else
                {
                    document.getElementById('notifyDoctor').className = 'notification error png_bg';
                    document.getElementById('notifyMessageDoctor').innerHTML = '下单失败！' + data.error.message;
                    $('#notifyDoctor').fadeTo(400, 1, function ()
                    {
                        $('#notifyDoctor').slideDown(400);
                    });
                }
                pomelo.disconnect();

            });
        });
    }else{
        alert('请填写完整！');
    }
}

function ServiceOrderRegistration()
{
    var need_time = $('#need_time').val();
    var sel_city =  $('#sel_city').val();
    var sel_subject1 = $('#sel_subject1').val();
    var sel_hospital = $('#sel_hospital').val();
    var sel_type = $('#sel_type').val();

    var patient_name = $('#patient_name').val();
    var patient_sex = 1;
    var sexRadios = document.getElementById('patient_sex');
    for( var i =0 ; i < sexRadios.length; i++)
    {
        if(sexRadios[i].checked)
        {
            patient_sex = sexRadios[i].value;
            break;
        }
    }
    var patient_birthday = $('#patient_birthday').val();
    var patient_contact = $('#patient_contact').val();
    var patient_idCard = $('#patient_idCard').val();

    var need_medical_record = document.getElementById('need_medical_record').checked;
    var have_health_insurance = document.getElementById('have_health_insurance').checked;

    if( need_time && sel_city && sel_hospital && sel_subject1 && sel_type && patient_birthday && patient_contact &&
        patient_idCard && patient_name && patient_sex)
    {
        if( !regBox.regMobile.exec(patient_contact) && !regBox.regTel.exec(patient_contact))
        {
            //error
        }

        pomelo.init({
            host: host,
            port: port,
            log: true
        }, function() {
            var args = {
                subject:sel_subject1,
                category:0,
                hospital:sel_hospital,
                city:sel_city,
                type:sel_type,
                need_time:need_time,
                service:user,
                user:client,
                patient:{
                    name:patient_name,
                    sex:patient_sex,
                    birthday:patient_birthday,
                    id_card:patient_idCard,
                    contact:patient_contact,
                    need_medical_record:need_medical_record,
                    have_health_insurance:have_health_insurance
                }
            }
            pomelo.request("chat.chatHandler.ServiceOrderRegistration", args, function(data) {

                console.log(data);
                if(data.error.code == 0)
                {
                    document.getElementById('notifyGuaHao').className = 'notification success png_bg';
                    document.getElementById('notifyMessageGuaHao').innerHTML = '下单成功！';
                    $('#notifyGuaHao').fadeTo(400, 1, function ()
                    {
                        $('#notifyGuaHao').slideDown(400);
                    });


                }else
                {
                    document.getElementById('notifyGuaHao').className = 'notification error png_bg';
                    document.getElementById('notifyMessageGuaHao').innerHTML = '下单失败！' + data.error.message;
                    $('#notifyGuaHao').fadeTo(400, 1, function ()
                    {
                        $('#notifyGuaHao').slideDown(400);
                    });
                }
                pomelo.disconnect();

            });
        });
    }

}

function changeUser()
{

}
function closeService(flag)
{

    var type = 0;
    var typeRadios = document.getElementById('radiotype');
    for( var i =0 ; i < typeRadios.length; i++)
    {
        if(typeRadios[i].checked)
        {
            type = typeRadios[i].value;
            break;
        }
    }

    if(flag)
    {
        console.log('true',flag);
        post('/closeService',{type:type});
    }
    else
    {
        console.log('false',flag);
        post('/closeService',{});
    }

}