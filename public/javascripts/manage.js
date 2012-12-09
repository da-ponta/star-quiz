var ready = false;
var name;
$(function(){
	var socket = io.connect('localhost/question', { port: 80 });
	var socket_g = io.connect('localhost', { port: 80 });
    json = JSON.stringify;
	$("#ready_go").click(function(){
		socket.emit('state','ready_go');
		return false;
	});
	$("#ready_off").click(function(){
		socket.emit('state','ready_off');
		return false;
	});
	$("#ready_cancel").click(function(){
		socket.emit('state','ready_cancel');
		return false;
	});

	function showCorrectUser(res) {
		console.log(res);
		if (!res || res.length == 0) {
			$("#answer_check_page").append("<div>正解者なし</div>")
		}
		$("#answer_check_page").append("<div style='background-color:#888'><span style='float:left'>チーム名</span><span style='float:right'>タイム</span><span style='float:right;margin-rights:30px'>得点</span></div>")
		for (var i=0;i<res.length;i++) {
			var correct = res[i];
			var u = $("<div></div>").height("2.53em").css("opacity",0);
			var name = $("<span>"+correct.name+"</span>").css("float","left");
			var time = $("<span>"+correct.time+"</span>").css("float","right");
			u.append(name).append(time)//.hide();
			if(correct.point)u.append($("<span>"+correct.point+"</span>").css({"float":"right", "color":"#ff4422","font-size":"130%","text-shadow":"2px 2px 1px white","margin-right": "30px"}));
			$("#answer_check_page").append(u)
			u.delay(350*(res.length-i)).animate({opacity:1,height:"2em"},500);
		}
	}
	$("#answer_check").click(function(){
		$("#manage").hide();
		$("#answer_check_page").show();
		$("#answer_check_page *").remove();
		//showCorrectUser([{name:"test", time:1},{name:"test", time:1},{name:"test", time:1},{name:"test", time:1}]);
		//return;

		$.ajax({
			url:"/answer_check",
			dataType:"json",
			type:"POST",
			success:showCorrectUser,
			error:function(a,b,c){
				console.log(a,b,c)
			}
		})
		return false;
	});
	$("#answer_result").click(function(){
		$("#manage").hide();
		$("#answer_check_page").show();
		$("#answer_check_page *").remove();

		$.ajax({
			url:"/result",
			dataType:"json",
			type:"POST",
			success:showCorrectUser,
			error:function(a,b,c){
				console.log(a,b,c)
			}
		});
		return false;
	});
	$("body").click(function(){
		$("#manage").show();
		$("#answer_check_page").hide();
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
	});
	socket.on('count_down', function(res){
		$("#count_down").text(res);
	})
});