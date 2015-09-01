
var isIE501 = navigator.userAgent.indexOf("MSIE 5.01") > 0 ? true : false;
var isNN6 = navigator.userAgent.indexOf("Netscape6") > 0 ? true : false;
var isIE=document.all&&navigator.userAgent.indexOf("Opera")==-1;
var SKIP_VISIBLE = "#000";
var SKIP_INVISIBLE = "#fff";


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

function displayTagWithOnClick(address,text,title) {
	if(title==null) {
		title = text;
	}
	
	document.write('<div class=\"hsbcButtonLeft\"></div> <div class=\"hsbcButtonCenter\"><a href=\"#\" onClick=\"',address,'\" title=\"',title,'\">',text,'</a><i>.</i></div><div class=\"hsbcButtonRight\"></div>');
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


function switchProductsApply()
{
	var productsList = document.getElementById("jsProductsApply");
	if(productsList)
	{
		if(productsList.style.display=="none")
		{
			productsList.style.display="block";
		}
		else
		{
			productsList.style.display="none";
		}
	}
}


function restoreAccountDisplay() {
	state1 = getCookie("state1") == null ? "none" : getCookie("state1");
	state2 = getCookie("state2") == null ? "block" : getCookie("state2");
	switchAccountDisplay(state1, state2, false);
}

function setJSFunctionality()
{
	if(document.getElementById("jsSecondaryFunctionality"))
	{
		document.getElementById("jsSecondaryFunctionality").style.display = "block";
	}
	if(document.getElementById("jsSeperatePrintLink"))
	{
		document.getElementById("jsSeperatePrintLink").style.display = "inline";
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

function setfocus() {   
   var bFound = false;
  for (f=0; f < document.forms.length; f++)
  {
    for(i=0; i < document.forms[f].length; i++)
    {
      if (document.forms[f][i].type != "hidden" && document.forms[f][i].type != null && f != 0)
      {
        if (document.forms[f][i].disabled != true)
        {
            document.forms[f][i].focus();
            var bFound = true;
        }
      }
      if (bFound == true)
        break;
    }
    if (bFound == true)
      break;
   }
  }
  
function do_onload() {

        setfocus();
	setJSFunctionality();
	restoreAccountDisplay();

	if(document.getElementById("jsSiteMap")) {
		collapseAll()
	}
	
	if(document.getElementById("jsSiteMapBar")) {
		document.getElementById("jsSiteMapBar").style.display = "block";
	}
	
	if(document.getElementById("detail-switch")) {
		document.getElementById("detail-switch").style.display = "none";
		document.getElementById("show-detail-switch").style.display = "block";
		document.getElementById("hide-detail-switch").style.display = "none";
		document.getElementById("nojs-detail-switch").style.display = "none";
	}
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


function callUnHide() 
{
	document.getElementById("main").style.display = "";
}
