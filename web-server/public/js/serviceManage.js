/**
 * Created by chenpeng on 14-3-6.
 */

var cityData = [];
cityData.getById = function (id) {
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

var diseaseData = [];
diseaseData.getById = function (id) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].id == id) {
            return this[i];
        };
    };
};

var hospitalData = [];
hospitalData.getById = function (id) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].id == id) {
            return this[i];
        };
    };
};

var priceData = [];
priceData.getById = function (id) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].id == id) {
            return this[i];
        };
    };
};

var typeData = [{id:1,name:'普通'},{id:2,name:'专家'},{id:3,name:'特殊'}];
typeData.getById = function (id) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].id == id) {
            return this[i];
        };
    };
};

var categoryData = [{id:0,name:'儿科'},{id:1,name:'产科'}];
categoryData.getById = function (id) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].id == id) {
            return this[i];
        };
    };
};

//3.加载element-传入select对象
function loadSelectData(element,data) {
    element.innerHTML = '';
    for (var i = 0; i < data.length; i++) {
        if(data[i].id >= 0){
            var opt = new Option( data[i].name , data[i].id);
            element.options.add(opt);
        }
    };
    if(element.options.length == 0)
    {
        element.options.add( new Option( "--------" , -1));
    }
};

function loadPriceSelectData(element,data) {
    element.innerHTML = '';
    for (var i = 0; i < data.length; i++) {
        if(data[i].id >= 0){
            var opt = new Option( data[i].price+'元' , data[i].id);
            element.options.add(opt);
        }
    };
    if(element.options.length == 0)
    {
        element.options.add( new Option( "--------" , -1));
    }
};


function loadSelectHospitalByCity(element,city) {
    element.innerHTML = '';

    for (var i = 0; i < hospitalData.length; i++) {
        if(hospitalData[i].city == city)
        {
            var opt = new Option( hospitalData[i].name , hospitalData[i].id);
            element.options.add(opt);
        }
    };
    if(element.options.length == 0)
    {
        element.options.add( new Option( "--------" , -1));
    }
};

function loadSelectSubjectByCategory(element,categoryId) {
    element.innerHTML = '';
    for (var i = 0; i < subjectData.length; i++) {
        if(subjectData[i].category == categoryId)
        {
            var opt = new Option( subjectData[i].name , subjectData[i].id);
            element.options.add(opt);
        }
    };
    if(element.options.length == 0)
    {
        element.options.add( new Option( "--------" , -1));
    }
};

function loadSelectSubjectByHospital(element,hospitalId) {
    element.innerHTML = '';
    var hospital = hospitalData.getById(hospitalId);
    if(hospital)
    {
        var subjects = hospital.departments;

        for (var i = 0; i < subjectData.length; i++) {
            if(subjects.indexOf(subjectData[i].id) >= 0)
            {
                var opt = new Option( diseaseData[i].name , diseaseData[i].id);
                element.options.add(opt);
            }
        };
    }

    if(element.options.length == 0)
    {
        element.options.add( new Option( "--------" , -1));
    }
};

function loadSelectDiseaseByDepartment(element,departmentId) {
    element.innerHTML = '';
    if(departmentId == 1)
    {
        var departments = 'ids';
        for(var i = 0; i< subjectData.length; i++)
        {
            if(subjectData[i].category == 0)
            {
                departments += '.' + subjectData[i].id + ',';
            }
        }
        for (var i = 0; i < diseaseData.length; i++) {
            if( departments.indexOf('.' + diseaseData[i].department_id + ',') >= 0 )
            {
                var opt = new Option( diseaseData[i].name , diseaseData[i].id);
                element.options.add(opt);
            }
        };
    }
    else if(departmentId == 2)
    {
        var departments = 'ids';
        for(var i = 0; i< subjectData.length; i++)
        {
            if(subjectData[i].category == 1)
            {
                departments += '.' + subjectData[i].id + ',';
            }
        }
        for (var i = 0; i < diseaseData.length; i++) {
            if( departments.indexOf('.' + diseaseData[i].department_id + ',') >= 0 )
            {
                var opt = new Option( diseaseData[i].name , diseaseData[i].id);
                element.options.add(opt);
            }
        };
    }
    else
    {
        for (var i = 0; i < diseaseData.length; i++) {
            if(diseaseData[i].department_id == departmentId)
            {
                var opt = new Option( diseaseData[i].name , diseaseData[i].id);
                element.options.add(opt);
            }
        };
    }

    element.options.add( new Option( "其他疾病" , 0));
};
function getElement(id) {
    return document.getElementById(id);
};
function changeCategory()
{
    var categoryId = $('#sel_category option:selected').val();
    console.log('changeCategory',categoryId);
    loadSelectSubjectByCategory(getElement('sel_subject'),categoryId);
    changeSubject();
}
function changeSubject()
{
    var subject_id = $('#sel_subject option:selected').val();
    console.log('changeSubject',subject_id);
    loadSelectDiseaseByDepartment(getElement('sel_illness'),subject_id);
}
function changeCity()
{
    var city = $('#sel_city option:selected').val();
    console.log('changeCity',city);
    loadSelectHospitalByCity(getElement('sel_hospital'),city);
    changeHospital();
}
function changeHospital()
{
    var hospital = $('#sel_hospital option:selected').val();
    console.log('changeHospital',hospital);
    loadSelectSubjectByHospital(getElement('sel_subject1'),hospital);
}

//-------窗口加载完毕触发--------//
window.onload = function () {
    console.log("init");

    loadSelectData(getElement('sel_category'),categoryData);

    loadSelectData(getElement('sel_city'),cityData);
    loadPriceSelectData(getElement('sel_price'),priceData);
    loadSelectData(getElement('sel_subject1'),subjectData);
    loadSelectData(getElement('sel_type'),typeData);
    changeCategory();
    changeCity();

    loadDetailData();

    getElement("btnFirstPage").onclick = function (){
        if(orderData.pageIndex !== 1){
            orderData.pageIndex = 1;//页码++,取得下一页
            loadDetailData();
        }

    };
    getElement("btnLastPage").onclick = function (){
        orderData.pages = orderData.length % orderData.pageCount != 0 ? (orderData.length - orderData.length % orderData.pageCount) / orderData.pageCount + 1 : orderData.length / orderData.pageCount;
        if(orderData.pages !== orderData.pageIndex)
        {
            orderData.pageIndex = orderData.pages;//页码++,取得下一页
            loadDetailData();
        }

    };
    //5-1.下一页
    getElement("btnNextPage").onclick = function () {
        if (orderData.length == 0) {
            alert("没有数据");
        }
        //获取总页数
        orderData.pages = orderData.length % orderData.pageCount != 0 ? (orderData.length - orderData.length % orderData.pageCount) / orderData.pageCount + 1 : orderData.length / orderData.pageCount;
        if (orderData.pageIndex == orderData.pages) {//判断是否最后一页
            alert("最后一页啦");
            return;//返回
        }

        orderData.pageIndex++;//页码++,取得下一页
        loadDetailData();
    };
    //5-2.上一页
    getElement("btnPrevPage").onclick = function () {
        if (orderData.length == 0) {
            alert("没有数据");
        }
        //获取总页数
        orderData.pages = orderData.length % orderData.pageCount != 0 ? (orderData.length - orderData.length % orderData.pageCount) / orderData.pageCount + 1 : orderData.length / orderData.pageCount;
        if(orderData.pageIndex==1){//判断是否第一页
            alert("这个第一页");
            return;
        }

        orderData.pageIndex--;//页码--，取得上一页
        loadDetailData();
    };
}

var currentAction = 0;
var Action = ['orderFindDoctor','orderGuahao','orderService']

function onOrder(action)
{

    var ele = getElement(Action[action]);
    if( ele && ele.className == 'number')
    {
        var curEle = getElement(Action[currentAction]);
        curEle.className = 'number'
        currentAction = action;
        ele.className = 'number current';
        console.log('ok!');
        // TODO post getOrderList
        $.post('/getOrdersBy' + currentAction, {}, function (data)
        {
            var orders = eval('(' + data + ')');
            if(orders )
            {
                orderData.length = 0;
                for( var i = 0; orders && i < orders.length; i++)
                {
                    console.log(orders[i]);
                    orderData.push(orders[i]);
                }
                loadDetailData();
            }
        });
    }

}


//orderList Manage
var findDoctorStatus = ['未知','未支付','未受理','已受理','未评价','已评价(完成)','异常'];
var guaHaoStatus = ['未响应','已拒绝','已接受','未评价','已评价','异常'];
var serviceStatus = ['未评价','已评价'];

var orderData = [];
//2.1.根据id删除数组元素
orderData.deleteById = function (id) {
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
orderData.update = function (model) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].id == model.id) {
            this[i] = model;
            break;
        }
    }
};

//2-5.返回一页数据
if( !orderData.pageIndex)
{
    orderData.pageIndex = 1;//页码
}

orderData.pageCount = 5;//每页记录条数
orderData.pages=0;//总页数
//返回第pageIndex页数据
orderData.getPageData = function () {
    var pageData = [];
    for (var i = (this.pageIndex - 1) * this.pageCount; i < this.pageIndex * this.pageCount; i++) {//获取第pageIndex页数据
        //alert(this[i]);
        if (this[i]) {//判断this[i]是否undefined,过滤掉
            pageData[pageData.length] = this[i];
        }
    }
    return pageData;
};
function loadDetailData() {

    var tbList = getElement("orderList");//获得表对象
    for (var i = tbList.rows.length - 1; i >= 0; i--) {//删除表所有行
        tbList.deleteRow(i);
    }
    var arrPage = orderData.getPageData();//获得一页数据
    loadDataToTb(arrPage);//加载显示到表

}
//4-1.加载表数据,arr数组数据
function loadDataToTb(arr) {
    if(arr.length > 0)
    {
        for (var i = 0; i < arr.length; i++) {
            //console.log(JSON.stringify(arr[i]));
            addTr(arr[i]);
        }
    }
    else
    {
        addTr();
    }

    orderData.pages = orderData.length % orderData.pageCount != 0 ? (orderData.length - orderData.length % orderData.pageCount) /
        orderData.pageCount + 1 : orderData.length / orderData.pageCount;
    getElement('currentPage').innerHTML = orderData.pageIndex;
    getElement('allPage').innerHTML = orderData.pages;
}
//4-1.插入一行,model-数组元素
function getDoctor(id)
{
    console.log(id);
}
function addTr(model) {
    var tb = getElement("orderList");//获得表对象
    var tr = tb.insertRow(-1);//插入一行
    if(model)
    {
        if (currentAction == 0)
        {
            tr.insertCell(-1).innerHTML = model.order_id;
            tr.insertCell(-1).innerHTML = model.user_contact;//插入序号列
            tr.insertCell(-1).innerHTML =  model.doctor_id ? '<a href="#" onclick="getDoctor('+ model.doctor_id+')" >' + model.doctor_name+ '</a>' :"";
            tr.insertCell(-1).innerHTML = "<time>" + model.ctime + "</time>";
            tr.insertCell(-1).innerHTML = findDoctorStatus[model.status];
            tr.insertCell(-1).innerHTML = "<a href='findDoctorOrderById" + model.order_id + "' class='button'>详情</a>";//操作列
        }
        else if (currentAction == 1)
        {
            tr.insertCell(-1).innerHTML = model.order_id;
            tr.insertCell(-1).innerHTML = model.user_contact;//插入序号列
            tr.insertCell(-1).innerHTML =  model.worker_id ? '<a href="#" onclick="getDoctor('+ model.worker_id+')" >' + model.worker_name+ '</a>' :"";
            tr.insertCell(-1).innerHTML = "<time>" + model.ctime + "</time>";
            tr.insertCell(-1).innerHTML = guaHaoStatus[model.status];
            tr.insertCell(-1).innerHTML = "<a href='registrationOrderById" + model.order_id +"' class='button'>详情</a>";//操作列
        }
        else if (currentAction == 2)
        {
            tr.insertCell(-1).innerHTML = model.order_id;
            tr.insertCell(-1).innerHTML = model.user_contact;//插入序号列
            tr.insertCell(-1).innerHTML =  model.service_id ? '<a href="#" onclick="getDoctor('+ model.service_id+')" >' + model.service_name+ '</a>' :"";
            tr.insertCell(-1).innerHTML = "<time>" + model.ctime + "</time>";
            tr.insertCell(-1).innerHTML = serviceStatus[model.status];
            tr.insertCell(-1).innerHTML =  "<a href='serviceOrderById"+ model.order_id+"' rel='modal' class='button'>详情</a>";//操作列
        }
    }
    else
    {
        var td = tr.insertCell(-1);

        td.setAttribute('colspan','10');
        td.setAttribute('style',"text-align: center;");
        td.innerHTML = "<i>没有订单！</i>";
    }

}
