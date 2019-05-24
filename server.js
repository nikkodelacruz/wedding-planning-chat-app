var app         = require("express")();
var bodyParser  = require('body-parser');
var http        = require('http').Server(app);
var io          = require("socket.io")(http);
// var mysql       = require("mysql");
var dateFormat  = require('dateformat');
var rp          = require('request-promise');
var PORT        = process.env.PORT || 3000; //port number whatever heroku gives


app.use(require("express").static('data'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


//conncecting nodejs to remote mysql
// var con = mysql.createConnection({
//   connectionLimit :  100,
//   host            : 'localhost',
//   user            : 'root',
//   password        : '',
//   database        : 'chat'
// });
// con.connect();


// app.get("/",function(req,res){
//     // res.sendFile(__dirname + '/front-page.php');
// });

function get_all_messages_api(sup_id,cus_id,user_id,api){
  var options = {
    method : 'GET',
    uri : api,
    qs : {
      'supplier_id' : sup_id,
      'customer_id' : cus_id,
    },
    json : true
  };
  rp(options).then(function (response) {
    if(response.success){
      io.emit('display messages',{
        user_id : user_id,
        data : response.data 
      });
    }
  }).catch(function (err) {
    console.log(err);
  });
}

function send_message_api(sup_id,cus_id,id,message,api){
  var options = {
    method : 'POST',
    uri : api,
    body : {
      'supplier_id' : sup_id,
      'customer_id' : cus_id,
      'id' : id,
      'message' : message
    },
    json : true // Automatically parses the JSON string in the response
  };
  rp(options).then(function (response) {
    console.log(response);
    // for(var x in response){
    //   var obj = response[x];
    //   console.log(obj._links);
    // }
  }).catch(function (err) {
    console.log(err);
  });
}

//  getting today's date  
var now = new Date();
var today = dateFormat(now, "mmmm d, yyyy");

// This is auto initiated event when Client connects to Your Machine.  
io.on('connection',function(socket){

  // authenticating and gettting user 
  // socket.on('validate',function(data){    
  //   // console.log(data);  

  //   var query = "SELECT * from message WHERE uid = '"+data+"' ";
  //   con.query( String(query), function(err, rows) {
  //     if ( err ) throw err;
  //     if( rows.length>0 ){
  //       // console.log(rows);
        
  //       //Getting all the messages 
  //       var get_message = "SELECT * FROM message";
  //       con.query( String(get_message), function(err, rows) {
  //         if ( err ) throw err;
  //         // console.log(rows);
  
  //         // saving username in socket object 
  //         // socket.nickname=rows[0].meta_value;

  //         //sending response to client side code.  
  //         io.emit('user entrance',{
  //           // info : rows[0].meta_value+" is online.",
  //           rows : rows
  //         });

  //       });

  //     }
  //   });

  // });

  // get all messages
  socket.on('get all messages', function function_name(data) {
    var sup_id = data.supplier_id;
    var cus_id = data.customer_id;
    var user_id = data.user_id;
    var api = data.api;
    get_all_messages_api(sup_id,cus_id,user_id,api);
  });
    
  //inserting messages database
  socket.on('send message', function(data){
    var sup_id = data.supplier_id;
    var cus_id = data.customer_id;
    var id = data.id;
    var role = data.role;
    var profile = data.profile;
    var name = data.name;
    var message = data.message;
    var api = data.api; //API to be called
    send_message_api(sup_id,cus_id,id,message,api); // API to save conversation to post type

    // Get current date
    var now = new Date();
    // var date = dateFormat(now,"mmm d, yyyy h:MM TT");
    var date = dateFormat(now,"h:MM TT");

    io.emit('get message',{
      supplier_id : sup_id,
      customer_id : cus_id,
      id : id,
      role : role,
      profile : profile,
      name : name,
      date : date,
      message : message,
      type : data.type
    });

    // var query="INSERT INTO message( `messages`, `uid`, `name`, `time`) VALUES ('"+data.msg+"','"+data.id+"','"+data.name+"','"+today+"')";
    // con.query(String(query),function(err,rows){
    //   if ( err ) throw err;
    //   console.log("1 record inserted");
    // });

  });

  //When user dissconnects from server.
  // socket.on('disconnect',function(){
  //   io.emit('server_status',{
  //     message:'offline'
  //   });
  // });

  //When user connects from server.
  // socket.on('connection',function(){
  //   io.emit('server_status',{
  //     message:'online'
  //   });
  // });

});


http.listen(PORT,function(){
    console.log('listening to port: '+PORT);
});