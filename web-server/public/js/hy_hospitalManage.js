/**
 * Created by chenpeng on 14-2-27.
 */
//1.创建受捐单位数组
var cityData = [];
//1-1.根据受捐单位id，返回受捐单位元素,动态绑定(定义)方法
cityData.getTypeById = function (id) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].id == id) {
            return this[i];
        };
    };
};
//2.详细捐赠信息数组
var hospitalData = [];
//2.1.根据id删除数组元素
hospitalData.deleteById = function (id) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].id == id) {
            //元素前移
            for (var j = i; j < this.length - 1; j++) {
                this[j] = this[j + 1];
            };
            //数组长度--
            this.length--;
            break;
        };
    };
};
//2-2.更新数据，model-修改后的对象
hospitalData.update = function (model) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].id == model.id) {
            this[i] = model;
            break;
        };
    };
};
//2-4.根据捐赠单位id返回数组
hospitalData.getSearchData = function (id) {
    if(id==-1){//id为-1返回所有数据
        return this;
    };
    //定义存储查询数据的数组
    var arrSearch = new Array();
    for (var i = 0; i < this.length; i++) {
        if(this[i].id==id){//判断category是否符合条件
            arrSearch[arrSearch.length]=this[i];
        };
    };
    return arrSearch;
};
//2-5.返回一页数据
if( !hospitalData.pageIndex)
{
    hospitalData.pageIndex = 1;//页码
}

hospitalData.pageCount = 5;//每页记录条数
hospitalData.pages=0;//总页数
//返回第pageIndex页数据
hospitalData.getPageData = function () {
    var pageData = new Array();//定义数组存储一页数据
    for (var i = (this.pageIndex - 1) * this.pageCount; i < this.pageIndex * this.pageCount; i++) {//获取第pageIndex页数据
        //alert(this[i]);
        if (this[i]) {//判断this[i]是否undefined,过滤掉
            pageData[pageData.length] = this[i];
        };
    }
    return pageData;
};
//3.加载受捐单位信息,element-传入select对象
function loadOrgData(element) {
    for (var i = 0; i < cityData.length; i++) {
        var opt = new Option( cityData[i].name , cityData[i].id);
        element.options.add(opt);
    };
};
//4.加载表数据（详细信息）
function loadDetailData() {

    var tbList = getElement("hospitalList");//获得表对象
    for (var i = tbList.rows.length - 1; i >= 0; i--) {//删除表所有行
        tbList.deleteRow(i);
    }
    var arrPage = hospitalData.getPageData();//获得一页数据
    loadDataToTb(arrPage);//加载显示到表
    // for (var i = 0; i < hospitalData.length; i++) {
    //     addTr(hospitalData[i]);
    // }
};
//4-1.加载表数据,arr数组数据
function loadDataToTb(arr) {
    for (var i = 0; i < arr.length; i++) {
        //console.log(JSON.stringify(arr[i]));
        addTr(arr[i]);
    };
    hospitalData.pages = hospitalData.length % hospitalData.pageCount != 0 ? (hospitalData.length - hospitalData.length % hospitalData.pageCount) / hospitalData.pageCount + 1 : hospitalData.length / hospitalData.pageCount;
    getElement('currentPage').innerHTML = hospitalData.pageIndex;
    getElement('allPage').innerHTML = hospitalData.pages;
};
//4-1.插入一行,model-数组元素
function addTr(model) {
    var tb = getElement("hospitalList");//获得表对象
    var tr = tb.insertRow(-1);//插入一行
    tr.insertCell(-1).innerHTML = '<input type="checkbox" name="hospitalId" value="' + model.id +'">'
    tr.insertCell(-1).innerHTML = model.id;//插入序号列
    tr.insertCell(-1).innerHTML = model.name;//插入名称列
    var td = tr.insertCell(-1);//插入category列
    td.setAttribute("city", model.city);//保存category到td的category属性（自定义）
    var tmp = cityData.getTypeById(model.city);
    td.innerHTML = tmp.name ;//设置捐赠单位名称
    tr.insertCell(-1).innerHTML = "<a href='#' onclick='setUpdateState(this)'><img src='/resources/images/icons/pencil.png'></a>&nbsp;&nbsp;<a href='#' onclick='deleteRow(this)'><img src='/resources/images/icons/cross.png'></a>";//操作列
};
//5.根据标签id获得标签对象
function getElement(id) {
    return document.getElementById(id);
};
//6.删除行,element-当前点击de
function deleteRow(element) {
    if (GlobalUpdateTr != null) {//判断当前是否修改状态
        rollBack(GlobalUpdateTr);
    };
    if (!confirm("确定删除吗？")) {//确认是否要移除
        return;
    };

    var delTr = element.parentNode.parentNode;//获取删除行
    $.post('/hyHospital_DEL',{id:delTr.childNodes[1].innerHTML}, function (data)
    {
        console.log(data);
        if(data)
        {
            hospitalData.deleteById(delTr.childNodes[1].innerHTML);//删除对应的数组元素
            hospitalData.pages = hospitalData.length % hospitalData.pageCount != 0 ? (hospitalData.length - hospitalData.length % hospitalData.pageCount) / hospitalData.pageCount + 1 : hospitalData.length / hospitalData.pageCount;
            if( hospitalData.pageIndex > hospitalData.pages)
            {
                hospitalData.pageIndex = hospitalData.pages;
            }
            loadDetailData();
        }
    });

};
//7.修改行
//7-1.定义全局变量,三个文本框一个下拉列表，一个存储修改行的变量GlobalUpdateTr，标记修改状态
var inputHospitalName = document.createElement("input");//捐赠人名称
inputHospitalName.type = "text";
var selectCity = document.createElement("select");//受捐单位下拉列表
var GlobalUpdateTr = null;//存储修改行，标记是否修改状态
//7.2.设置当前行，为修改状态,obj-当前点击对象
function setUpdateState(element) {
    if (GlobalUpdateTr != null) {//判断是否已经在修改状态
        rollBack(GlobalUpdateTr);//还原
    };
    GlobalUpdateTr = element.parentNode.parentNode;//获得当前修改行
    txtToInput(GlobalUpdateTr.childNodes[2], inputHospitalName);
    txtToSelect(GlobalUpdateTr.childNodes[3], selectCity);
    GlobalUpdateTr.childNodes[4].innerHTML = "<a href='#'  class='button' onclick='update(this)'>确定</a>&nbsp;&nbsp;<a href='#' class='button' onclick='exitUpdateState(this)'>取消</a>";//设置操作列
};
//7-2-1.当前行设置为修改状态（文本设为文本框）(td:列，element:文本框)
function txtToInput(td,element) {
    element.value = td.innerHTML;//设置obj的值
    td.setAttribute("oldValue",td.innerHTML);//保存td的文本值，取消修改时要取的值
    td.appendChild(element);//往列td添加obj
    if (td.childNodes[1]) {//判断是否有文本节点
        td.removeChild(td.childNodes[0]);//移除td的文本节点
    };
};
//7-2-2.当前行设置为修改状态（文本设为下拉列）(td:列，element:下拉列)
function txtToSelect(td, element) {
    td.appendChild(element);
    td.removeChild(td.childNodes[0]);
    element.value = td.getAttribute("city");
};
//7-3.取消修改，恢复界面，退出修改操作状态,element-当前点击对象
function exitUpdateState(element) {
    var cancelTr = element.parentNode.parentNode;//取得当前行
    rollBack(cancelTr);
    //退出修改状态
    GlobalUpdateTr = null;
};
//还原,obj-当前修改行/之前的修改行
function rollBack(element) {
    element.childNodes[2].innerHTML = element.childNodes[2].getAttribute("oldValue");//恢复原来的文本值(名称)
    element.childNodes[3].removeChild(selectCity);//移除下拉列
    var city_id = element.childNodes[3].getAttribute("city");//取得捐赠单位id
    var cityTmp = cityData.getTypeById(city_id);
    element.childNodes[3].innerHTML = cityTmp.name ;//恢复原来的文本值（捐赠单位）
    element.childNodes[4].innerHTML = "<a href='#' onclick='setUpdateState(this)'><img src='/resources/images/icons/pencil.png'></a>&nbsp;&nbsp;<a href='#' onclick='deleteRow(this)'><img src='/resources/images/icons/cross.png'></a>";//恢复操作列
};
//7-4.确定修改，更新界面，更新数据，修改完毕退出修改状态,element-当前点击对象
function update(element) {
    var updateTr = element.parentNode.parentNode;//取得当前行
    var id = updateTr.childNodes[1].innerHTML;
    var name = inputHospitalName.value;
    var city = selectCity.value;
    $.post('/hyHospital_ALTER',{
        id:id,
        name:name,
        department_id:city
    },function ( data)
    {
        if( data)
        {
            //更新界面
            updateTr.childNodes[2].innerHTML = inputHospitalName.value;
            updateTr.childNodes[3].removeChild(selectCity);
            var cityTmp = cityData.getTypeById(selectCity.value);
            updateTr.childNodes[3].innerHTML = cityTmp.name;
            updateTr.childNodes[3].setAttribute("city", selectCity.value);//更新category
            updateTr.childNodes[4].innerHTML = "<a href='#' onclick='setUpdateState(this)'><img src='/resources/images/icons/pencil.png'></a>&nbsp;&nbsp;<a href='#' onclick='deleteRow(this)'><img src='/resources/images/icons/cross.png'></a>";//恢复操作列
            //更新数据
            //下拉列表的value值就是下拉列表当前选项的value值
            var model = { "id": id, "name": name, "city": city};//创建与当前行数据对应的对象
            hospitalData.update(model);//更新数组
            //退出修改状态
            GlobalUpdateTr = null;
        }

    });


};

function checkAllCheck()
{
    var checkBoxs= getElement("hospitalId");
    for (var i = 0; i < checkBoxs.length; i ++)
    {
        if( !checkBoxs[i].checked)
        {
            return false;
        }
    }
    return true;
}

function del_all ()
{
    var ids = "";
    $('input[name="hospitalId"]:checked').each( function (){
        ids += $(this).val() + ',';
    })
    if(ids){
        ids = ids.slice(0,-1);
    }
    alert(ids);
}

//-------窗口加载完毕触发--------//
window.onload = function () {
    console.log("init");
    console.log(hospitalData.length);

    loadOrgData(getElement("sel_city"));
    loadOrgData(selectCity);

    //citysDate = cityData;
    //2.加载cityData（to表）
    loadDetailData();
    //3.新增
    getElement("btnAdd").onclick = function () {
        var sel_city = getElement("sel_city").value;
        var hospitalName = getElement("hospitalName").value;
        $.post('/hyHospital_ADD',{
            name:hospitalName,
            department_id:sel_city
        },function ( data)
        {
            console.log(data);
            data = eval('(' + data + ')');
            hospitalData.push(data);//返回新增的元素
            hospitalData.pages= hospitalData.length % hospitalData.pageCount != 0 ? (hospitalData.length - hospitalData.length % hospitalData.pageCount) / hospitalData.pageCount + 1 : hospitalData.length / hospitalData.pageCount;
            hospitalData.pageIndex = hospitalData.pages;
            loadDetailData();
        });

    };
//    //4.查询（先删除当前界面所有行，再添加）
//    getElement("btnSearch").onclick = function () {
//        var tbList = getElement("tbList");//获得表
//        for (var i = tbList.rows.length - 1; i >= 1; i--) {//遍历删除表的行，从末端开始
//            tbList.deleteRow(i);//删除一行
//        }
//        var searchId = getElement("selSearchOrg").value;//要查询的捐赠单位id
//        var arrSearchData = hospitalData.getSearchData(searchId);//得到查询数据
//        loadDataToTb(arrSearchData);//(加载)显示查询数据
//    };
    //5.分页（先删除当前界面所有行，再添加）
    getElement("btnFirstPage").onclick = function (){
        if(hospitalData.pageIndex !== 1){
            hospitalData.pageIndex = 1;//页码++,取得下一页
            loadDetailData();
        }

    };
    getElement("btnLastPage").onclick = function (){
        hospitalData.pages = hospitalData.length % hospitalData.pageCount != 0 ? (hospitalData.length - hospitalData.length % hospitalData.pageCount) / hospitalData.pageCount + 1 : hospitalData.length / hospitalData.pageCount;
        if(hospitalData.pages !== hospitalData.pageIndex)
        {
            hospitalData.pageIndex = hospitalData.pages;//页码++,取得下一页
            loadDetailData();
        }

    };
    //5-1.下一页
    getElement("btnNextPage").onclick = function () {
        if (hospitalData.length == 0) {
            alert("没有数据");
        };
        //获取总页数
        hospitalData.pages = hospitalData.length % hospitalData.pageCount != 0 ? (hospitalData.length - hospitalData.length % hospitalData.pageCount) / hospitalData.pageCount + 1 : hospitalData.length / hospitalData.pageCount;
        if (hospitalData.pageIndex == hospitalData.pages) {//判断是否最后一页
            alert("最后一页啦");
            return;//返回
        };

        hospitalData.pageIndex++;//页码++,取得下一页
        loadDetailData();
    };
    //5-2.上一页
    getElement("btnPrevPage").onclick = function () {
        if (hospitalData.length == 0) {
            alert("没有数据");
        };
        //获取总页数
        hospitalData.pages = hospitalData.length % hospitalData.pageCount != 0 ? (hospitalData.length - hospitalData.length % hospitalData.pageCount) / hospitalData.pageCount + 1 : hospitalData.length / hospitalData.pageCount;
        if(hospitalData.pageIndex==1){//判断是否第一页
            alert("这个第一页");
            return;
        };

        hospitalData.pageIndex--;//页码--，取得上一页
        loadDetailData();
    };
};