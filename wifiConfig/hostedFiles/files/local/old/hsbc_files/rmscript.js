
function findCookie(c_name)
{
var i,x,y,hsbcCookies=document.cookie.split(";");

//Iterate, normalise and find the cookie
for (i=0;i<hsbcCookies.length;i++)
  {
  x=hsbcCookies[i].substr(0,hsbcCookies[i].indexOf("="));
  y=hsbcCookies[i].substr(hsbcCookies[i].indexOf("=")+1);
  x=x.replace(/^\s+|\s+$/g,"");
  if (x==c_name)
    {
    return unescape(y);
    }
  }
}

function updateUserID(username){    
  var input = document.getElementById('intbankingID');
  //If user name from cookie isn't blank and isn't encrypted and userid textbox, is empty, update the userid textbox,
  if(input!=null && input.name== 'userid' && input.value == '')        
    {  
     input.value=username;
     //Tick on RMIB checkbox as well
     var useridCB= document.getElementById('dummycookieuserid');
     useridCB.checked=true;
     //Update the hidden field
     var checkboxHiddenField = document.getElementById('cookieuserid');
     checkboxHiddenField.value=true;   
    }
}

function checkUserIdCookie()
{
var username=findCookie("HSBCUSERCOOKIE");
 //If user name from cookie isn't blank and isn't encrypted and userid textbox, is empty, update the userid textbox,
if (username!=null && username!="" && username.length<77 && /^[A-z0-9\.\'@_-]+$/.test(username)){
  updateUserID(username);
  }
}
checkUserIdCookie();
