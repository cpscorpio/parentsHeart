/**
 * Created by chenpeng on 14-2-26.
 */


var jobTitles = [];
//2.1.根据id删除数组元素
jobTitles.deleteById = function (id) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].id == id) {
            //元素前移
            for (var j = i; j < this.length - 1; j++) {
                this[j] = this[j + 1];
            }
            //数组长度--
            this.length--;
            break;
        }
    }
};
//2-2.更新数据，model-修改后的对象
jobTitles.update = function (model) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].id == model.id) {
            this[i] = model;
            break;
        }
    }
};

//2-5.返回一页数据
if( !jobTitles.pageIndex)
{
    jobTitles.pageIndex = 1;//页码
}

jobTitles.pageCount = 5;//每页记录条数
jobTitles.pages=0;//总页数
//返回第pageIndex页数据
jobTitles.getPageData = function () {
    var pageData = [];
    for (var i = (this.pageIndex - 1) * this.pageCount; i < this.pageIndex * this.pageCount; i++) {//获取第pageIndex页数据
        //alert(this[i]);
        if (this[i]) {//判断this[i]是否undefined,过滤掉
            pageData[pageData.length] = this[i];
        }
    }
    return pageData;
};

//4.加载表数据（详细信息）
function loadDetailData() {

    var tbList = getElement("jobTitleList");//获得表对象
    for (var i = tbList.rows.length - 1; i >= 0; i--) {//删除表所有行
        tbList.deleteRow(i);
    }
    var arrPage = jobTitles.getPageData();//获得一页数据
    loadDataToTb(arrPage);//加载显示到表

}
//4-1.加载表数据,arr数组数据
function loadDataToTb(arr) {
    for (var i = 0; i < arr.length; i++) {
        //console.log(JSON.stringify(arr[i]));
        addTr(arr[i]);
    }
    jobTitles.pages = jobTitles.length % jobTitles.pageCount != 0 ? (jobTitles.length - jobTitles.length % jobTitles.pageCount) / jobTitles.pageCount + 1 : jobTitles.length / jobTitles.pageCount;
    getElement('currentPage').innerHTML = jobTitles.pageIndex;
    getElement('allPage').innerHTML = jobTitles.pages;
}
//4-1.插入一行,model-数组元素
function addTr(model) {
    var tb = getElement("jobTitleList");//获得表对象
    var tr = tb.insertRow(-1);//插入一行
    tr.insertCell(-1).innerHTML = '<input type="checkbox" name="jobTitleId" value="' + model.id + '"/>';
    tr.insertCell(-1).innerHTML = model.id;//插入序号列
    tr.insertCell(-1).innerHTML = model.name;//插入名称列
    tr.insertCell(-1).innerHTML = "<a href='#' onclick='setUpdateState(this)'><img src='/resources/images/icons/pencil.png'></a>&nbsp;&nbsp;<a href='#' onclick='deleteRow(this)'><img src='/resources/images/icons/cross.png'></a>";//操作列
}
//5.根据标签id获得标签对象
function getElement(id) {
    return document.getElementById(id);
}
//6.删除行,element-当前点击de
function deleteRow(element) {
    if (GlobalUpdateTr != null) {//判断当前是否修改状态
        rollBack(GlobalUpdateTr);
    }
    if (!confirm("确定删除吗？")) {//确认是否要移除
        return;
    }

    var delTr = element.parentNode.parentNode;//获取删除行
    $.post('/fJobTitle_DEL',{id:delTr.childNodes[1].innerHTML}, function (data)
    {
        console.log(data);
        if(data)
        {
            jobTitles.deleteById(delTr.childNodes[1].innerHTML);//删除对应的数组元素
            jobTitles.pages = jobTitles.length % jobTitles.pageCount != 0 ? (jobTitles.length - jobTitles.length % jobTitles.pageCount) / jobTitles.pageCount + 1 : jobTitles.length / jobTitles.pageCount;
            if( jobTitles.pageIndex > jobTitles.pages)
            {
                jobTitles.pageIndex = jobTitles.pages;
            }
            loadDetailData();
        }
    });

}
//7.修改行
//7-1.定义全局变量,三个文本框一个下拉列表，一个存储修改行的变量GlobalUpdateTr，标记修改状态
var inputJobTitleName = document.createElement("input");//捐赠人名称
inputJobTitleName.type = "text";

var GlobalUpdateTr = null;//存储修改行，标记是否修改状态
//7.2.设置当前行，为修改状态,obj-当前点击对象
function setUpdateState(element) {
    if (GlobalUpdateTr != null) {//判断是否已经在修改状态
        rollBack(GlobalUpdateTr);//还原
    }
    GlobalUpdateTr = element.parentNode.parentNode;//获得当前修改行
    txtToInput(GlobalUpdateTr.childNodes[2], inputJobTitleName);
    GlobalUpdateTr.childNodes[3].innerHTML = "<a href='#'  class='button' onclick='update(this)'>确定</a>&nbsp;&nbsp;<a href='#' class='button' onclick='exitUpdateState(this)'>取消</a>";//设置操作列
}
//7-2-1.当前行设置为修改状态（文本设为文本框）(td:列，element:文本框)
function txtToInput(td,element) {
    element.value = td.innerHTML;//设置obj的值
    td.setAttribute("oldValue",td.innerHTML);//保存td的文本值，取消修改时要取的值
    td.appendChild(element);//往列td添加obj
    if (td.childNodes[1]) {//判断是否有文本节点
        td.removeChild(td.childNodes[0]);//移除td的文本节点
    }
}

//7-3.取消修改，恢复界面，退出修改操作状态,element-当前点击对象
function exitUpdateState(element) {
    var cancelTr = element.parentNode.parentNode;//取得当前行
    rollBack(cancelTr);
    //退出修改状态
    GlobalUpdateTr = null;
}
//还原,obj-当前修改行/之前的修改行
function rollBack(element) {
    element.childNodes[2].innerHTML = element.childNodes[2].getAttribute("oldValue");//恢复原来的文本值(名称)
    element.childNodes[3].innerHTML = "<a href='#' onclick='setUpdateState(this)'><img src='/resources/images/icons/pencil.png'></a>&nbsp;&nbsp;<a href='#' onclick='deleteRow(this)'><img src='/resources/images/icons/cross.png'></a>";//恢复操作列
}
//7-4.确定修改，更新界面，更新数据，修改完毕退出修改状态,element-当前点击对象
function update(element) {
    var updateTr = element.parentNode.parentNode;//取得当前行
    var id = updateTr.childNodes[1].innerHTML;
    var name = inputJobTitleName.value;
    $.post('/fJobTitle_ALTER',{
        id:id,
        name:name
    },function ( data)
    {
        if( data)
        {
            //更新界面
            updateTr.childNodes[2].innerHTML = inputJobTitleName.value;
            updateTr.childNodes[3].innerHTML = "<a href='#' onclick='setUpdateState(this)'><img src='/resources/images/icons/pencil.png'></a>&nbsp;&nbsp;<a href='#' onclick='deleteRow(this)'><img src='/resources/images/icons/cross.png'></a>";//恢复操作列
            //更新数据
            //下拉列表的value值就是下拉列表当前选项的value值
            var model = { "id": id, "name": name};//创建与当前行数据对应的对象
            jobTitles.update(model);//更新数组
            //退出修改状态
            GlobalUpdateTr = null;
        }

    });
}

//-------窗口加载完毕触发--------//
window.onload = function () {
    console.log("init");
    console.log(jobTitles.length);

    loadDetailData();
    //3.新增
    getElement("btnAdd").onclick = function () {

        var jobTitleName = getElement("jobTitleName").value;
        $.post('/fJobTitle_ADD',{
            name:jobTitleName
        },function ( data)
        {
            console.log(data);
            data = eval('(' + data + ')');
            jobTitles.push(data);//返回新增的元素
            jobTitles.pages= jobTitles.length % jobTitles.pageCount != 0 ? (jobTitles.length - jobTitles.length % jobTitles.pageCount) / jobTitles.pageCount + 1 : jobTitles.length / jobTitles.pageCount;
            jobTitles.pageIndex = jobTitles.pages;
            loadDetailData();
        });

    };

    getElement("btnFirstPage").onclick = function (){
        if(jobTitles.pageIndex !== 1){
            jobTitles.pageIndex = 1;//页码++,取得下一页
            loadDetailData();
        }

    };
    getElement("btnLastPage").onclick = function (){
        jobTitles.pages = jobTitles.length % jobTitles.pageCount != 0 ? (jobTitles.length - jobTitles.length % jobTitles.pageCount) / jobTitles.pageCount + 1 : jobTitles.length / jobTitles.pageCount;
        if(jobTitles.pages !== jobTitles.pageIndex)
        {
            jobTitles.pageIndex = jobTitles.pages;//页码++,取得下一页
            loadDetailData();
        }

    };
    //5-1.下一页
    getElement("btnNextPage").onclick = function () {
        if (jobTitles.length == 0) {
            alert("没有数据");
        }
        //获取总页数
        jobTitles.pages = jobTitles.length % jobTitles.pageCount != 0 ? (jobTitles.length - jobTitles.length % jobTitles.pageCount) / jobTitles.pageCount + 1 : jobTitles.length / jobTitles.pageCount;
        if (jobTitles.pageIndex == jobTitles.pages) {//判断是否最后一页
            alert("最后一页啦");
            return;//返回
        }

        jobTitles.pageIndex++;//页码++,取得下一页
        loadDetailData();
    };
    //5-2.上一页
    getElement("btnPrevPage").onclick = function () {
        if (jobTitles.length == 0) {
            alert("没有数据");
        }
        //获取总页数
        jobTitles.pages = jobTitles.length % jobTitles.pageCount != 0 ? (jobTitles.length - jobTitles.length % jobTitles.pageCount) / jobTitles.pageCount + 1 : jobTitles.length / jobTitles.pageCount;
        if(jobTitles.pageIndex==1){//判断是否第一页
            alert("这个第一页");
            return;
        }

        jobTitles.pageIndex--;//页码--，取得上一页
        loadDetailData();
    };
};