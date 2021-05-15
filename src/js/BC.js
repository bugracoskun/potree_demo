var BC = {};

BC.config = {
  development:true,
  api:"",
  frontend:""
};

if(BC.config.development){
  BC.config.api="http://localhost:2021";
  BC.config.frontend="http://localhost:1003";
}else{
  BC.config.api="https://a15c2b61c616.ngrok.io";
  BC.config.frontend="https://bugracoskun.github.io/potree_demo";
}

BC.api={
  domain:BC.config.api,
  routes:{
    "addfile":"/addfile",
  },
  sendrequest:function(obj,callback){
    //debugger;
    if(obj.url){
      var url=this.domain+obj.url;
    }else{
      var url=this.domain+this.routes[obj.route];
    }

    $.ajax({
      type: 'POST',
      timeout: 0,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      url: url,
      data: obj.data || {},
      success: function(result){
          if(result.status){
              callback(result)
          }else{
              alert("Veri Alınamadı")
          }
      },
      error: function(err){
        $('#loading').hide();
          if(err.status==404){
            alert("API Error!")
          }else{
            alert("ERROR")
          }
      }
    })
  }
}

BC.samples=[
  {id:1,type:"cloud",name:"Lion Las"},
  {id:2,type:"cloud",name:"Lion"},
  {id:3,type:"project",name:"Cesium Sorvilier"},
  //{id:4,type:"url",name:"Cesium Example"},
  {id:4,type:"cloud",name:"Hagia Sophia"}
]


$(document).ready(function main() {
  //home.$children[0].openlocal();
  home.$children[0].open(1);
  $('#loading').hide();
});

function sendFile(){
  if(file!=null){
    $('#loading').show();
    mypanel.close();
    mypanel=null;

    /*
    var settings = {
      "url": BC.config.api+"/addfile",
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      "data": {
        "id":Date.now().toString(),
        "file":file,
        "name":file_name
      }
    };
    
    $.ajax(settings).done(function (response) {
      $('#loading').hide();
      if(response.status){
        // Open local file
        home.$children[0].openlocal(response.data.id);
        file=null;
        file_name="File Didn't Select";
      }else{
        alert("Hata Meydana Geldi");
      }
    });*/
    var data={
      "id":Date.now().toString(),
      "file":file,
      "name":file_name
    };
    BC.api.sendrequest({type:"POST",route:"addfile",data:data},function(res){
      $('#loading').hide();
      if(res.status){
        // Open local file
        home.$children[0].openlocal(res.data.id);
        file=null;
        file_name="File Didn't Select";
      }else{
        alert("Hata Meydana Geldi");
        $('#loading').hide();
      }
    });
  }else{
    alert("Please Select a LAS File!");
  }
}

var file=null;
var file_name="File Didn't Select";

function selectFile(){
  var fileElement = document.createElement('input');
  fileElement.type='file';
  fileElement.accept = '.las';
  fileElement.click();
  fileElement.addEventListener('change',function(e){
    files = e.target.files;
    file_name=files[0].name.split(".")[0];

    var filetext = document.getElementById("selectfile");
    filetext.innerHTML = file_name;

    var reader = new FileReader();
    
    reader.addEventListener("load", function (e) {
      file=reader.result;
      $('#loading').hide();
    }, false);
    $('#loading').show();
    reader.readAsDataURL(files[0]);
  })
}

var mypanel=null;

BC.addfile=function() {

  if(mypanel!=null){
    mypanel.close();
    mypanel=null;
  }

  mypanel=jsPanel.create({
    theme: 'primary',
    headerTitle: 'Add File Panel',
    position: 'center 50 50',
    content: '<div style="width: 100%; text-align: center; padding-top: 20px;">Please select a las file from your computer.</div>'+
             '<div style="width: 100%; text-align:center; padding-top: 20px;"><button onclick="selectFile()" class="ui button">Add File</button> <div id="selectfile" style="padding-top: 5px;">'+file_name+'</div></div>'+
             '<div style="width: 100%; text-align: center; padding-top: 20px;"><button onclick="sendFile()" style="width: 150px;" class="ui inverted green button">ADD</button></div>',
    contentSize: {width:'300px', height:'250px'},
    resizeit: {
      disable: true
    },
    onclosed: function(panel, closedByUser) {
      mypanel=null;
      //file=null;
      //file_name="File Didn't Select";
    },
    callback: function(panel) {
        // do it
    }
  });
}

BC.openProject=function(id){
  // Change Project
  home.$children[0].open(id);
}



