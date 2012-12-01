var ready = false;
var name;
$(function(){
	var socket = io.connect('localhost/question', { port: 3000 });
	var socket_g = io.connect('localhost', { port: 3000 });
    json = JSON.stringify;
	$("#ready_go").click(function(){
		socket.emit('state','ready_go');
	});
	$("#ready_off").click(function(){
		socket.emit('state','ready_off');
	});
	$("#ready_cancel").click(function(){
		socket.emit('state','ready_cancel');
	});
	$("#answer_check").click(function(){
		$("#manage").hide();
		$("#answer_check_page").show();
		$("#answer_check_page *").remove();
		function showCorrectUser(res) {
			console.log(res);
			for (var i=0;i<res.length;i++) {
				var correct = res[i];
				var u = $("<div></div>").height("2.53em").css("opacity",0);
				var name = $("<span>"+correct.name+"</span>").css("float","left");
				var time = $("<span>"+correct.time+"</span>").css("float","right");
				u.append(name).append(time)//.hide();
				$("#answer_check_page").append(u)
				u.delay(350*i).animate({opacity:1,height:"2em"},500);
			}
		}
		showCorrectUser([{name:"test", time:1},{name:"test", time:1},{name:"test", time:1},{name:"test", time:1}]);
		return;

		$.ajax({
			url:"/answer_check",
			dataType:"json",
			type:"POST",
			success:showCorrectUser,
			error:function(a,b,c){
				console.log(a,b,c)
			}
		})
	})
	socket.on('login', function(res){
		console.log(res);
		if (res) {
			$("#login_page").remove();
		} else {
			$("#login_page").show();
		}
	});
	socket.on('q', function(res){
		$("#q").text(res);
	})
});