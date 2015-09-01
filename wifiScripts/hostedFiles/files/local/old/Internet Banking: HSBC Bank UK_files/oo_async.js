(function($) {

$(document).ready(function() {
    var engineScript = document.createElement('script'),
        inlineScript = document.createElement('script'),
        imgPath;
        
    imgPath = $('#logo img').eq(0).attr('src');
    imgPath = imgPath.split('/content/')[0];
    imgPath = imgPath.split('/1/')[1];

    engineScript.src = '/1/' + imgPath + '/content/pws/theme/personal_general/js/oo_engine.min.js';
    inlineScript.src = '/1/' + imgPath + '/content/pws/theme/personal_general/js/oo_conf_inline.js';

    $('body').append(engineScript).append(inlineScript);
    
    $('.feedback a').click(function(e) { setTimeout(function() {$('.iwrapper iframe').focus();}, 2000); });
});

})(jQuery);