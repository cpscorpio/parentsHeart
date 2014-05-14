var regBox = {
    regEmail : /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,//邮箱
    regName : /^[a-z0-9_-]{3,16}$/,//用户名
    regMobile : /^0?1[3|4|5|8][0-9]\d{8}$/,//手机
    regTel : /^0[\d]{2,3}-[\d]{7,8}$/
}
var s ='1868495901';
if (!regBox.regMobile.exec(s) &&  !regBox.regTel.exec(s)){
    console.log('5');
} else
{
    console.log('0');
}