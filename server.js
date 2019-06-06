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

http.listen(PORT,function(){
    console.log('listening to port: '+PORT);
});

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

// This is auto initiated event when Client connects to Your Machine.  
io.on('connection',function(socket){

  // Join room
  socket.on('join room', function(data){
    // console.log(data);
    var room = data.room;
    // Join to a room name
    socket.join(room);
  });

  //inserting messages database
  socket.on('send message', function(data){
    // console.log(data);
    var supplier_id = data.supplier_id;
    var customer_id = data.customer_id;
    var sender_id   = data.sender_id;
    var room        = data.room;
    var message     = data.message;
    var api         = data.api; //API to be called

    // API to save message and user sender
    send_message_api(
      supplier_id,
      customer_id,
      sender_id,
      message,
      api
    );

    // Get current date
    // var now = new Date();
    // var date = dateFormat(now,"mmm d, yyyy h:MM TT");
    // var date = dateFormat(now,"h:MM TT");

    // Join to a room name
    socket.join(room);

    // Disply message to receiver and sender
    io.to(room).emit('get message', {
      customer_id : customer_id,
      supplier_id : supplier_id,
      sender_id : sender_id,
      message : message,
    });


    // Display latest message under user's name for every send
    io.emit('display message', {
      customer_id : customer_id,
      supplier_id : supplier_id,
      sender_id : sender_id,
      message : message,
    });

  });

  // Seen the message if customer or supplier is open
  socket.on('seen message', function(data){
    var api = data.api;
    seen_message( api )
  });

  // get all messages
  // socket.on('get all messages', function(data){
  //   var sup_id = data.supplier_id;
  //   var cus_id = data.customer_id;
  //   var user_id = data.user_id;
  //   var api = data.api;
  //   get_all_messages_api(sup_id,cus_id,user_id,api);
  // });


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



/**
 *
 * Functions API
 *
 */


/*============================================*/
/* Save message to wordpress through REST API */
/*============================================*/
function send_message_api( supplier_id, customer_id, sender_id, message, api){
  var options = {
    method : 'POST',
    uri : api,
    body : {
      'supplier_id' : supplier_id,
      'customer_id' : customer_id,
      'id' : sender_id,
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


/*============================================*/
/* Save message to wordpress through REST API */
/*============================================*/
function get_all_messages_api( sup_id, cus_id, user_id, api ){
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

/*==================================================*/
/* Seen the message for sender and receiver if open */
/*==================================================*/
function seen_message( api ){
  var options = {
    method : 'GET',
    uri : api,
    json : true
  };
  rp(options).then(function (response) {
    console.log(response);
  }).catch(function (err){
    console.log(err);
  });
}



