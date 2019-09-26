
function init(){
  this.nowpage = 1;                                               //初始化nowpage为1；
  this.pagesize = 10;                                             //初始化pagesize为10；
  this.allStudent;                                                //定义allstudent记录总的学生数量；
  this.allpage ;                                                  //定义allpage记录总页数；
  this.bindEvent();                                               //执行bindEvent函数；
  this.Tabledata = [];                                            //定义一个数据存放每次获取data的值
  this.renderTable(nowpage);                                      //一开始就调用渲染界面的函数；
  this.bindPage();                                                //调用点击页面的函数；
  this.searchword = '';                                           //初始化搜索词为空；
}

function bindEvent(){
  var self = this;
  $('.menu-list').on('click','dd',function(e){                    //绑定学生列表与新增学生的点击事件；
    $('dd').removeClass('active');
    $(e.target).addClass('active');                               //给当前点击的dd增加类名，用于切换背景颜色；
    var attr = $(e.target).attr('data-id');
    if(attr == 'student-list'){                                   //当点击的是新增学生按钮时，调用renderTable函数渲染界面
      renderTable(nowpage);
    }
    $('.content').fadeOut();
    $('#' + attr).fadeIn();

  })
  $('#add-student-btn').on('click',function(e){                   //新增学生按钮点击事件
    e.preventDefault();                                           //阻止提交按钮默认刷新事件
    var data = $('#add-student-form').serializeArray();           //获取input框中的所有数据，存放到data中；
    data = farmatData(data);                                      //将数组data转化成对象的data；
    regDisplay(data);                                             //调用函数判断input框中的内容是否符合标准；
    transferData('/api/student/addStudent',data,function(){       //调用接口函数将数据存入后台
          alert('添加成功');
          $('#add-student-form').get(0).reset();
          $('dl .list').trigger('click');                         //手动触发list点击事件，回到学生列表界面
      })
  })

  $('#tbody').on('click','.edit',function(){                      //绑定编辑按钮点击事件
    $('.dialog').show();                                          //弹出编辑框
    var index = $(this).data('index');                            //获取当前数据唯一对应的索引值
    dataBack(Tabledata[index]);                                   //在存放数据的tabledata中找到点击当前的数据，并调用数据回填函数回填数据；
  })
  $('.mask').on('click',function(){                               //点击空白区域，隐藏编辑框
    $('.dialog').hide();
  })
  $('#edit-student-btn').on('click',function(e){                  //绑定编辑框的数据修改事件
    e.preventDefault();                                           //阻止提交按钮默认刷新事件
    var editdata = $('#edit-student-form').serializeArray();      //获取input框中的所有数据，存放到editdata中；
    editdata = farmatData(editdata);                              //数组数据转换成对象形式的数据；
    // console.log(editdata);
    transferData('/api/student/updateStudent',editdata,function(){  
     alert('数据更新成功');                                        //将更新过的数据重新渲染到界面
      renderTable(nowpage);
      $('.mask').trigger('click');
    })
  })
  $('#tbody').on('click','.del',function(e){                       //绑定删除按钮点击事件
    var index = $(this).data('index');                             //获取当前数据的索引值
    var delsNo = Tabledata[index];                                 //找到需要被删除的数据
    transferData('/api/student/delBySno',delsNo,function(){        //调用接口函数
      var confirm = window.confirm('确认删除？');
      if(confirm){
        alert('已删除');
        if(allStudent % (nowpage - 1) == 1){                       //判断当前页数据是否删完，如果删除完，则跳转至上一页；    
          renderTable(nowpage - 1);                       
        }else{
           renderTable(nowpage);                                   //如不是则继续渲染当前页
        }
      }
    })
  })
  $('#search-submit').on('click',function(){                      //绑定关键字搜索按钮事件
    searchword = $('#search-word').val();                         //获取搜索框中的内容
    if(searchword){
      nowpage = 1;                                                //如果搜索框中有内容，则将当前页至为1；
      searchInfor();                                              //调用函数，获取筛选后的内容

    }else{
      renderTable(nowpage);                                       //如果搜索框中没内容，则正常渲染界面
    }
  })
  $('.turnpage').on('click','#turnToPage',function(){             // 绑定跳转界面事件
    nowpage = parseInt($('#turnbyNum').val());                    //获取当前输入框中的数字，并将其赋值给nowpage
    if(nowpage > allpage || nowpage < 1){                         //输入页码错误提示，如果页码错误，将页码至1，并渲染
      alert('请输入正确页码');
      nowpage = 1;
    }
    renderTable(nowpage);
  })
  $('#showNum-submit').on('click',function(){                     //绑定每页显示数据数量点击事件
    pagesize = parseInt($('#showNum').val());                     //获取输入框中的数字，将其转换成number形式
    if(pagesize > 10){                                            //容错判断，防止数据超出，出现滚动条
      pagesize = 10;
    }
    renderTable(nowpage);
  })
}

function farmatData(arr){                                         //转换数据函数，将数组形式的数据转换成对象形式数据
  var obj = {};
  for(var i = 0 ; i < arr.length ; i++){
    if(!obj[arr[i].name]){
      obj[arr[i].name] = arr[i].value;
    }
  }
  return obj;
}

function searchInfor(){                                          //关键词搜索函数
  $('#tbody').empty();                                           //每次渲染将数据清空
  transferData('/api/student/searchStudent',{sex:-1,search:searchword,page:nowpage,size:pagesize},function(res){
    allStudent = res.data.cont;                                  //获取符合条件的数据的总量，并将其赋值给allstudent；
    // console.log(allStudent);
    allpage = Math.ceil(this.allStudent / this.pagesize); //计算获得总页数
    // Tabledata = res.data;
    // console.log(Tabledata);
    addData(res.data.searchList);                                //调用addData函数，将获取的数据插入tbody中
    turnpage(allpage);                                           //调用turnpage函数增添页面样式；
    
  })
}

function renderTable(page){                                      //按页查找函数
    $('#tbody').empty();                                         //每次渲染将数据清空
    transferData('/api/student/findByPage',{page:page,size:pagesize},function(res){
      allStudent = res.data.cont;                                //获取符合条件的数据的总量，并将其赋值给allstudent；
      allpage = Math.ceil(this.allStudent / this.pagesize);
      Tabledata = res.data.findByPage;
      addData(Tabledata);
      turnpage(allpage);
       
  })

}

function dataBack(data){                                         //数据回填函数
    var form = $('#edit-student-form').get(0);
    for(var prop in data){
      if(form[prop]){ //过滤data中form表单不含有的属性
            form[prop].value = data[prop];

      }
    }
}

function addData(data){                                         //把获取的数据增添到行间的函数                   
  var str = '';
      data.forEach(function(ele,index){
        str += '<tr>\
                  <td> '+ele.sNo+'</td>\
                  <td>'+ele.name+'</td>\
                  <td>'+(ele.sex ? "女" : "男")+'</td>\
                  <td>'+ele.email+'</td>\
                  <td>'+(new Date().getFullYear() - ele.birth) + '</td>\
                  <td>'+ele.phone+'</td>\
                  <td>'+ele.address+'</td>\
                  <td><button  class = "btn edit" data-index = ' +index+'>编辑</button>\
                       <button class = "btn del" data-index = ' +index+'>删除</button>\
                       </td>\
                   </tr>'
      })
      $(str).appendTo($('#tbody'));
}

function transferData(url,data,cb){                           //封装接口函数，通过ajax与后台连接
  $.ajax({
    url:'http://api.duyiedu.com' + url,
    type:'get',
      data:$.extend(data,{
        appkey:'dongmeiqi_1547441744650'
      }),
      dataType:'json',
      success:function(res){
        if(res.status == 'success'){
         cb(res);
        }
      }

  })
}

function bindPage(){                                          //页面点击函数，通过点击页面跳转
  $('.turnpage').on('click','.pagenum',function(e){
    nowpage = parseInt($(this).text());
    if(searchword){
      searchInfor()
    }else{
      renderTable(nowpage);

    }
  })
  $('.turnpage').on('click','.prepage',function(){           //绑定上一页点击按钮点击事件
    console.log('pre');
    if(nowpage > 1){
      nowpage --;
    if(searchword){                                         //如果是通过搜索渲染出来的页面，则用searchInfor函数再次渲染
      searchInfor()
    }else{
      renderTable(nowpage);     
      }
    }
    
  })
  $('.turnpage').on('click','.nextpage',function(){         //绑定下一页点击按钮点击事件
    if(nowpage < allpage){
      nowpage ++ ;
      if(searchword){
      searchInfor()
    }else{
      renderTable(nowpage);
      }
    }
    
  })
}

function turnpage(allpage){
  // console.log(nowpage);
  $('.turnpage').empty();                                 //每次调用都清空ul里面的内容，防止重复
  $('<span>第</span>').css({float:'left',lineHeight:'30px',height:'30px',padding:'0px 3px'}).appendTo($('.turnpage'));
  $('<input type = "number" id = "turnbyNum" min="1">').css({float:'left',marginTop:'7px',display:'inlineBlock',width:50,height:16,border:'1px solid #666',backgroundColor:'#15d0bf',textAlign:'center'}).appendTo($('.turnpage'));
  $('<span>页</span>').css({float:'left',lineHeight:'30px',height:'30px',padding:'0px 3px'}).appendTo($('.turnpage'));
  $('<button id = "turnToPage">跳转</button>').css({backgroundColor:'#354457',float:'left',lineHeight:'30px',height:'30px',padding:'0px 3px',marginRight:'10px',border:'none',color:'#fff'}).appendTo($('.turnpage'));
  if(nowpage > 1 ){
    $('<li class = "prepage">上一页</li>').appendTo($('.turnpage'));
  }else{
    $('.turnpage').remove('.prepage');
  }
   if (nowpage != 1 && nowpage - 2 > 1) {
    $(this.wrap).append($('<li class="pagenum">1</li>'));
  }
  if(nowpage > 4){
    $('<span>...</span>').appendTo($('.turnpage'));
  }
  for(var i = nowpage - 2 ; i <= (nowpage + 2) ; i++){
    if(i > 0 && i <= allpage) {
      var oLi = $('<li class="pagenum">' + i + '</li>');
        if (i == nowpage) {
            oLi.addClass('cur-page');
          }
        $('.turnpage').append(oLi);
      }
  }
  if (allpage - nowpage > 3) {
            $('.turnpage').append($('<span>...</span>'));
        }
  if (nowpage + 2 < allpage) {
            $('<li class="pagenum">' + allpage + '</li>').appendTo($('.turnpage'));
        }
  if (nowpage < allpage) {
            $('.turnpage').append($('<li class="nextpage">下一页</li>'));
        } else {
            $('.turnpage').remove('.nextpage');
        }
$('.turnpage').css({width:$('.turnpage li').size() * 80 + $('.turnpage span').size() * 15 + 150});

}

function regDisplay(data,url){                                   //数据校验函数
  var regname = /^[\u4E00-\u9FA5]{2,4}$/g;
  var regsNo = /\D+/g;
  var regEmail = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/g;
  var regphone = /^[1][3,4,5,7,8][0-9]{9}$/g;
  var regadress = /[\u4E00-\u9FA50-9]+/g;
    if(!regname.test(data.name)){
       alert('请输入正确的名字字符');
       return false;
    }else if(regsNo.test(data.sNo)){
      alert("请输入正确的学号");
      return false;
    }else if(!regEmail.test(data.email)){
      alert("请输入正确的邮箱");
      return false;
    }else if(data.birth > new Date().getFullYear() || data.birth < 1900){
        alert("请输入正确的生日日期");
        return false;

    }else if(!regphone.test(data.phone)){
        alert("请输入正确的电话号码格式");
        return false;
    }else if(!regadress.test(data.address)){
      alert("请输入正确的地址");
      return false;
    }else{
      return true;
    }

}
init();