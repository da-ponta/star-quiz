/**
 * Module dependencies.
 */
/*
var express = require('express')
  //, routes = require('./routes')
  //, user = require('./routes/user')
  ,http = require('http')
  ,io = require('socket.io')
,json = JSON.stringify;
//  , path = require('path');

var app = express();//express();

app.configure(function(){
  //app.set('port', process.env.PORT || 3000);*/
  /*
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));*/
  /*app.set('views', __dirname + '/views');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  //app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.logger());
});

app.configure('development', function(){
  express.logger("development mode");
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});*/
/*
app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
*/
/*
app.configure('production', function(){
  express.logger("production mode");
  app.use(express.errorHandler());
});

app.get('/', function(req, res){ 
  res.render('index.ejs', {
    locals: {
        title: 'Chat Room'
    }
  });
})
var server;
console.log("test start");
//if (!module.parent) {
server = http.createServer(app)
server.listen(3000);
//  app.listen(8080);
console.log("Express server listening on port %d", 8080);
//}
var socket = io.listen(server);

var count = 0;
socket.on('connection', function(client) {
  count++;
  client.broadcast(json({count: count}));
  client.send(json({count: count}));

  client.on('message', function(message) {
    // message
    client.broadcast(message);
    client.send(message);
  });
  client.on('disconnect', function() {
    // disconnect
    count--;
    client.broadcast(json({count: count}));
  });
});*/


 var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose');
/**
mongo connection
*/
mongoose.connect('mongodb://yuta0103:yuta0103@alex.mongohq.com:10073/quiz',function(e){
  if (e) throw e;
});
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;
var Answer = new Schema({
question_id : Number,
number : Number,
regist_date : Date
});
var QuizAnswer = new Schema({
    team_id     : Number
  , name        : String
  , answer      : [Answer]
  , point       : Number
  , time        : Number
  , regist_date : Date
});
var AnswerModel = mongoose.model('QuizAnswer', QuizAnswer);
/*var sample = new AnswerModel();
sample.team_id=1;
sample.name="test";
sample.answer  = [{ question_id: 0,
  number: 1,
  regist_date: new Date()}];
  sample.answer.splice(3,0,{ question_id: 0,
  number: 1,
  regist_date: new Date()});
sample.regist_date = new Date();
sample.time=0;
sample.point=0;
console.log(sample);
sample.save(function(e){
  console.log("save",e);
});*/
/*AnswerModel.find({},function(e,doc) {
  console.log("find",e,doc);
  AnswerLists = doc;
})*/
var AnswerLists = {};
var CURRENT_QUESTION = -1;
var CORRECT_ANSWER = [2,4,4,4,4,4,1,2,4,2,3,3,2,1,4,3,2,4,3,3,4,3,1,2];//TODO set as property
var REGIST_DATES = [];
var OPEN_FLAG = false;
/*end*/

var app = express();

 

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

 

app.configure('development', function(){
  app.use(express.errorHandler());
});

 

// index.ejsで変数portが参照できるように変更

// app.get('/', routes.index);

app.get('/answer', function(req, res) {
  res.render('index', { locals: { port: app.get('port'),title:"メディアオールスター感謝祭" } });
});

app.get('/question', function(req, res) {
  res.render('manage', { locals: { port: app.get('port'),title:"問題",q:CURRENT_QUESTION +2} });
});
app.post('/answer_check',function(req, res) {
  if (CURRENT_QUESTION < 0) return;
  var corrects = new Array();
  console.log(AnswerLists);
  for (var i in AnswerLists) {
    var user = AnswerLists[i];
    var ans = null;
    for (var a in user.answer) {
      if (user.answer[a].question_id == CURRENT_QUESTION) {
        ans = user.answer[a];
        break;
      }
    }
    if (ans && ans.number == CORRECT_ANSWER[CURRENT_QUESTION]) {
      var diff = ans.regist_date - REGIST_DATES[CURRENT_QUESTION];
      user.point++;
      user.time += diff/1000;
      user.save(function(e){
        if(!e) console.log(e);
      });
      corrects.push({name:user.name, time:diff / 1000});
    }
  };
  corrects.sort(function(c1,c2){
    return c1.time - c2.time;
  });
  //res.render('question', { locals: { port: app.get('port'), corrects: corrects} });
  var body = JSON.stringify(corrects);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', body.length);
  res.end(body);
})

var test_answer = 1;
app.post('/answer_check_test',function(req, res) {
  if (CURRENT_QUESTION < 0) return;
  test_answer = req.body.a;
  var corrects = new Array();
  console.log(AnswerLists);
  for (var i in AnswerLists) {
    var user = AnswerLists[i];
    var ans = null;
    for (var a in user.answer) {
      if (user.answer[a].question_id == 0) {
        ans = user.answer[a];
        break;
      }
    }
    if (ans && ans.number == test_answer) {
      var diff = ans.regist_date - REGIST_DATES[CURRENT_QUESTION];
      //user.point++;
      //user.time += diff/1000;
      //user.save(function(e){
      //  if(!e) console.log(e);
      //});
      corrects.push({name:user.name, time:diff / 1000});
    }
  };
  corrects.sort(function(c1,c2){
    return c1.time - c2.time;
  });
  //res.render('question', { locals: { port: app.get('port'), corrects: corrects} });
  var body = JSON.stringify(corrects);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', body.length);
  res.end(body);
})


app.post('/result', function(req, res) {
  var corrects = new Array();
  console.log(AnswerLists);
  for (var i in AnswerLists) {
    var user = AnswerLists[i];
    var ans = null;
    corrects.push(user);
  };
  corrects.sort(function(c1,c2){
    if (c1.point == c2.point)
      return c1.time - c2.time;
    else
      return c2.point - c1.point;
  });
  var body = JSON.stringify(corrects);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', body.length);
  res.end(body);
});

app.get('/users', user.list);

 

// ここを変更

//http.createServer(app).listen(app.get('port'), function(){

//  console.log("Express server listening on port " + app.get('port'));

//});

var server = http.createServer(app).listen(app.get('port'), function(){

  console.log("Express server listening on port " + app.get('port'));

});

 

// ここからSocket.IO周りの実装を追加 =====>
// Express3では、Http.ServerインスタンスをSocket.IOにアタッチしないとだめみたい
// 参照：http://socket.io/#how-to-use

var io = require('socket.io').listen(server);

io.of('/answer').on('connection', function(socket) {
  console.log('connect');
  socket.on('login', function(msg) {
    console.log(msg);
    if (!msg.match(/^[\S]+$/)) {
      socket.emit('login', false);
    }
    var user = AnswerLists[msg];
    if (!user) {
      user = new AnswerModel();
      user.team_id = Math.random() * 1000000;
      user.name = msg;
      user.answer =　[];
      user.regist_date = new Date();
      user.point = 0;
      user.time = 0;
      user.save(function(e){console.log("save",e)});
      AnswerLists[msg] = user;
    }
    socket.set('user', user, function() {
      socket.emit('login', true);
      if (OPEN_FLAG) {
        socket.emit("state",'ready');
      }
    });
    //socket.emit('message', msg);
    //socket.broadcast.emit('message', msg);
  });
  socket.on('answer', function(msg) {
    try {
      var data = JSON.parse(msg);
      if (OPEN_FLAG) {
        socket.get('user',function(e, user) {
          var name = user.name;
          var answer = {question_id:CURRENT_QUESTION,number:parseInt(data.answer), regist_date: new Date()};
          AnswerLists[name].answer.push(answer);
          //socket.emit('state', 'wait');
          console.log(user);
          AnswerLists[name].save(function(e){
            console.log("answer save",e);
          });
        })
      }
    } catch(e) {

    }
    //socket.emit('message', msg);
    //socket.broadcast.emit('message', msg);
  });
  socket.on('disconnect', function() {
    console.log('disconnect');
  });

});
io.of('/question').on('connection', function(socket) {
  var timeout;
  function changeState(state) {
    console.log(state);
    clearInterval(timeout);
    var client = io.of("/answer");//sockets;
    if (state == 'ready_go'&&!OPEN_FLAG) {
      CURRENT_QUESTION++;
      if (CURRENT_QUESTION>=CORRECT_ANSWER.length) CURRENT_QUESTION = 0;
      REGIST_DATES[CURRENT_QUESTION] = new Date();
      OPEN_FLAG = true;
      client.emit('state','ready');
      var count = 60;
      timeout = setInterval(function() {
        client.emit('count_down', count);
        socket.emit('count_down', count);
        count--;
        if (count<0) {
          changeState('ready_off');
          clearInterval(timeout);
        }
      }, 1000);
    } else if (state == 'ready_off'&&OPEN_FLAG) {
      OPEN_FLAG = false;
      client.emit('state', 'wait');
	clearInterval(timeout);
    } else if (state == 'ready_cancel'&&OPEN_FLAG) {
      OPEN_FLAG = false;
      client.emit('state', 'wait');
      CURRENT_QUESTION--;
	clearInterval(timeout);
    } else if (state == 'reset') {
	client.emit('state', 'wait');
	if (CURRENT_QUESTION < 0) return;
            var corrects = new Array();
            console.log(AnswerLists);
            for (var i in AnswerLists) {
                var user = AnswerLists[i];
                user.point = 0;
                user.time = 0;
                user.answer=[];
                user.save(function(e){
                    if(!e) console.log(e);
                });
	        console.log(user)
            };
       CURRENT_QUESTION = -1;	
    }
    client.emit('q', CURRENT_QUESTION+1);
    socket.emit('q',CURRENT_QUESTION+1);
  };
  socket.on('state', changeState);
});

// <===== ここまで

console.log('Server running at http://localhost:' + app.get('port') + '/');
