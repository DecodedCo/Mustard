$('#grid, .contentSegment').find('font:contains("This portlet is temporarily disabled")').each(function(){
	dcsMultiTrack('DCS.dcsuri','/pib_logon_CAM10_unavailable');
	var cam10refpatt = /cam10refreshed=[0-9]+/gi, cam10refreshed = (cam10refpatt).test(document.cookie) ? parseInt(document.cookie.match(cam10refpatt)[0].split('=')[1]) : 0;
	if(cam10refreshed <= 3){document.cookie='cam10refreshed='+(cam10refreshed+1); top.location = top.location};
});