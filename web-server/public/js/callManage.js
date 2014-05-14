/**
 * Created by chenpeng on 14-3-20.
 */

var myPhoneNUmber = "";
//2.详细捐赠信息数组
var callData = [];
//2.1.根据id删除数组元素

//2-4.根据捐赠单位id返回数组
callData.getSearchData = function () {
    if(id==-1){//id为-1返回所有数据
        return this;
    };
    //定义存储查询数据的数组
    var arrSearch = [];
    for (var i = 0; i < this.length; i++) {
        if(this[i].fromphone == 'myPhoneNUmber'){//判断category是否符合条件
            arrSearch[arrSearch.length]=this[i];
        };
    };
    return arrSearch;
};
//2-5.返回一页数据
if( !callData.pageIndex)
{
    callData.pageIndex = 1;//页码
}

callData.pageCount = 5;//每页记录条数
callData.pages=0;//总页数
//返回第pageIndex页数据
callData.getPageData = function () {
    var pageData = new Array();//定义数组存储一页数据
    for (var i = (this.pageIndex - 1) * this.pageCount; i < this.pageIndex * this.pageCount; i++) {//获取第pageIndex页数据
        //alert(this[i]);
        if (this[i]) {//判断this[i]是否undefined,过滤掉
            pageData[pageData.length] = this[i];
        };
    }
    return pageData;
};

//4.加载表数据（详细信息）
function loadDetailData() {

    var tbList = getElement("callList");//获得表对象
    for (var i = tbList.rows.length - 1; i >= 0; i--) {//删除表所有行
        tbList.deleteRow(i);
    }
    var arrPage = callData.getPageData();//获得一页数据
    loadDataToTb(arrPage);
};
//4-1.加载表数据,arr数组数据
function loadDataToTb(arr) {
    for (var i = 0; i < arr.length; i++) {
        //console.log(JSON.stringify(arr[i]));
        addTr(arr[i]);
    };
    callData.pages = callData.length % callData.pageCount != 0 ? (callData.length - callData.length % callData.pageCount) / callData.pageCount + 1 : callData.length / callData.pageCount;
    getElement('currentPage').innerHTML = callData.pageIndex;
    getElement('allPage').innerHTML = callData.pages;
    if( !arr || arr.length == 0)
    {
        addTr();
    }
};
//4-1.插入一行,model-数组元素
function addTr(model) {
    var tb = getElement("callList");//获得表对象
    var tr = tb.insertRow(-1);//插入一行
    if( model)
    {
        tr.insertCell(-1).innerHTML = "<a href='findDoctorOrderById" + model.order_id + "' >" + model.order_id +"</a>"
        tr.insertCell(-1).innerHTML = model.fromphone;//插入序号列
        tr.insertCell(-1).innerHTML = model.calltime;//插入名称列
        tr.insertCell(-1).innerHTML = model.torealphone;//插入名称列
        tr.insertCell(-1).innerHTML = model.talktime;//插入名称列
        tr.insertCell(-1).innerHTML = model.hung;//插入名称列
        tr.insertCell(-1).innerHTML = model.exptime;//插入名称列
    }
    else
    {
        var td = tr.insertCell(-1);
        td.setAttribute('colspan','8');
        if(myPhoneNUmber){
            td.innerHTML = "没有数据！";
        }else
        {
            td.innerHTML = "没有数据，请输入要查询的手机号！";
        }

    }

};
//5.根据标签id获得标签对象
function getElement(id) {
    return document.getElementById(id);
};

function getList()
{
    myPhoneNUmber = $("#phoneNumber").val();
    if( !myPhoneNUmber) alert('请输入手机号');
    $.post('/getCallList',{phone_number:myPhoneNUmber}, function ( data)
    {
        if(data)
        {
            if( typeof  data == 'string')
            {
                data = eval('(' + data+')');
            }
            for( var i = 0; i < data.length ; i++)
            {
                callData.push(data[i]);
            }
            loadDetailData();
        }
    });
}
//-------窗口加载完毕触发--------//
window.onload = function () {

    loadDetailData();
//    //4.查询（先删除当前界面所有行，再添加）
//    getElement("btnSearch").onclick = function () {
//        var tbList = getElement("tbList");//获得表
//        for (var i = tbList.rows.length - 1; i >= 1; i--) {//遍历删除表的行，从末端开始
//            tbList.deleteRow(i);//删除一行
//        }
//        var searchId = getElement("selSearchOrg").value;//要查询的捐赠单位id
//        var arrSearchData = callData.getSearchData(searchId);//得到查询数据
//        loadDataToTb(arrSearchData);//(加载)显示查询数据
//    };
    //5.分页（先删除当前界面所有行，再添加）
    getElement("btnFirstPage").onclick = function (){
        if(callData.pageIndex !== 1){
            callData.pageIndex = 1;//页码++,取得下一页
            loadDetailData();
        }

    };
    getElement("btnLastPage").onclick = function (){
        callData.pages = callData.length % callData.pageCount != 0 ? (callData.length - callData.length % callData.pageCount) / callData.pageCount + 1 : callData.length / callData.pageCount;
        if(callData.pages !== callData.pageIndex)
        {
            callData.pageIndex = callData.pages;//页码++,取得下一页
            loadDetailData();
        }

    };
    //5-1.下一页
    getElement("btnNextPage").onclick = function () {
        if (callData.length == 0) {
            alert("没有数据");
        };
        //获取总页数
        callData.pages = callData.length % callData.pageCount != 0 ? (callData.length - callData.length % callData.pageCount) / callData.pageCount + 1 : callData.length / callData.pageCount;
        if (callData.pageIndex == callData.pages) {//判断是否最后一页
            alert("最后一页啦");
            return;//返回
        };

        callData.pageIndex++;//页码++,取得下一页
        loadDetailData();
    };
    //5-2.上一页
    getElement("btnPrevPage").onclick = function () {
        if (callData.length == 0) {
            alert("没有数据");
        };
        //获取总页数
        callData.pages = callData.length % callData.pageCount != 0 ? (callData.length - callData.length % callData.pageCount) / callData.pageCount + 1 : callData.length / callData.pageCount;
        if(callData.pageIndex==1){//判断是否第一页
            alert("这个第一页");
            return;
        };

        callData.pageIndex--;//页码--，取得上一页
        loadDetailData();
    };
};