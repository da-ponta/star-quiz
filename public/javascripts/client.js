var ready = false;
var name;
$(function(){
	var socket = io.connect('localhost/answer', { port: 80 });//new io.Socket('localhost',{port:3000}),
    json = JSON.stringify;
	/*socket.on('message', function(message) {
	  	message = JSON.parse(message);
	  	if (message.count) {
	    	$('#count').text(message.count);
	  	}
	  	if (message.message) {
	    	var data = message.message;
	    	var date = new Date();
	    	date.setTime(data.time);
    		$('#chatBody').append('<div class="chatlog"><p><a name=' + data.time + '>' + data.text + '</p>'+date.toString()+'</div>')
  		}
	});*/
	$("form").submit(function(){
		return false;
	})
	var userName;
	function login(name) {
		userName = name;
		socket.emit('login', name);
	}
	if (localStorage && localStorage.userName) {
		name = localStorage.userName;
		login(name);
		$("#login_page").hide();
		$("#wait").show();
	} else {
		$("#login").click(function(){
			var name = $("#username").val();
			if (name.match(/^.*[\S]+.*$/)) {
				login(name);
			} else {
				alert("空白だけ入力するとは何たる不届きものめ！");
			}
			return false;
		})
	}
	socket.on('login', function(res){
		console.log("login:"+res);
		if (res) {
			localStorage.userName = userName;
			console.log(localStorage.userName);
			$("#login_page").remove();
		} else {
			$("#login_page").show();
		}
	});
/*
	function send() {
	  var name = $('#name').val();
	  var text = $('#text').val();
	  if (text) {
	    var time = new Date().getTime();
	    socket.emit('answer',json({answer:1}));
	    $('#text').val('');
	  }
	  return false;
	}
	$("#send").click(send);*/
	$("#answer input").click(function(){
		if (!ready) return false;
		ready = false;
	    $("#answer").hide();
		$("#wait").show();
	    $("#last_answer").text("選択した回答　：　"+$(this).val());
	    socket.emit("answer",json({answer : $(this).val()}));
	});
	socket.on("state", function(res){
		console.log(res);
		if (res == "ready") {
			$("#wait").hide();
			$("#answer").show();
			ready=true;
		} else if (res == "wait") {
			$("#answer").hide();
			$("#wait").show();
		}
	});
	socket.on('q', function(res){
		$("#q").text(res);
	});
	socket.on('count_down', function(res){
		$("#count_down").text(res);
	})

});