var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('uploads'));

app.use('/', routes);
app.use('/users', users);



//파일업로드를 위한 플러그인
var multer = require('multer');
//var upload = multer( { dest: 'uploads/'} );
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
  }
});
var upload = multer({ storage: storage })
app.post( '/file-upload', upload.single('file'),function( req, res, next) {
  // Metadata about the uploaded file can now be found in req.file
  console.log(req.file);
  var data = {
        type:'file',
        originalname:req.file.originalname,
        filetype:req.file.mimetype,
        path:req.file.filename,
        size:req.file.size,
        title:fileTitle
  };
  io.sockets.emit("getMessage", data);
  res.sendStatus(200);
});

// ////////////////////////////////////////////////////////
var www = require('./bin/www');
var server = www.server;
// //console.log(server.path);
var socketio = require("socket.io");
var io = socketio.listen(8000);

// var io = require("socket.io")();
// var Server = require('socket.io');
// var io = new Server(8000);
// 소켓 입출력 객체 얻어오기 
//var io = socketio.listen(server)
// 클라이언트가 io.connect() 하면 실행될 함수 등록
var fileTitle ='';
io.sockets.on("connection",function(socket){
  // 클라이언트가 "sendMessage" 이벤트를 발생 시켰을때 실행할 함수 등록
  socket.on("sendMessage",function(data){
    console.log(data); 
    //받은 문자열을 모든 클라이언트에게 "getMessage" 이벤트 발생시키면서 전송
    //public 전송 
    io.sockets.emit("getMessage", data);
  });

  socket.on("getCurrentCode",function(data){
    console.log(data);
    io.sockets.emit("sendCode", data);
  });

  socket.on("fileUploaded",function(data){
    io.sockets.emit("newFile",data);
    io.sockets.emit("updateFileList",data);
    fileTitle = data.fileTitle;
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});




module.exports = app;
