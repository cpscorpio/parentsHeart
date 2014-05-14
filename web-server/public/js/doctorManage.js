/**
 * Created by chenpeng on 14-3-14.
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

var jobTitles = [];
jobTitles.getById = function (id) {
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


var subjects = [];

function onDepartment(ele)
{
    if(ele.checked)
    {
        subjects.push(ele.value);
    }
    else
    {
        subjects.splice(subjects.indexOf(ele.value),1);
    }
    loadSubjectSelectData();
    //console.log(subjects.toString());
}

function getElement(id)
{
    return document.getElementById(id);
}
function loadSelectData(element,data) {
    element.innerHTML = '';
    for (var i = 0; i < data.length; i++) {
        var opt = new Option( data[i].name , data[i].id);
        element.options.add(opt);
    };
};
function loadHospitalByCity(city)
{
    var element = getElement('sel_hospital');
    element.innerHTML = '';
    for (var i = 0; i < hospitalData.length; i++) {
        if(hospitalData[i] && hospitalData[i].city == city)
        {
            var opt = new Option( hospitalData[i].name , hospitalData[i].id);
            element.options.add(opt);
        }
    };
    if(element.options.length == 0)
    {
        element.options.add(new Option( '-------',0));
    }
}
function loadSubjectSelectData()
{
    var element = getElement('sel_subject');
    element.innerHTML = '';
    if( subjects.length > 0)
    {
        for (var i = 0; i < subjects.length; i++) {
            var subject = subjectData.getById(subjects[i]);
            if(subject)
            {
                var opt = new Option( subject.name , subject.id);
                element.options.add(opt);
            }

        };
    }
    else
    {
        element.options.add(new Option('请选择科室',0));
    }
    changeSubject();

}

function changeSubject()
{
    console.log('changeSubject');
    var subjectId = $('#sel_subject').val();
    var element = getElement('sel_illness');
    element.innerHTML = '';

    if(subjectId > 0)
    {
        for (var i = 0; i < diseaseData.length; i++) {
            if(diseaseData[i] && diseaseData[i].department_id == subjectId)
            {
                var opt = new Option( diseaseData[i].name , diseaseData[i].id);
                element.options.add(opt);
            }

        };
    }
    if(element.options.length == 0)
    {
        element.options.add(new Option('请选择疾病'));
    }
}
function changeCity()
{
    console.log($('#sel_city').val());
    loadHospitalByCity($('#sel_city').val());
}

function changeSubjectChecked()
{
    subjects = [];
    $('input[name="subject"]:checked').each( function (){
        var departmentId = $(this).val()
        subjects.push(departmentId);
    });
    loadSubjectSelectData();
}
var  _file = 0;
window.onload = function () {
    console.log("init");
    console.log(doctorData.length);

    if(doctorData.length > 0)
    {
        loadSelectData(getElement('sel_city'),cityData);
        loadSelectData(getElement('sel_job'),jobTitles);
        loadSelectData(getElement('sel_price'),priceData);
        changeCity();
        loadSubjectSelectData();

        loadDetailData();
    }

    $('.checked-all').click(

        function(){
            $(this).parent().parent().find("input[name='subject']").attr('checked', $(this).is(':checked'));
            changeSubjectChecked();
        }
    );
    $('.checked-invert').click(

        function(){
            $(this).parent().parent().find("input[name='subject']").each ( function (){
                $(this).attr('checked', !$(this).is(':checked'));
            });
            changeSubjectChecked();
        }
    );

    $('#uploadFile').uploadify({
        'uploader': '/uploadImage',
        'swf' : '/resources/uploadify.swf',
        'auto':false,
        'buttonText':'选择文件',
        'onSelect':function (file )
        {
            console.log(file);
            _file = file;
        },
        'onUploadComplete':function(data)
        {
            console.log(data);
            if(doctorData.length > 0)
            {
                alert('添加成功!');
            }
            else
            {
                alert('修改成功!');
            }

            window.location.href= "page31";
        },
        'onUploadError' : function (data)
        {
            console.log(data);
        }
    });


    if(getElement("btnFirstPage"))
    {
        //5.分页（先删除当前界面所有行，再添加）
        getElement("btnFirstPage").onclick = function (){
            if(doctorData.pageIndex !== 1){
                doctorData.pageIndex = 1;//页码++,取得下一页
                loadDetailData();
            }

        };
        getElement("btnLastPage").onclick = function (){
            getPages();
            if(doctorData.pages !== doctorData.pageIndex)
            {
                doctorData.pageIndex = doctorData.pages;//页码++,取得下一页
                loadDetailData();
            }
        };
        //5-1.下一页
        getElement("btnNextPage").onclick = function () {
            if (doctorData.length == 0) {
                alert("没有数据");
            };
            //获取总页数
            getPages();
            if (doctorData.pageIndex == doctorData.pages) {//判断是否最后一页
                alert("最后一页啦");
                return;//返回
            };

            doctorData.pageIndex++;//页码++,取得下一页
            loadDetailData();
        };
        //5-2.上一页
        getElement("btnPrevPage").onclick = function () {
            if (doctorData.length == 0) {
                alert("没有数据");
            };
            //获取总页数
            getPages();
            if(doctorData.pageIndex==1){//判断是否第一页
                alert("这个第一页");
                return;
            };

            doctorData.pageIndex--;//页码--，取得上一页
            loadDetailData();
        };
    }

}
//开始上传
function upload(id)
{
    if( !_file)
    {
        alert('please select image！');
        return;
    }
    if(!id)
    {
        id = '';
    }
    var nameFile = 'doctor'+id + '.jpg';
    $('#uploadFile').uploadify("settings",'formData',{name:nameFile});
    $('#uploadFile').uploadify('upload','*');

}
function initDoctor(doctor)
{
    console.log(doctor);
}

function addDoctor()
{
    var doctor_name = $("#doctor_name").val();
    var work_phone_number = $("#work_phone_number").val();
    var self_phone_number = $("#self_phone_number").val();
    var city = $("#sel_city option:selected").val();
    var hospital = $("#sel_hospital option:selected").val();
    var sel_job = $("#sel_job option:selected").val();
    var price = $("#sel_price option:selected").val();
    var sel_illness = $("#sel_illness option:selected").val();

    if(!doctor_name || !work_phone_number || !sel_illness || !sel_job || !self_phone_number || !price || !hospital ||
        !city)
    {
        alert('请填写完整！');
        return;
    }

    var subject = "";
    var er = false;
    var chan = false;
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
        console.log(doctor_name,work_phone_number,self_phone_number,city,hospital,sel_job,price,sel_illness,subject);
        alert('请选择科室！');
        return;
    }
    if( er) subject = "1," + subject;
    if( chan) subject = "2," + subject;
    console.log(doctor_name,work_phone_number,self_phone_number,city,hospital,sel_job,price,sel_illness,subject);

    if( !_file)
    {
        alert('请选择一张图片作为头像！');
        return;
    }
    $.post("/fDoctor_ADD", {
        name:doctor_name,
        uid:work_phone_number,
        department:subject,
        diseases:sel_illness,
        job_title:sel_job,
        hospital:hospital,
        device_token:'',
        work_phone_number:work_phone_number,
        self_phone_number:self_phone_number,
        price:price
    }, function ( data)
    {
        console.log(data);
        if(data)
        {
            if( typeof data == 'string')
            {
                data = eval( '(' + data + ')');
            }
            upload(data.id);
            console.log(data);
        }
        else
        {
            alert('添加失败！');
        }
    });
}
function alter()
{
    var doctor_id = $('#doctor_id').val();
    var doctor_name = $("#doctor_name").val();
    var work_phone_number = $("#work_phone_number").val();
    var self_phone_number = $("#self_phone_number").val();
    var city = $("#sel_city option:selected").val();
    var hospital = $("#sel_hospital option:selected").val();
    var sel_job = $("#sel_job option:selected").val();
    var price = $("#sel_price option:selected").val();
    var sel_illness = $("#sel_illness option:selected").val();

    if(!doctor_name || !work_phone_number || !sel_illness || !sel_job || !self_phone_number || !price || !hospital ||
        !city)
    {
        alert('请填写完整！');
        return;
    }

    var subject = "";
    var er = false;
    var chan = false;
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
        console.log(doctor_name,work_phone_number,self_phone_number,city,hospital,sel_job,price,sel_illness,subject);
        alert('请选择科室！');
        return;
    }
    if( er) subject = "1," + subject;
    if( chan) subject = "2," + subject;
    console.log(doctor_name,work_phone_number,self_phone_number,city,hospital,sel_job,price,sel_illness,subject);

    $.post("/fDoctor_ALTER", {
        id:doctor_id,
        doctor:{
            name:doctor_name,
            departments:subject,
            diseases:sel_illness,
            job_title:sel_job,
            hospital:hospital,
            work_phone_number:work_phone_number,
            self_phone_number:self_phone_number,
            price:price
        }
    }, function ( data)
    {
        console.log(data);
        if(data)
        {
            if( typeof data == 'string')
            {
                data = eval( '(' + data + ')');
            }
            if(_file)
            {
                upload(data.id);
            }
            else
            {
                alert('添加成功！');
            }
            console.log(data);
        }
        else
        {
            alert('添加失败！');
        }
    });
}


//doctors

var doctorData = [];
doctorData.deleteById = function (id) {
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

if( !doctorData.pageIndex)
{
    doctorData.pageIndex = 1;//页码
}

doctorData.pageCount = 5;//每页记录条数
doctorData.pages=0;//总页数
function getPages()
{
    doctorData.pages = doctorData.length % doctorData.pageCount != 0 ? (doctorData.length - doctorData.length % doctorData.pageCount) / doctorData.pageCount + 1 : doctorData.length / doctorData.pageCount;
    return doctorData.pages;
}

//返回第pageIndex页数据
doctorData.getPageData = function () {
    var pageData = [];//定义数组存储一页数据
    for (var i = (this.pageIndex - 1) * this.pageCount; i < this.pageIndex * this.pageCount; i++) {//获取第pageIndex页数据
        //alert(this[i]);
        if (this[i]) {//判断this[i]是否undefined,过滤掉
            pageData[pageData.length] = this[i];
        };
    }
    return pageData;
};

function loadDetailData() {

    var tbList = getElement("doctorList");//获得表对象
    for (var i = tbList.rows.length - 1; i >= 0; i--) {//删除表所有行
        tbList.deleteRow(i);
    }
    var arrPage = doctorData.getPageData();//获得一页数据
    loadDataToTb(arrPage);//加载显示到表

};

function loadDataToTb(arr) {
    for (var i = 0; i < arr.length; i++) {
        //console.log(JSON.stringify(arr[i]));
        addTr(arr[i]);
    };
    getPages();
    getElement('currentPage').innerHTML = doctorData.pageIndex;
    getElement('allPage').innerHTML = doctorData.pages;
};

function addTr(model) {
    var tb = getElement("doctorList");//获得表对象
    var tr = tb.insertRow(-1);//插入一行
    tr.insertCell(-1).innerHTML = '<input type="checkbox" name="hospitalId" value="' + model.id +'">'
    tr.insertCell(-1).innerHTML = model.id;//插入序号列
    tr.insertCell(-1).innerHTML = model.name;//插入名称列
    var td = tr.insertCell(-1);//插入category列
    var tmp = jobTitles.getById(model.job_title);
    td.innerHTML = tmp.name ;//设置捐赠单位名称

    var td = tr.insertCell(-1);//插入category列
    var tmp = hospitalData.getById(model.hospital);
    td.innerHTML = tmp.name ;//设置捐赠单位名称



    //科室
    var td = tr.insertCell(-1);
    var str = "";
    var subjectArr = model.departments.split(',');
    for(var i = 0; i <subjectArr.length && i < 5 ; i++)
    {
        str += subjectData.getById(subjectArr[i]).name + ',';
    }
    str += '...';

    td.innerHTML = str ;

    var td = tr.insertCell(-1);//插入category列
    var tmp = priceData.getById(model.price);
    td.innerHTML = tmp.name ;//设置捐赠单位名称
    tr.insertCell(-1).innerHTML = "<a href='#' onclick='alterHospital("+ model.id+")'><img src='/resources/images/icons/pencil.png'></a>&nbsp;&nbsp;<a href='#' onclick='deleteRow(this)'><img src='/resources/images/icons/cross.png'></a>";//操作列
};
function alterHospital(id)
{
    post('/alterDoctor' ,{id:id});
}
function deleteRow(element) {

    if (!confirm("确定删除吗？")) {//确认是否要移除
        return;
    };

    var delTr = element.parentNode.parentNode;//获取行
    $.post('/fDoctor_DEL',{id:delTr.childNodes[1].innerHTML}, function (data)
    {
        console.log(data);
        if(data)
        {
            doctorData.deleteById(delTr.childNodes[1].innerHTML);//删除对应的数组元素
            getPages();

            if( doctorData.pageIndex > doctorData.pages)
            {
                doctorData.pageIndex = doctorData.pages;
            }
            loadDetailData();
        }
    });

};


function resetDoctor( name, work_phone, self_phone, hospital, job, price, departments, disease)
{
    console.log('reset',name, work_phone, self_phone, hospital, job, price, departments, disease);
    $('#doctor_name').val(name);
    $("#work_phone_number").val(work_phone);
    $("#self_phone_number").val(self_phone);
    $("#sel_city").val(hospitalData.getById(hospital).city);
    changeCity();
    $("#sel_hospital").val(hospital);
    $("#sel_job").val(job);
    $("#sel_price").val(price);
    subjects = [];
    $('input[name="subject"]').each( function (){
        console.log($(this).val());
        if( departments.indexOf($(this).val()) != -1)
        {
            console.log($(this).val(),'in');
            $(this).attr("checked",'true');
            subjects.push($(this).val());
        }
        else
        {
            $(this).removeAttr("checked");
        }
    });
    loadSubjectSelectData();
    var department_id = diseaseData.getById(disease).department_id;
    $('#sel_subject').val(department_id);
    changeSubject();
    $("#sel_illness").val(disease);

    console.log('file',_file);

    if( _file)
    {


        $('#uploadFile').uploadify('cancel',_file.id);
    }
}