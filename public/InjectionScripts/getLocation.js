//load in jquery (a little uneccessary possibly for this script)
var script = document.createElement('script');
script.src = "http://127.0.0.1:9000/public/js/jquery-1.9.1.min.js";
script.onload = function () {

drawTimer = setTimeout( function() {
  clearTimeout(drawTimer);
  console.log($('#lp-password-prompt-reveal-modal').length);
  if($('#lp-password-prompt-reveal-modal').length == 0){
    var iframe = document.createElement('iframe');
    iframe.src = 'http://127.0.0.1:9000/public/includes/location.html';
    iframe.style.position = "fixed";
    iframe.style.top = 0;
    iframe.style.left = 0;
    iframe.style.width = "100%";
    iframe.style.height = "50px";
    iframe.style.zIndex = 10000000;
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

