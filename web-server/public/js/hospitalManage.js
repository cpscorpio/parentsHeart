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

var subjectData = [];
subjectData.getById = function (id) {
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
function getPages()
{
    hospitalData.pages = hospitalData.length % hospitalData.pageCount != 0 ? (hospitalData.length - hospitalData.length % hospitalData.pageCount) / hospitalData.pageCount + 1 : hospitalData.length / hospitalData.pageCount;
    return hospitalData.pages;
}
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
    getPages();
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

    var td = tr.insertCell(-1);//插入category列
    var str = "";
    var subjectArr = model.department_id.split(',');
    for(var i = 0; i <subjectArr.length && i < 5 ; i++)
    {
        str += subjectData.getById(subjectArr[i]).name + ',';
    }
    str += '...';

    td.innerHTML = str ;

    tr.insertCell(-1).innerHTML = "<a href='#' onclick='alterHospital("+ model.id+")'><img src='/resources/images/icons/pencil.png'></a>&nbsp;&nbsp;<a href='#' onclick='deleteRow(this)'><img src='/resources/images/icons/cross.png'></a>";//操作列
};

function alterHospital(id)
{
    post('/alterHospital' ,{id:id});
}

//5.根据标签id获得标签对象
function getElement(id) {
    return document.getElementById(id);
};
//6.删除行,element-当前点击de
function deleteRow(element) {

    if (!confirm("确定删除吗？")) {//确认是否要移除
        return;
    };

    var delTr = element.parentNode.parentNode;//获取行
    $.post('/fHospital_DEL',{code:delTr.childNodes[1].innerHTML}, function (data)
    {
        console.log(data);
        if(data)
        {
            hospitalData.deleteById(delTr.childNodes[1].innerHTML);//删除对应的数组元素
            getPages();

            if( hospitalData.pageIndex > hospitalData.pages)
            {
                hospitalData.pageIndex = hospitalData.pages;
            }
            loadDetailData();
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
    if(hospitalData.length > 0)
    {
        loadDetailData();
    }

    if(getElement("btnFirstPage"))
    {
        //5.分页（先删除当前界面所有行，再添加）
        getElement("btnFirstPage").onclick = function (){
            if(hospitalData.pageIndex !== 1){
                hospitalData.pageIndex = 1;//页码++,取得下一页
                loadDetailData();
            }

        };
        getElement("btnLastPage").onclick = function (){
            getPages();
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
            getPages();
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
            getPages();
            if(hospitalData.pageIndex==1){//判断是否第一页
                alert("这个第一页");
                return;
            };

            hospitalData.pageIndex--;//页码--，取得上一页
            loadDetailData();
        };
    }

};


function alter(id)
{
    var hospital = $("#hospital").val();

    var city = $("#city option:selected").val();
    var subject = "";
    var er = false;
    var chan = false;
    console.log(subjectData)
    $('input[name="subject"]:checked').each( function (){
        var departmentId = $(this).val()
        subject += departmentId + ',';
        console.log(departmentId)
        if(er == false && subjectData.getById(departmentId).category == 0)
        {
            er = true;
        }
        else if(chan == false && subjectData.getById(departmentId).category == 1)
        {
            chan = true;
        }
    })
    if(subject){
        subject = subject.slice(0,-1);
    }
    else
    {
        alert('请选择科室！');
        return;
    }
    if( er) subject = "1," + subject;
    if( chan) subject = "2," + subject;
    if( !city)
    {
        alert('请选择城市！');
        return;
    }
    if( !hospital)
    {
        alert('请填写医院名称！');
        return;
    }

    $.post("/fHospital_ALTER", {code:id,name:hospital, city:city, subject:subject}, function ( data)
    {
        console.log(data);
        if(data)
        {
            if( typeof data == 'string')
            {
                data = eval( '(' + data + ')');
            }

            if(data.affectedRows > 0)
            {
                alert('修改成功！');
                window.location.href= "page11";
            }
            else
            {
                alert('修改失败！');
            }

        }
        else
        {
            alert('修改失败！');
        }

    });
}

function add()
{
    var hospital = $("#hospital").val();

    var city = $("#city option:selected").val();
    console.log(city)

    var subject = "";
    var subject = "";
    var er = false;
    var chan = false;

    $('input[name="subject"]:checked').each( function (){
        var departmentId = $(this).val()
        subject += departmentId + ',';

        if(er == false && subjectData.getById(departmentId).category == 0)
        {
            er = true;
        }
        else if(chan == false && subjectData.getById(departmentId).category == 1)
        {
            chan = true;
        }
    })
    if(subject){
        subject = subject.slice(0,-1);
    }
    else
    {
        alert('请选择科室！');
        return;
    }
    if( er) subject = "1," + subject;
    if( chan) subject = "2," + subject;


    if( !city)
    {
        alert('请选择城市！');
        return;
    }
    if( !hospital)
    {
        alert('请填写医院名称！');
        return;
    }

    $.post("/fHospital_ADD", {name:hospital, city:city, subject:subject}, function ( data)
    {
        console.log(data);
        if(data)
        {

            if(data.affectedRows > 0)
            {
                alert('添加成功！');
                window.location.href= "page11";
            }
            else
            {
                alert('添加失败！');
            }

        }
        else
        {
            alert('添加失败！');
        }
    });

}