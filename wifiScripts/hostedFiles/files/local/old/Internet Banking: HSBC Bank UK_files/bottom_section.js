
var ap = /(id|acc|prod)[^=]+(=|)(\d){6,}/gi;

if(_tag && _tag.dcsCollect && !ap.test(document.referrer) && !ap.test(document.location.href)){
  _tag.dcsCollect();
}	


// Quick wins tranche 4. Replace help icon on payments/sodds etc. 

( function($) {

	var newImgLoc = $('#logo img').attr('src').split('/content')[0]+'/content/pws/theme/personal_ib/images/helpcentre/icon_tooltip.png';

	//$('td.extTableColumn1 a.hsbcContextualHelp img').attr('src', newImgLoc);
	$('a.hsbcContextualHelp img').attr('src', newImgLoc);

} ) ( jQuery );
