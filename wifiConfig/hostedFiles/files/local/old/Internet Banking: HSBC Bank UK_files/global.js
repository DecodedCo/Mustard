// MCM reporting fix
//var execScript = execScript || function(){};

//PIB
(function($){
	
	var fixForm = function(node, idnum){
		var params = node.href.split('?')[1].split('&'),
			plength = params.length,
			frm = '<form type="hidden" id="QLdyn_'+idnum+'" method="POST" action="'+node.href.split('?')[0]+'"><input type="submit" style="width:0px;height:0px;position:absolute;left:-9999px;" value="'+$.trim(node.text)+'" title="'+node.title+'" name="'+node.alt+'">',
			$frm,
			tmparams = [];
			
			while(plength--){
				tmparams = params[plength].split('=');
				frm += '<input type=hidden name="'+$.trim(tmparams[0])+'" value="'+$.trim(tmparams[1])+'"/>';
			}
			frm += '</form>';
		
		$frm = $(frm);
		node.href = node.href.indexOf('?') > 1 ? node.href.split('?')[0] : node.href;
		$(node).click(function(e){e.preventDefault();$frm.submit()}).parent().append($frm);
		
	};

	$(document).ready(function(){
		$('body a[href*="?"]').each(function(i){
			if((/(&|\?){1}[^&]?(acc|prod){1}[^&]+(\d){6,}/gim).test(this.href)) fixForm(this, i);
		});
	});
	
}(jQuery));


(function($) { 
    var productsToCompare = []; //empty variable for passing list of products to compare to grid view

    function hideTbContent(hideThis) {
        var tbContainer = $(hideThis);
        //hides all mid content which does not contain open class
        $('#productTable').attr('aria-live','polite').attr('aria-relevant', 'all');
        tbContainer.find('.open').attr('aria-hidden', false);
        tbContainer.find('.midContent:not(.open)').attr('aria-hidden', true).hide().prev().find('.sectionType').addClass('closed');
		
        $('.subHeader a').click(function(e){
            var trSubHeader = $(this).parents('.subHeader');
            e.preventDefault();
            if(trSubHeader.next('.midContent').is(':visible')) {
                trSubHeader.find('.sectionType').addClass('closed');
                trSubHeader.next('.midContent').fadeOut('slow').attr('aria-hidden', true);
            }
            else {
                trSubHeader.find('.sectionType').removeClass('closed');
                trSubHeader.next('.midContent').fadeIn('slow').attr('aria-hidden', false);
            }					
        });
    }

    // Fixed table header : Start
    if (typeof oldIe === "undefined") {
        var oldIe = false;
    }

    var CompareAcc = (function (a) {
        return function (c) {
            var b = this;
            this.formName = c;
            this.lastPostData = "";
            this.resultsContainer = null;

            this.init = function () {
                this.resultsContainer = a("#productTable" + this.formName);
                this.fixedTableHeader();
            };
			
            this.fixedTableHeader = function () {
                var e = this.resultsContainer.find("table#productComparison");
                if (!e.length) {
                    return;
                }
                if (oldIe && (e.offset().top !== e.positionedOffset().top)) {
                    return;
                }
                var d = "fixed-table-header" + this.formName;
                a("#" + d).remove();
                e.fixedTableHeader({
                    addClass: "productComparison",
                    addId: d
                });
            };
			
            this.init();
        };
    })(jQuery);
		
    (function (b) {
        var a = 0;
        b.fn.fixedTableHeader = function (c) {
            var d = jQuery.extend({
                headerRowSize: 3,
                highlightRow: false,
                highlightClass: "highlight",
                addClass: "",
                addId: true,
                appendToParent: false,
                appendTo: "body"
            }, c);
            return this.each(function () {
                var h = b(this);
                var f = h.find("tr:lt(" + d.headerRowSize + ")");
                var e = "th";
                if (f.find(e).length === 0) {
                    e = "td";
                }
                if (f.find(e).length > 0) {
                    f.find(e).each(function () {
                        b(this).css("width", b(this).width());
                    });
                    var g = h.clone().empty();
                    if (d.addId === true) {
                        g.attr("id", "fixed-table-header" + a);
                    } else {
                        if (d.addId) {
                            g.attr("id", d.addId);
                        }
                    }
                    a++;
                    g.addClass(d.addClass).css({
                        position: "fixed",
                        top: "0",
                        left: h.offset().left
                    }).append(f.clone()).width(h.outerWidth()).hide();
                    if (d.appendToParent) {
                        g.appendTo(h.parent());
                    } else {
                        g.appendTo(b(d.appendTo));
                    }
                    if (d.highlightRow) {
                        b("tr:gt(" + (d.headerRowSize - 1) + ")", h).hover(function () {
                            b(this).addClass(d.highlightClass);
                        }, function () {
                            b(this).removeClass(d.highlightClass);
                        });
                    }
                    b(window).scroll(function () {
                        var j = b(window).scrollTop();
                        var i = f.offset().top;
                        if (jQuery.browser.msie && jQuery.browser.version === "6.0") {
                            g.css({
                                position: "absolute",
                                top: j,
                                left: h.offset().left
                            });
                        } else {
                            g.css({
                                position: "fixed",
                                top: "0",
                                left: h.offset().left - b(window).scrollLeft()
                            });
                        }
                        if (j > i && j <= (i + h.height() - f.height())) {
                            g.show();
                        } else {
                            g.hide();
                        }
                    });
                    b(window).resize(function () {
                        if (g.outerWidth() !== h.outerWidth()) {
                            f.find(e).each(function (j) {
                                var i = b(this).width();
                                b(this).css("width", i);
                                g.find(e).eq(j).css("width", i);
                            });
                            g.width(h.outerWidth());
                        }
                        g.css("left", h.offset().left);
                    });
                }
            });
        };
    })(jQuery);
		

    // Fixed table header : End

    function setEqualHeight(columns){
        var tallestcolumn = 0;
        columns.each(function(){
            currentHeight = $(this).height();
            if(currentHeight > tallestcolumn){
                tallestcolumn  = currentHeight / 16 * 16 + 20 + "px";
            }
        });
        columns.height(tallestcolumn);
    }

    function productCounter (view){
        var numberOfProducts;
        numberOfProducts = $('#productComparison tr:first-child th').length -1;
        $('ul li a b').html(numberOfProducts);
        return false;
    }

    function zebra (){
        var productComparison = $('#productComparison tr');
        productComparison.find('th:odd,td:odd').attr('class','odd');
        productComparison.find('th:even,td:even').attr('class','even');
        productComparison.find('td:first-child, th:first-child').attr('class','');
    }

    function prepareTable(){
        var numberOfProducts = $('#productComparison tr:first-child th').length -1;
        var totalColumns = parseInt(numberOfProducts, 10) + 1;
        $('ul li a b').text(numberOfProducts);
        var containerwidth = $('#productComparison').parent().width();
        var columnWidth = containerwidth - 130;
        var getColumnWidth = (columnWidth / numberOfProducts) - 40;
        productCounter ('grid');
		
        zebra();
		
        return false;
    }

    function moreLinks(){
        var productComparison = $('#productComparison tr a.more');
        productComparison.parent().next('p').hide().attr('aria-hidden', true);
        productComparison.click(function(e){
            e.preventDefault();
            if($(this).hasClass('open')) {
                $(this).removeClass('open').parent().next('p').slideUp().attr('aria-hidden', true);
            }
            else {
                $(this).toggleClass('open').parent().next('p').slideDown().attr('aria-hidden', false);
            }
        });
    }


    function moreProductDetailsLinks(){
        var productDetails = $('#grid .more');
        var productDetailsTable = $('#grid');
        var productDetailsLink = $('#grid .more a');
        var productDetailsContent = $('#grid .moreDetails');
        productDetailsTable.attr('aria-live','polite').attr('aria-relevant',
            'all');
        productDetails.css({
            'display':'block'
        });
        productDetailsContent.hide().attr('aria-hidden', true);

        productDetailsLink.click(function(e){
            e.preventDefault();
            if($(this).parent().hasClass('open')) {
                $(this).parent().removeClass('open');
                $(this).parent().prev('div').slideUp().attr('aria-hidden', true);
                $(this).html('Show more');
            }
            else {
                $(this).parent().toggleClass('open');
                $(this).parent().prev('div').slideDown().attr('aria-hidden', false);
                $(this).html('Show less');
            }
        });
    }


    function checkURLHash(){ 
        if(location.href.indexOf("#") !== -1 && window.location.hash !== '#' && window.location.hash !== '' ) { 
            return true;
        }
        return false;
    }

    function scrollToElement(e){ 
        var d = 0;
        if (e.length > 0) {
            if ($.browser.msie) {
                d = 20;
            }

            $('html,body').delay(d).animate({
                scrollTop: e.offset().top
            }, {
                duration: 'fast', 
                easing: 'swing'
            });
        }
    }

    /***** new carousel ****/
    $.fn.infiniteCarousel = function () {

        function repeat(str, num) {
            return new Array( num + 1 ).join( str );
        }
	  
        return this.each(function () {
            var $carouselWrapper = $('> div', this).css('overflow', 'hidden'),
            $slider = $carouselWrapper.find('> ul'),
            $items = $slider.find('> li'),
            $single = $items.filter(':first'),
            singleWidth = $single.outerWidth(), 
            visible = Math.ceil($carouselWrapper.innerWidth() / singleWidth), // note: doesnt include padding or border
            currentPage = 1,
            pages = Math.ceil($items.length / visible),
            wait = "";            
			
            function doAutScroll(){
                return gotoPage(currentPage + 1);
            }

            // setInterval and ClearInterval	
            var intervalWait = {
                wait: '',
                start: function (myFunction, speed) {
                    this.wait = setInterval(myFunction, speed || 9000);
                },
				
                stop: function () {
                    clearInterval(this.wait);
                }
            };

            // call autoScroll
            intervalWait.start(doAutScroll);
			
            // 1. Pad so that 'visible' number will always be seen, otherwise create empty items
            if (($items.length % visible) !== 0) {
                $items = $slider.find('> li');
            }
		
            // 2. Top and tail the list with 'visible' number of items, top has the last section, and tail has the first
            $items.filter(':first').before($items.slice(- visible).clone().addClass('cloned'));
            $items.filter(':last').after($items.slice(0, visible).clone().addClass('cloned'));
            $items = $slider.find('> li'); // reselect
		
            // 3. iterate through the list and create list-nav elements
            function getImgSiblings(pages){
                var totalItem = $items.length,
                getImg = $slider.find('img'),
                thisTab = $('.carouselWrapper li a.carouselTab'),
                thisChildren = $('.carouselWrapper li:not(.cloned) a.carouselTab'),
                thelastChild = $('.carouselWrapper li a.carouselTab:eq(2)'),
                itemList = $('.carouselWrapper li');
				
                $('.carouselWrapper').parent().attr('aria-live','polite').attr('aria-relevant', 'all');
				
                thisTab.css({
                    'display':'none'
                });
                thisChildren.css({
                    'display':'block'
                });
											
                // iterate only on the original list not cloned ones and assigned id attribute
                itemList.each(function(){
                    if($(this).hasClass("cloned")){
                        $(this).removeAttr('id');
                    }
                });
				
                thisTab.each(function(pages){
                    $(this).bind('mouseover focusin', function(e){ 
                        intervalWait.stop();
                        $('#hero').trigger('goto', [ pages ]);
                    });
					
                    $(this).bind('click', function(e){ 
                        e.preventDefault();
                        intervalWait.stop();
                        $('#hero').trigger('goto', [ pages ]);
                    });
					
                });
				
                $('.carouselWrapper li').each(function(pages){
                    $('.carouselWrapper li').bind('mouseover focusin', function(e){ 
                        intervalWait.stop();
                    });
                });	
				
                $('#hero').each(function(pages){
                    $('#hero').bind('focusout mouseleave', function(e){
                        intervalWait.start(doAutScroll);
                    });
				
                });	
			
                // set tab
                thisChildren.each(function(pages){
                    var totalTab = parseInt (thisChildren.lengthv, 10),
                    setLeft = parseInt (940 / totalTab * pages, 10),
                    setTabWidth = parseInt (940 / totalTab - 34, 10);
									
                    $(this).css({
                        'left': setLeft,
                        'width': setTabWidth
                    });	
					
                    var getW = parseInt (thelastChild.width(), 10);
                    if ($(".carouselWrapper li:last a.carouselTab")) {
                        $(".carouselWrapper li:last a.carouselTab").width(getW).css({
                            'left':0
                        });
                    }	
                });	
            }
				
            // 4. Set the left position to the first 'real' item
            $carouselWrapper.scrollLeft(singleWidth * visible);
				
            // the last carousel equal the first carousel.	
            $(".carouselWrapper li.cloned:last a.carouselTab").addClass("current");
            $('.carouselWrapper .tabArticleText').css({
                'display':'none'
            });
            $('.carouselWrapper li:eq(1) a.carouselTab').addClass('current');
            $(".carouselWrapper li:eq(1) a.carouselTab").siblings('.tabArticleText').fadeIn('fast');
				
            // 5. paging function
            function gotoPage(page) {
                var itemList = $('.carouselWrapper li');
                var dir = page < currentPage ? -1 : 1,
                n = Math.abs(currentPage - page),
                left = singleWidth * dir * visible * n;
				
                $carouselWrapper.filter(':not(:animated)').animate({
                    scrollLeft : '+=' + left
                }, 500, function () {
					
                    $(".carouselWrapper li a.carouselTab").removeClass("current"); // remove cless="current" from previous
                    $(".carouselWrapper .tabArticleText").css({
                        'display':'none'
                    });
									
                    if (page === 0) {
                        $carouselWrapper.scrollLeft(singleWidth * visible * pages);
                        page = pages;				
						
                    } else if (page > pages) {
                        $carouselWrapper.scrollLeft(singleWidth * visible);
                        // reset back to start position
                        page = 1;
                    } 
		
                    currentPage = page;
                    var whichTabIndex = $(".carouselWrapper li a.carouselTab").eq(page);
                    //check if current list image/carousel of index eq 0 then highlight
                    if(currentPage===1){
                        $(".carouselWrapper li.cloned:last a.carouselTab").addClass("current");
                        $('.carouselWrapper li:eq(1) a.carouselTab').addClass('current');	
                        if ($('.carouselWrapper li:eq(1) a.carouselTab').hasClass("current")) {
                            $('.carouselWrapper li:eq(1) a.carouselTab').siblings(".tabArticleText").fadeIn('fast');
                        }				
                    }else{	
                        whichTabIndex.addClass("current");
                        if(whichTabIndex.hasClass("current")){
                            whichTabIndex.siblings(".tabArticleText").fadeIn('fast');
                        }
                    }
                });                
                return false;
            }
			
            getImgSiblings();
			
            // create a public interface to move to a specific page
            $(this).bind('goto', function (event, page) {
                gotoPage(page);
            });
        });  
    };
    // new carousel ends



    $.fn.absTableCellCreator = function() {
        var $el;
        return this.each(function() {
            $el = $(this);
            var newDiv = $("<div />", {
                "class": "innerWrapper",
                "css"  : {
                    "width"   : "100%",
                    "position": "relative"
                }
            });
            $el.wrapInner(newDiv);
        });
    };



    $(document).ready(function() {

        //popup close button 

        $(".closeWin").click(function(e){
            e.preventDefault();
            window.close();
        });
		
        //stop background image flicker in IE
        try {
            document.execCommand('BackgroundImageCache', false, true);
        } catch(e) {}
		
        $.PopupMenu.init();
        $.PillarPagination.init();
        callRevolver();
        $.tabs.init();
		
        /*- / - help/info --*/
		
        var formRegion = $('#mortgageForm');
        var formHelpLink = $('#mortgageForm li .help a');
		
        formRegion.attr('aria-live','polite').attr('aria-relevant', 'all');
		
		
        formHelpLink.bind('mouseover focusin', function(e){
            $(this).parents('li').find('div').show().attr('aria-hidden', false);												
        });
		
        formHelpLink.click(function (e) {
            e.preventDefault();
            $(this).parents('li').find('div').show().attr('aria-hidden', false);
        });
			
        formHelpLink.bind('mouseout focusout', function(e){
            $(this).parents('li').find('div').hide().attr('aria-hidden', true);
        });
		
        $('.contactUsSelect select').val(0);
        $('.contactUsRow').hide().attr('aria-hidden', true).eq(0).show().attr('aria-hidden', false);
        $('.contactUsSelect form').customSelect({
            maxHeight: 1000,
            zIndexStart: 100
        }).bind('onchangecustomselect', function(e, selectedIndex) {
            $('.contactUsRow').hide().attr('aria-hidden', true).eq(selectedIndex).show().attr('aria-hidden', false);
        });
        $('.contactUsRow').parent().attr('aria-live','polite').attr('aria-relevant', 'all');
        $('.contactUsRow h4').css({
            'position':'absolute', 
            'left':'-9999px'
        });
		
		
        $('.supportRow').attr('aria-live','polite').attr('aria-relevant', 'all');
        var $supportContent = $('.supportContent').hide().attr('aria-hidden', true);
		
        $('.supportBox li').each(function(i){
            var $listItem = $(this);
            $listItem.find('a').click(function(e) {
                e.preventDefault();				
                if($listItem.hasClass('selected')){
                    $supportContent.eq(i).slideUp('slow').attr('aria-hidden', false);
                    $listItem.removeClass('selected')
                }
                else{
                    // $supportContent.hide().attr('aria-hidden', true);
                    $(this).parents('.supportRow').find('.supportContent').hide().attr('aria-hidden', true);
                    $supportContent.eq(i).slideDown('slow').attr('aria-hidden', false);
					
                    $listItem
                    .addClass('selected')
                    .siblings().removeClass('selected');
                }
            });
        });
        /*- / - help/info for tables --*/
		
        $("th.relativePos").absTableCellCreator();
		
        var tableRegion = $('.insuranceRow .contentItem table');
        tableRegion.attr('aria-live','polite').attr('aria-relevant', 'all');
		
        var tableHelpLink = $('table th .help a');
        tableHelpLink.parent().css('display','block');
		
        var tableHelpContent = $('table th div.helpText');
        tableHelpContent.attr('aria-hidden', true);
		
        tableHelpLink.bind('mouseover focusin', function(e){
            $(this).parents('th').find('div.helpText').show().attr('aria-hidden', false);
        });	
        tableHelpLink.click(function (e) {
            e.preventDefault();
            $(this).parents('th').find('div.helpText').show().attr('aria-hidden', false);
        });		
        tableHelpLink.bind('mouseout focusout', function(e){
            $(this).parents('th').find('div.helpText').hide().attr('aria-hidden', true);
        });

		
        /* remove outline and text-decoration when mouseDown on links ****/	
		
        var skipLinks = $('li.skipLink a');
        skipLinks.each(function(){
            var that = $(this);
            var link = $('div#innerPage a:eq(0)');
            that.click(function(e) {
                e.preventDefault();
                link.focus();
            });
        });
		
        var lastLink = $('p.skipLinkLast a');
        lastLink.each(function(){
            var that = $(this);
            var levelList = $("#sections li.level1");
            var link = $('div#innerPage a:eq(0)');
            that.click(function(e) {
                e.preventDefault();
                levelList.removeClass('focused');
                levelList.find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px");
                link.focus();
            });
        });
		
        var utilityLinks = $('div#mainTopUtility #tabs a');
        utilityLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'text-decoration':'none'
                });
            });
        });
		
        var localeLinks = $('div#mainTopUtility #locale a');
        localeLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'text-decoration':'none'
                });
            });
        });
		
        var logoLinks = $('div#logo a');
        logoLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'outline':'0'
                });
            });
        });
		
        var aPillarLinks = $('#advance a.pillarArrow');
        aPillarLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'border-color':'#7b7b7b'
                });
            });
        });
		
        var pPillarLinks = $('#premier a.pillarArrow');
        pPillarLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'border-color':'#181236'
                });
            });
        });
		
        var helpLinks = $('#mortgageForm span.help a');
        helpLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'border-color':'#e5e5e5'
                });
            });
        });

        var tableLinks = $('.contentItem table tbody tr th span.help a');
        tableLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'border-color':'#f0f0f0'
                });
            });
        });
		
        var tableOddLinks = $('.contentItem table tbody tr.odd th span.help a');
        tableOddLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'border-color':'#e4e4e4'
                });
            });
        });
		
        var bannerLinks = $('div.doormat .info a');
        bannerLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'border-color':'#6d6d6d'
                });
            });
        });
		
        var bannerItemLinks = $('div.bannerItem a');
        bannerItemLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'border-color':'transparent'
                });
            });
        });
		
        var promoLinks = $('div.contentRow .promo a');
        promoLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'border-color':'#fff'
                });
            });
        });
		
        var navLinks = $('a.mainTopNav');
        navLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'text-decoration':'none'
                });
            });
        });
		
        var toggleLinks = $('a.hasMore');
        toggleLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'text-decoration':'none'
                });
            });
        });
		
        var tabLinks = $('a.carouselTab');
        tabLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'text-decoration':'none'
                });
            });
        });
		
        var handleLinks = $('div.handle a');
        handleLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'text-decoration':'none'
                });
            });
        });
		
        var ptabLinks = $('#productTabs li a');
        ptabLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'text-decoration':'none'
                });
            });
        });
		
        var pgtabLinks = $('#pageTabs li a');
        pgtabLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'text-decoration':'none'
                });
            });
        });
		
        var cLinks = $('div#grid a');
        cLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'outline':'0'
                });
            });
        });
		
        var closeLinks = $('.jqmWindow .close a span');
        closeLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'outline':'0'
                });
            });
        });
		
        var overLinks = $('.jqmWindow a');
        overLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({

                    'outline':'0'
                });
            });
        });
		
        var langLinks = $('div.langList a');
        langLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'text-decoration':'none'
                });
            });
        });
		
        var greyButtonLinks = $('a.greyBtn');
        greyButtonLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'text-decoration':'none'
                });
            });
        });
		
        var customSelect = $('.customSelectMenu .value');
        customSelect.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'text-decoration':'none'
                });
            });
        });
		
        var redButtonLinks = $('a.redBtn');
        redButtonLinks.each(function(){
            var alink = $(this);
            alink.mousedown(function(e){
                alink.css({
                    'text-decoration':'none'
                });
            });
        });
		
        var allInputs = $('input[type="submit"]');
        allInputs.each(function(){
            var inputlink = $(this);
            inputlink.mousedown(function(e){
                inputlink.css({
                    'border':'0', 
                    'outline':'0'
                });
            });
        });
		
        // new carousel
        $('#hero').infiniteCarousel();

        /* SETEQUALHEIGHTS ****/
        setEqualHeight($(".productFeature"));
        setEqualHeight($("#sideBar > section.widthBotBorder"));
        setEqualHeight($(".tabcontents .grid_5i, .exploreBox .grid_4i"));
		
        /* SEARCH FORM  *******/
        q = $('#q');
        q.focus(function() {
            $(this).css({
                'background':'none',
                'background-color':'#fff',
                'color':'#626469'
            });
            if ((q.val()) === "Search") {
                $(this).attr('value','');
            }
        });
			
        q.blur(function() {
            $(this).removeAttr('style');
            if($(this).val() === "") {
                $(this).attr('value', 'Search');
            }
        });

		
        /* toggle locator */
        var locatorList = $(".locator a.greyBtn"); 
        locatorList.each(function(){
            var thatLocation = $(this);
            thatLocation.click(function(e){
                e.preventDefault();
                thatLocation.siblings(".linkList").slideToggle('fast',function(){});
                thatLocation.siblings(".linkList").bind('mouseleave',function(){
                    $(this).css('display','none');
                });
		
            });		
        });

        /* LOCALE **********/
        var cntryList = function(){
            var listContainer = $("#locale .dropDownLink"),
            theDropdown = $('#dropDown'),
            dropdownContainer = $('#dropDownWrapper'),
            dropdownLink = $('#dropDown p.skipLink a');
			
			
            listContainer.attr('aria-controls', '#dropDown');
            theDropdown.css('display', 'none').addClass('showDropDown');
            theDropdown.attr('aria-live','polite').attr('aria-relevant', 'all');
					
            listContainer.click(function(e) {
                e.preventDefault();
                if(listContainer.hasClass('on')){
                    listContainer.removeClass('on');
                    theDropdown.fadeOut("slow", function() {}).attr('aria-expanded', false);
                    theDropdown.parent().css('z-index', '1');
                    theDropdown.parent().find('select').css('visibility', 'visible');
                }
                else {
                    listContainer.addClass('on');
                    theDropdown.fadeIn("slow", function() {}).attr('aria-expanded', true);
                    theDropdown.parent().css('z-index', '20');
                    theDropdown.find('a:eq(1)').focus();
                    theDropdown.parent().find('select').css('visibility', 'hidden');
                }
            });
			
            dropdownLink.click(function(e) {
                e.preventDefault();
                listContainer.removeClass('on');
                theDropdown.fadeOut("slow", function() {}).attr('aria-expanded', false);
                theDropdown.parent().css('z-index', '1');
                theDropdown.parent().find('select').css('visibility', 'visible');
                listContainer.focus();				
            });
			
            $('#dropDown .nav li a.hasMore').each(function(){
                var thisTab = $(this);
                var thisDropDown = $(this).next("div");
				
                thisDropDown.attr('aria-hidden', true);
									
                thisTab.bind('focusin mouseover', function(){
                    thisTab.addClass('on');
                });
				
                thisTab.bind('focusout mouseleave', function(){
                    thisTab.removeClass('on');
                });
				
                thisTab.click(function(e) {
                    e.preventDefault();
                    if(thisTab.hasClass('on')){
                        thisTab.removeClass('on');
                        thisTab.addClass('up');
                        thisDropDown.slideDown('slow', function(){}).attr('aria-hidden', false);
                    }
                    else {
                        thisTab.removeClass('up');
                        thisTab.addClass('on');
                        thisDropDown.slideUp('slow', function(){}).attr('aria-hidden', true);
                    }
                });
				
            });
			
            $('#dropDown .nav li a.parent').bind('focusin mouseover', function(){
                if($('#dropDown .nav li a[class~="up"]')){
                    $('#dropDown .nav li a[class~="up"]').next("div").attr('aria-hidden', true).slideUp('slow', function(){});
                    $('#dropDown .nav li a[class~="up"]').removeClass('up');
                }
                else {
                    return false;
                }
            });
        };
		
        cntryList();  // call function to display locale country list 

        /* LOCALE **********/
        var logonList = function(){
            var listContainer = $("#authenticate"),
            theDropdown = $('#logon'),
            listParent = $('#authenticate').parents('ul');
			
            theDropdown.attr('aria-hidden', true);
            listParent.attr('aria-live','polite').attr('aria-relevant', 'all');
			
            listContainer.click(function(e) {
                e.preventDefault();
                if(listParent.hasClass('on')){
                    theDropdown.fadeOut("slow", function() {}).attr('aria-hidden', true);
                    listParent.removeClass('on');
                }
                else {
                    listParent.addClass('on');
                    theDropdown.fadeIn("slow", function() {}).attr('aria-hidden', false);
                }
            });

            theDropdown.bind('mouseleave', function(){
                theDropdown.fadeOut("slow", function() {}).attr('aria-hidden', true);
                listParent.removeClass('on');
            });
			
            $('#mainTopNavigation').focusin(function() {
                theDropdown.fadeOut("slow", function() {}).attr('aria-hidden', true);
                listParent.removeClass('on');
            });
			
        };
		
        logonList();  // call function to display locale country list 

        // main nav starts
        var mainNav = $("#sections li.level1"),
        mainNavTop = $("#sections li.level1 .mainTopNav"),
        doormatList = $("#sections li.level1 div.doormat");
        doormatCloseTabLinks = $("#sections li.level1 div.doormat a.closeDoormatTab");
		
		var navFadeTimerIn;
		var navFadeTimerOut;
		var doormatActiveTimer;
		var doormatFlags = 0;
		var doormatActive = 0;
		
		
        mainNavTop.attr('title', function(i, val) {
            return 'Expand menu: ' + val; 
        });
		
        doormatList.css("display", "block").attr('aria-hidden', true);
        //doormatList.css("display", "none").attr('aria-hidden', true);
		
        $('#sections').attr('aria-live','polite').attr('aria-relevant', 'all');
		
		// splitting mouseover and focus events to improve link navigation by tab key
        // touch env. reset & support
		
		var touchStartTime;
		var touchStartLocation;
		var touchEndTime;
		var touchEndLocation;

				

		var ua = navigator.userAgent.toLowerCase();
		var isAndroid = ua.indexOf("android") > -1;

    
var onMouseOver = function(that){
 	doormatFlags = 1;
	clearTimeout(navFadeTimerIn); //clear timer

	that.prevAll().removeClass('focused');
	that.prevAll().find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px");
	that.nextAll().removeClass('focused');
	that.nextAll().find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px");
	that.addClass('focused');

	if (!doormatActive) {
		navFadeTimerIn = setTimeout(function () {
			clearTimeout(doormatActiveTimer);
			doormatActive = 1;
			that.find('div.doormat').addClass('showdoormat').attr('aria-hidden', false).css("left", "0");
		}, 250);
	} else {
		//show doormat without timeout
		clearTimeout(doormatActiveTimer);
		doormatActive = 1;
		that.find('div.doormat').addClass('showdoormat').attr('aria-hidden', false).css("left", "0");	
	}
};
 
var onMouseLeave = function(that){
	clearTimeout(navFadeTimerIn); //clear timer
	
	doormatActiveTimer = setTimeout( function() {
		doormatActive = 0;
	}, 100);
	
	doormatFlags = 0;
	that.removeClass('focused');
	that.find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px"); 
};
 
 var onTouchStart = function(that){
 
    mainNav.addClass('nohover');
    mainNavTop.addClass('nohover');

     /*
     mainNavTop.bind('click', function (e) {
         e.preventDefault();
         e.stopPropagation();
     });

     mainNavTop.bind('mouseover', function (e) {
         e.preventDefault();
         e.stopPropagation();
     });
	 */
	 
	 
         var d = new Date();
         touchStartTime = d.getTime();

         if (that.hasClass('touched')) {
             that.prevAll().removeClass('focused touched');
             that.prevAll().find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px");
             that.nextAll().removeClass('focused touched');
             that.nextAll().find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px");

             that.removeClass('focused touched');
             that.find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px");

             if ($(this).attr('href')) window.location = $(this).attr('href');

         }	 
	 
	 
 
 
 };
 
  var onTouchEnd = function(that){
 
         var d = new Date();
         touchEndTime = d.getTime();

         if (that.hasClass('touched')) {
             that.removeClass('touched');
             doormatFlags = 0;

             that.prevAll().removeClass('touched focused');
             that.prevAll().find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px");
             that.nextAll().removeClass('focused touched');
             that.nextAll().find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px");
             that.removeClass('focused');


         } else {
             that.addClass('touched');
             doormatFlags = 1;

             that.prevAll().removeClass('focused touched');
             that.prevAll().find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px");
             that.nextAll().removeClass('focused touched');
             that.nextAll().find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px");
             that.addClass('focused');

             that.find('div.doormat').addClass('showdoormat').attr('aria-hidden', false).css("left", "0");
         } 
	
 
 
 };
 
 
 
 

     mainNavTop.bind('touchstart', function (e) {
         e.preventDefault();
         e.stopPropagation();
         var that = $(this).parent();
		 
		 onTouchStart(that);


     });

     mainNavTop.bind('touchend', function (e) {
         e.preventDefault();
         e.stopPropagation();
         var that = $(this).parent();
		 
		 onTouchEnd(that);


     });


//not in touch environment, TBT @ Windows 8 IE 10 dual interface systems

     mainNav.bind('mouseover', function (e) {
         var that = $(this);

		 onMouseOver(that);
		 
		 
     });


     mainNav.bind('mouseleave', function (e) {
         var that = $(this);

		 onMouseLeave(that);
		 
	 });

		
		doormatCloseTabLinks.bind('click touchend', function(e){
			var that = $(this);
			clearTimeout(navFadeTimerIn);
			doormatFlags = 0;
			e.preventDefault();
			e.stopPropagation();
			that.parents().find('#sections li.level1').removeClass('focused touched');
			that.parents().find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px");
		});
		
		
		mainNav.bind('focusin', function(e){
			var that = $(this);			
			doormatFlags = 1;
			
			that.prevAll().removeClass('focused touched');
			that.prevAll().find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px");
			that.nextAll().removeClass('focused touched');
			that.nextAll().find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px");
			that.addClass('focused');
			
			if ( doormatFlags ) {
				that.find('div.doormat').addClass('showdoormat').attr('aria-hidden', false).css("left", "0");
			}
			
		});
		
			
		mainNav.bind('focusout', function(e){
			var that = $(this);
			doormatFlags = 0;
			that.removeClass('focused touched');
			that.find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px"); 
		});
			
		
		$('#sections p.skipLink a').click(function(e) {
			var that = $(this);
			var nextItem = that.parents('li').next('li');
			e.preventDefault();
			mainNav.removeClass('focused touched');
			mainNav.find('div.doormat').removeClass('showdoormat').attr('aria-hidden', true).css("left", "-9999px");
			nextItem.find('a:eq(0)').focus();
		});
	
		
        
		
		// main nav ends here
		

        /* PRODUCTNAV **********/

        var shareList = $('#productNavigation #shareTab')
        shareList.each(function(){
            var that = $(this);
            that.css('display', 'block');
        });

        var printList = $('#productNavigation #printTab')
        printList.each(function(){
            var that = $(this);
            that.css('display', 'block');
        });

        var productNavlist = $('#productNavigation li ul.dropDown')
        productNavlist.each(function(){
            var list = $(this);
            list.css('display', 'none').attr('aria-hidden', true);
            $('#productNavigation').attr('aria-live','polite').attr('aria-relevant', 'all');
        });

        $('#productNavigation li#shareTab a').bind('click',function(e){
            var share = $(this);
            var expand = share.parent().find('ul.dropDown');
            e.preventDefault();
            share.addClass('open');
            expand.css('display', 'block').attr('aria-hidden', false);
        });

        $('#productNavigation li#shareTab').mouseover(function(event) {
            $('#grid').mouseover(function() {	
                $('#productNavigation li#shareTab a').removeClass("open");
                $('#productNavigation .dropDown').css('display', 'none').attr('aria-hidden', true);
            });
            event.stopPropagation();
        });

        $('#productNavigation li#shareTab').focusin(function(event) {
            $('#grid').focusin(function() {
                $('#productNavigation li#shareTab a').removeClass("open");
                $('#productNavigation .dropDown').css('display', 'none').attr('aria-hidden', true);
            });
            event.stopPropagation();
        });
        // product nav ends here
		
        /* MODAL *************/
        var lightviewDetails = $('#lightviewDetails'),
        lightviewDetails1 = $('#lightviewDetails1'),
        lightviewDetails2 = $('#lightviewDetails2'),
        lightviewDetails3 = $('#lightviewDetails3'),
        lightviewDetails4 = $('#lightviewDetails4'),
        lightviewDetails5 = $('#lightviewDetails5'),
        lightviewDetails6 = $('#lightviewDetails6'),
        lightviewDetails7 = $('#lightviewDetails7'),
        lightviewDetails8 = $('#lightviewDetails8'),
        lightviewDetails9 = $('#lightviewDetails9'),
        lightviewDetails10 = $('#lightviewDetails10'),
        lightviewDetails11 = $('#lightviewDetails11'),
        lightviewDetails12 = $('#lightviewDetails12'),
        lightviewDetails13 = $('#lightviewDetails13'),
        lightviewDetails14 = $('#lightviewDetails14'),
        lightviewDetails15 = $('#lightviewDetails15'),
        lightviewShare = $('#lightviewShare'),		
        lightviewProposition = $('#lightviewProposition'),
        lightviewProduct = $('#lightviewProduct');
				
        lightviewDetails.each(function(){
			
            lightviewDetails.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewDetails1.each(function(){
			
            lightviewDetails1.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewDetails2.each(function(){
			
            lightviewDetails2.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewDetails3.each(function(){
			
            lightviewDetails3.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewDetails4.each(function(){
			
            lightviewDetails4.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewDetails5.each(function(){
			
            lightviewDetails5.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewDetails6.each(function(){
			
            lightviewDetails6.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewDetails7.each(function(){
			
            lightviewDetails7.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewDetails8.each(function(){
			
            lightviewDetails8.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewDetails9.each(function(){
			
            lightviewDetails9.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewDetails10.each(function(){
			
            lightviewDetails10.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewDetails11.each(function(){
			
            lightviewDetails11.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
        lightviewDetails12.each(function(){
			
            lightviewDetails12.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewDetails13.each(function(){
			
            lightviewDetails13.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewDetails14.each(function(){
			
            lightviewDetails14.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewDetails5.each(function(){
			
            lightviewDetails15.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewProposition.each(function(){
			
            lightviewProposition.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
	

	lightviewProduct.each(function(){
			
            lightviewProduct.attr('aria-hidden', true).attr('style','display:none; width:100%; height:100%; position:absolute; top:50px;');
					
        });
		
        lightviewShare.each(function(){
			
            lightviewShare.attr('aria-hidden', true);
						
        });
									
        var modalOpen = function(hash){ 
            //display the modal window
            hash.w.show().attr('aria-hidden', false);	
			
            //attach esc key to close modal
            $(document).keydown( function( e ) { 
                if( e.which === 27) {  
                    if (hash.w.is(":visible")) { 
                        hash.w.jqmHide().attr('aria-hidden', true);
					  //$('#grid').find('a:eq(0)').focus(); commented to fix scrolling problem on exititng lightbox
                    }
                } 
            }); 
			
            $('.jqmOverlay')
            .css({
                zIndex:2
            })
            .click(function(){
                hash.w.jqmHide().attr('aria-hidden', true);
            });
				
            var $jqmWindow = hash.w;
				
            $jqmWindow.css({
                zIndex:3,
                width: $jqmWindow.find('.lightview').width(),
                height: 'auto'
            });
			
            $jqmWindow.css({
                left: ($(window).width()-$jqmWindow.width())/2,
                top: $(window).scrollTop() + ($(window).height()-$jqmWindow.height())/2
            });
			
            $('#top').css({
                position: 'relative',
                zIndex: 1
            });
			
            //focus first link
            hash.w.find('a:eq(1)').focus();
        };
		
        if(lightviewDetails.length){
            lightviewDetails.jqm({
                onShow:modalOpen
            });
            lightviewDetails.jqmAddTrigger('.triggerModalDetails');
            lightviewDetails.jqmAddClose('.close');
        }
		
        if(lightviewDetails1.length){
            lightviewDetails1.jqm({
                onShow:modalOpen
            });
            lightviewDetails1.jqmAddTrigger('.triggerModalDetails1');
            lightviewDetails1.jqmAddClose('.close');
        }
		
        if(lightviewDetails2.length){
            lightviewDetails2.jqm({
                onShow:modalOpen
            });
            lightviewDetails2.jqmAddTrigger('.triggerModalDetails2');
            lightviewDetails2.jqmAddClose('.close');
        }
		
        if(lightviewDetails3.length){
            lightviewDetails3.jqm({
                onShow:modalOpen
            });
            lightviewDetails3.jqmAddTrigger('.triggerModalDetails3');
            lightviewDetails3.jqmAddClose('.close');
        }
		
        if(lightviewDetails4.length){
            lightviewDetails4.jqm({
                onShow:modalOpen
            });
            lightviewDetails4.jqmAddTrigger('.triggerModalDetails4');
            lightviewDetails4.jqmAddClose('.close');
        }
		
        if(lightviewDetails5.length){
            lightviewDetails5.jqm({
                onShow:modalOpen
            });
            lightviewDetails5.jqmAddTrigger('.triggerModalDetails5');
            lightviewDetails5.jqmAddClose('.close');

        }
		
        if(lightviewDetails6.length){
            lightviewDetails6.jqm({
                onShow:modalOpen
            });
            lightviewDetails6.jqmAddTrigger('.triggerModalDetails6');
            lightviewDetails6.jqmAddClose('.close');
        }
        if(lightviewDetails7.length){
            lightviewDetails7.jqm({
                onShow:modalOpen
            });
            lightviewDetails7.jqmAddTrigger('.triggerModalDetails7');
            lightviewDetails7.jqmAddClose('.close');
        }
        if(lightviewDetails8.length){
            lightviewDetails8.jqm({
                onShow:modalOpen
            });
            lightviewDetails8.jqmAddTrigger('.triggerModalDetails8');
            lightviewDetails8.jqmAddClose('.close');
        }
        if(lightviewDetails9.length){
            lightviewDetails9.jqm({
                onShow:modalOpen
            });
            lightviewDetails9.jqmAddTrigger('.triggerModalDetails9');
            lightviewDetails9.jqmAddClose('.close');
        }
        if(lightviewDetails10.length){
            lightviewDetails10.jqm({
                onShow:modalOpen
            });
            lightviewDetails10.jqmAddTrigger('.triggerModalDetails10');
            lightviewDetails10.jqmAddClose('.close');
        }
        if(lightviewDetails11.length){
            lightviewDetails11.jqm({
                onShow:modalOpen
            });
            lightviewDetails11.jqmAddTrigger('.triggerModalDetails11');
            lightviewDetails11.jqmAddClose('.close');
        }
        if(lightviewDetails12.length){
            lightviewDetails12.jqm({
                onShow:modalOpen
            });
            lightviewDetails12.jqmAddTrigger('.triggerModalDetails12');
            lightviewDetails12.jqmAddClose('.close');
        }
        if(lightviewDetails13.length){
            lightviewDetails13.jqm({
                onShow:modalOpen
            });
            lightviewDetails13.jqmAddTrigger('.triggerModalDetails13');
            lightviewDetails13.jqmAddClose('.close');
        }
        if(lightviewDetails14.length){
            lightviewDetails14.jqm({
                onShow:modalOpen
            });
            lightviewDetails14.jqmAddTrigger('.triggerModalDetails14');
            lightviewDetails14.jqmAddClose('.close');
        }
        if(lightviewDetails15.length){
            lightviewDetails15.jqm({
                onShow:modalOpen
            });
            lightviewDetails15.jqmAddTrigger('.triggerModalDetails15');
            lightviewDetails15.jqmAddClose('.close');
        }
		
        if(lightviewProposition.length){
            getLightboxContent($('.triggerModalProposition'), lightviewProposition);
            lightviewProposition.jqm({
                onShow:modalOpen
            });
            lightviewProposition.jqmAddTrigger('.triggerModalProposition');
            lightviewProposition.jqmAddClose('.close');
        }
	
	if(lightviewProduct.length){
            getLightboxContent($('.triggerModalProduct'), lightviewProduct);
            lightviewProduct.jqm({
                onShow:modalOpen
            });
            lightviewProduct.jqmAddTrigger('.triggerModalProduct');
            lightviewProduct.jqmAddClose('.close');
        }
        if(lightviewShare.length){
            getLightboxContent($('.triggerModalShare'), lightviewShare);
            lightviewShare.jqm({
                onShow:modalOpen
            });
            lightviewShare.jqmAddTrigger('.triggerModalShare');
            lightviewShare.jqmAddClose('.close');
        }
		
        function getLightboxContent(trigger, lightbox){
            var url = trigger.attr('href'),
            containers = [];
			
            lightbox.find('.ajaxContent').each(function(){
                containers.push($(this).attr('id'));
            });
			
            $.get(url, function(data){
                for(var i = 0; i < containers.length; i++){
                    $(data).find('#' + containers[i].substr(5)).each(function(){
                        lightbox.find('#' + containers[i]).append($(this));
                    });
                }
            });
        }

        // modal ends here
		
        /* TREENAV ************/
        $('#treeNav').attr('aria-live','polite').attr('aria-relevant', 'all');
        $('#treeNav').find('li.open').find('ul').attr('aria-hidden', false);
        $('#treeNav').find('li:not(.open)').addClass('closed').find('ul').attr('aria-hidden', true);
        $('#treeNav').find('p a').attr('title', function(i, val) {
            return 'Expand or collapse menu: ' + val 
        });
        $('#treeNav li p').toggle(function(){
            var parent = $(this).parent();
            parent.removeClass('closed').addClass('open');
            parent.find('ul').attr('aria-hidden', false);
        }, function () {
            var parent = $(this).parent();
            parent.removeClass('open').addClass('closed');
            parent.find('ul').attr('aria-hidden', true);
        });

		
        // Apply modal
        var advanceCustomersContainer = $('#advanceCustomersContainer'),
        nonAdvanceCustomersContainer = $('#nonAdvanceCustomersContainer'),
        applyToggleTabs = $('#applyToggleTabs .applyToggle'),
        modalHeader = $('#applyModal .modalHeader');

        //disables click event on modal Header
        modalHeader.click(function(){
            return false;
        });

        advanceCustomersContainer.hide().removeClass("current");
        nonAdvanceCustomersContainer.hide().removeClass("current");

        applyToggleTabs.click(function(){
            var that = $(this);
            applyToggleTabs.removeClass("current").filter(that).addClass("current");
            if (that.attr("href") === '#advanceCustomersContainer') {
                advanceCustomersContainer.show();
                nonAdvanceCustomersContainer.hide();
            } else if (that.attr("href") === '#nonAdvanceCustomersContainer') {
                advanceCustomersContainer.hide();
                nonAdvanceCustomersContainer.show();
            }
            return false;
        });	


        prepareTable(); //check how many products we're comparing, add remove links
        moreLinks();
        moreProductDetailsLinks();
        hideTbContent('#productComparison');
		
        if (typeof CompareAcc !== "undefined") {
            new CompareAcc("");
        }
		
        //Tempoary code to stop the value -1 on productListingModule.html
        $('.productComparisonView b').html('4');
		
    });

    $.PopupMenu = {
        init: function(){
            var position = [];
			
            $('.popupMenu').attr('aria-live','polite').attr('aria-relevant', 'all');
			
            $('.popupMenu .popupMenuItem').each(function(){
                $(this).find('.popupMenuItemContent p.popupItemLink').addClass('hidden').attr('aria-hidden', true);
                position.push($(this).position());
            });
            $('.popupMenu .popupMenuItem').each(function(i){
                var $this = $(this),
                width = $this.width();
                $this.css({
                    position: 'absolute',
                    top: position[i].top,
                    left: position[i].left
                });
				
                var expandedLeft = position[i].left;
                if((i+1) > position.length/2){
                    $this.addClass('expanded');
                    expandedLeft = position[i].left - ($this.width() - width);
                    $this.removeClass('expanded');
                    $this.find('img')
                    .height(160)
                    .width(200);
                }
				
                $this.find('.popupMenuItemInner').bind('focusin mouseover', function(e){
                    $this
                    .addClass('expanded')
                    .css({
                        top: -42,
                        left: expandedLeft
                    })
                    .find('p.popupItemLink').removeClass('hidden').attr('aria-hidden', false);
                    $this.parents('.grid').css('zIndex', '3');
                    $this.find('img')
                    .height('auto')
                    .width('auto');
                });
				
                $this.find('.popupMenuItemInner').bind('focusout mouseleave', function(e){
                    $this
                    .removeClass('expanded')
                    .css({
                        top: position[i].top,
                        left: position[i].left
                    })
                    .find('p.popupItemLink').addClass('hidden').attr('aria-hidden', true);
                    $this.parents('.grid').css('zIndex', '1');
                    $this.find('img')
                    .height(160)
                    .width(200);
                });
            });
        }
    }

    $.PillarPagination = {
        $container: null,
        $content: null,
        $list: null,
        $next: null,
        $prev: null,
        listWidth: 0,
        animSpeed: 500,
        currentPos: 1,
        init:function(){
            var obj = this,
            busy = false;
            this.$container = $('.pillarPagination');
            this.$content = this.$container.find('.pillarContent');
            this.$list = this.$content.find('ul');
            this.$next = $('<a class="pillarNext pillarArrow" href="#"><span>Scroll right</span></a>').appendTo(this.$container);
            this.$prev = $('<a class="pillarPrev pillarArrow" href="#"><span>Scroll left</span></a>').prependTo(this.$container);
            this.listWidth = this.$list.find('li').width();
			
            this.$container.attr('aria-live','polite').attr('aria-relevant', 'all');
			
            this.$list.find('li').each(function(i){
                if($(this).hasClass('current')){
                    obj.currentPos = i+1;
                }
            });
            this.$content.css({
                height: this.$list.find('li').height(),
                position: 'relative',
                overflow: 'hidden'
            });
            this.$list.css({
                position: 'absolute',
                top: 0,
                left: 0,
                width: this.$list.find('li').length * this.listWidth
            });
            this.updateAria();
            this.updateArrows();
			
            $('.pillarArrow').click(function(e){
                e.preventDefault();
            });
											   
            this.$next.click(function(){
                if(!$(this).hasClass('pillarNextDisabled') && busy == false){
                    busy = true;
                    obj.$list.find('li').eq(obj.currentPos+1).css('display', 'block');
                    obj.$list.animate({
                        left: -420
                    }, obj.animSpeed, function(){
                        obj.currentPos++;
                        obj.updateAria();
                        obj.$list.css('left', 0);
                        obj.updateArrows();
                        busy = false;
                    });
                }
            });
            this.$prev.click(function(){
                if(!$(this).hasClass('pillarPrevDisabled') && busy == false){
                    busy = true;
                    obj.$list.find('li').eq(obj.currentPos-2).css('display', 'block');
                    obj.$list.css('left', -420);
                    obj.$list.animate({
                        left: 0
                    }, obj.animSpeed, function(){
                        obj.currentPos--;
                        obj.updateAria();
                        obj.$list.css('left', 0);
                        obj.updateArrows();
                        busy = false;
                    });
                }
            });
        },
        updateAria: function(){
            var obj = this;
            this.$list.find('li').each(function(i){
                if(i == obj.currentPos-1 || i == obj.currentPos){
                    $(this)
                    .attr('aria-hidden', false)
                    .css('display', 'block');
                }
                else{
                    $(this)
                    .attr('aria-hidden', true)
                    .hide();
                }
            });
        },
        updateArrows: function(){
            if(this.currentPos == this.$list.find('li').length-1){
                this.$next.addClass('pillarNextDisabled');
            }
            else{
                this.$next.removeClass('pillarNextDisabled');
            }
			
            if(this.currentPos == 1){
                this.$prev.addClass('pillarPrevDisabled');
            }
            else{
                this.$prev.removeClass('pillarPrevDisabled');
            }
        }
    }

    function callRevolver(){
        $('.jsElement').show();
        $('.revolverNavigation').show();
        $('.revolverOneCol, .revolverThreeCol, .revolverFourCol').revolver({
            interval: 7500,
            duration: 1000,
            selectors: {
                'item': '.inner'
            }
        })
        .bind('onloadcompleterevolver', function(){
            controlLinks();
        })
        .bind('onabortrevolver', function(){
            $(this).find('.revolverNavigation').hide();
        });
		
        $('.revolverTwoCol').revolver({
            interval: 0,
            duration: 1000,
            selectors: {
                item: '.doublePodRow'
            }                        
        })
        .bind('onloadcompleterevolver', function(){
            controlLinks();
        })
        .bind('onabortrevolver', function(){
            $(this).find('.revolverNavigation').hide();
        });
		
        $('#smallCarousel')
        .revolver({
            interval: 0,
            duration: 1000,
            selectors: {
                item: '.gallery a',
                prev: '#galleryPrev',
                next: '#galleryNext',
                pager: '#galleryPager'
            },
            classes: {
                pagerItemSelected: 	'selected'
            }
        })
        .bind('onchangerevolver', function(e, i){
            $('#smallCarousel .revolverBelt a[data-index='+i+']').focus();
        })
        .bind('onloadcompleterevolver', function(){
            controlLinks();
        })
        .bind('onabortrevolver', function(){
            $(this).find('.revolverNavigation').hide();
        })
        .find('.galleryControls').show();
			
        var controlLinks = function(){
            var controlLinks = $('div#smallCarousel .galleryControls a, .revolverNavigation li a'),
            borderColor = 'transparent';
					
            if($.browser.msie && $.browser.version.substr(0,1)<7){
                borderColor = '#fff';
            }
					
            controlLinks.each(function(){
                var alink = $(this);
                alink.mousedown(function(e){
                    alink.css({
                        'border-color':borderColor
                    });
                });
            });
				
				window.controlLinks = controlLinks;
        }
    }

    $.tabs = {
        init: function(){
            var $tabs = $('.inPageTabs');
            if($tabs.length){
                $tabs.each(function(){
                    $(this).attr({
                        'aria-live':		'polite',	
                        'aria-relevant':	'all'
                    });
                    var $listItems = $(this).find('.tabList li'),
                    $contentNodes = $(this).find('.tabContent');
						
                    $listItems.each(function(i){
                        $(this).click(function(e){
                            e.preventDefault();
                            change(i);
                        });
                    });
					
                    change(0);
					
                    var hash = location.hash;
                    if(hash){
                        $contentNodes.each(function(i){
                            if($(this).attr('id') === hash.substr(1)){
                                change(i);
                            }
                        });
                    }
					
                    function change(index){
                        $listItems.removeClass('selected');
                        $listItems.eq(index).addClass('selected');
                        $contentNodes
                        .hide()
                        .attr('aria-hidden', 'true');
                        $contentNodes.eq(index)
                        .show()
                        .attr('aria-hidden', 'false');
                    }
                });
            }
        }
    }

    //Share functionality

    $.fn.shareTool = function (options) {

        return this.each(function () {

            var settings = {
                api: {
                    url: ['http://urls.api.twitter.com/1/urls/count.json?url=',                 // APIs to use - order must match that of links in settings.shareHTML
                    'http://graph.facebook.com/',
                    'http://services.digg.com/1.0/endpoint?method=story.getAll&amp;link=',
                    'http://www.reddit.com/api/info.json?url=']
                    , 
                    callback: ['&callback=?',                                                 // callbacks for API calls
                    '&callback=?',
                    '&type=javascript&callback=?',
                    '&jsonp=?']
                }
                , 
                share: {
                    url: ['https://twitter.com/intent/tweet?url=',                              // URLs to post new messages to
                    'http://www.facebook.com/sharer.php?u=',
                    'http://digg.com/submit?url=',
                    'http://www.reddit.com/login?dest=%2Fsubmit%3Furl%3D']
                }
                , 
                shareHTML: '<div class="shareTool">\
								<a class="shareButton" href="#">share<span class="total"></span></a>\
								<div class="panel">\
									<ul>\
										<li class="twitter"><a href="#" title="share on twitter"><span class="invisible">twitter</span></a></li>\
										<li class="facebook"><a href="#" title="share on facebook"><span class="invisible">facebook</span></a></li>\
										<li class="digg"><a href="#" title="share on digg"><span class="invisible">digg</span></a></li>\
										<li class="reddit"><a href="#" title="share on reddit"><span class="invisible">reddit</span></a></li>\
										<li class="close"><a href="#" title="close"><span class="invisible">close</span></a></li>\
									</ul>\
									<p class="disclaimer">This link may allow you to access a non-HSBC website. <strong>HSBC</strong> has no control over the linked website and is not liable for your use of it.<br /><a href="#" target="_blank" title="proceed">proceed &gt; &gt;</a></p>\
									<p class="message">thank you</p>\
								</div>\
							</div>'
                , 
                facebookRecommendHMTL: '<a href="#" class="facebook-recommend" title="Recommend on facebook">Recommend</a> <span class="likes"></span>'
                , 
                facebookLikeHMTL: '<a href="#" class="facebook-like" title="Like on facebook">Like</a> <span class="likes"></span>'
                , 
                disclaimerHTML: ''
                , 
                shareUrl: ''                          // this will be populated with URL of page/link
                , 
                linkToShare: 'a.share'                // selector to look for to share link
                , 
                pageShareClass: 'share-page'
                , 
                linkShareClass: 'share-link'
                , 
                containerClass: 'div.shareTool'
                , 
                popupName: 'social_media_popup'       // name of popup 
                , 
                popupParams: 'width=700,height=500'   // params to pass to window.open()
                , 
                autoLoadEnabled: true                 // stops plugin autoloading
                , 
                shareEnabled: true                    // kill switch
            };

            var i, class_name, $e = $(this), classes = $e.attr('class').match(/share-[-A-z]*/gi); // get share- class names from object we're working on returns array

            // If options exist, lets merge them
            // with our default settings
            if (options) {
                $.extend(settings, options);
            }

            if (settings.shareEnabled) { // not initialised yet
                for (i = 0; i < classes.length; i++) {
                    class_name = classes[i];
                    switch (class_name) {

                        case 'share-html-ready':
                            settings.shareUrl = cleanURL($(this).find(settings.linkToShare).attr('href'));
                            setupShareButtonEventHandlers();
                            break;

                        case 'share-page':
                            $(this).prepend(settings.shareHTML); // prepend sharetool div
                            settings.shareUrl = cleanURL(location.href);
                            setupShareButtonEventHandlers();
                            break;

                        case 'share-page-tab':
                            settings.shareUrl = cleanURL(location.href);
                            setupShareButtonTabEventHandlers();
                            break;

                        case 'share-link':
                            $(this).append(settings.shareHTML); //append sharetool div
                            settings.shareUrl = cleanURL($(this).find(settings.linkToShare).attr('href'));
                            setupShareButtonEventHandlers();
                            break;

                        case 'share-facebook-recommend':
                            $('div.shareTool a.shareButton', $(this)).after(settings.facebookRecommendHMTL);               //need separate counter
                            settings.shareUrl = cleanURL($(this).find(settings.linkToShare).attr('href'));
                            $(this).children('div.shareTool').data('facebook', 1);
                            setupFacebookButtonEventHandlers();
                            break;

                        case 'share-facebook-like':
                            $('div.shareTool a.shareButton', $(this)).after(settings.facebookLikeHMTL);               //need separate counter
                            settings.shareUrl = cleanURL($(this).find(settings.linkToShare).attr('href'));
                            $(this).children('.shareTool').data('facebook', 1);
                            setupFacebookButtonEventHandlers();
                            break;

                        case 'share-auto-load':
                            if (settings.autoLoadEnabled) {
                                setUpShareLinks();
                                getNumberOfShare($e);
                                setupShareButtonEventHandlers();
                            }
                            break;
                    }

                    $(function () { // IE fix for first direct
                        var zIndexNumber = 1000;
                        $('fdBodyContainer div').each(function () {
                            $(this).css('zIndex', zIndexNumber);
                            zIndexNumber -= 10;
                        });
                    });

                }
            }

            function setupShareButtonEventHandlers() {

                if ($e.children('.shareTool').data('share') === undefined) {

                    $('a.shareButton', $e).click(function (event) {
                        $('div.panel', $e).css({
                            left: 0
                        })
                        $('p.disclaimer', $e).css({
                            top: '50px'
                        })
                        event.preventDefault();
                        setUpShareLinks();
                        getNumberOfShare($e);
                        $('div.panel, div.panel ul', $e).slideDown();

                        $('ul li.close a', $e).click(function (event) {
                            event.preventDefault();
                            $(this).closest('ul').find('li a.selected').removeClass('selected');
                            $('div.panel', $e).hide()
                        });
                        setupHoverEventHandler();
                    });

                    $e.children('.shareTool').data('share', 1);

                }
            }

            function setupShareButtonTabEventHandlers() {
                var timer;

                for (var i = 0; i < settings.share.url.length; i++) {
                    $e.find('li a:eq(' + i + ')').attr('href', settings.share.url[i] + settings.shareUrl).click(function (event) {
                        //show disclaimer
                        event.preventDefault();
                        //webtrends();
                        // webtrends('service_selected', $(this).parent('li').attr('class'));
				
						
                        $('ul.dropDown', $e).hide();
					
					
                        $('div.shareDisclaimer a').attr('href', $(this).attr('href'));
                        $('div.shareDisclaimer a').click(function(e){
                            //e.preventDefault();
                            // window.open(this.href, settings.popupName, settings.popupParams);
                            });
					
					
                        // switch background to coloured version first deselecting all other elements
                        $('a.selected', $e).each(function () {
                            $(this).removeClass('selected')
                        })
                        $(this).addClass('selected');
                    //removed this so lightbox picks up the click event event
                    /*
					.click(function (event) {
						event.preventDefault();
						webtrends('disclaimer', $(this).closest(settings.containerClass).find('ul li a.selected').parent('li').attr('class'));
						window.open(this.href, settings.popupName, settings.popupParams);
						$('div.disclaimer', $e).hide();
					});
				
					$('div.disclaimer', $e).hover(function () {
						clearTimeout(timer);       //clear timer
					}, function () {
						timer = setTimeout(function () {        //mouse leave
							$('div.disclaimer', $e).hide();
							$('ul li a', $e).removeClass('selected');
							$(this).unbind('mouseenter mouseleave');
						}, 1000)

					});
					*/

                    });
                }

            }


            function setupHoverEventHandler() {
                var timer;

                $('div.shareTool div.panel', $e).hover(function () {  //mouse enter
                    clearTimeout(timer);       //clear timer
                }, function () {
                    timer = setTimeout(function () {        //mouse leave
                        $('div.shareTool div.panel p.disclaimer, div.shareTool div.panel p.message', $e).hide();
                        $('div.shareTool div.panel ul li a', $e).removeClass('selected');
                        $('div.shareTool div.panel').hide();
                        $(this).unbind('mouseenter mouseleave');
                    }, 1000)
                });

            }

            function setupFacebookButtonEventHandlers() {

                $('a.facebook-recommend, a.facebook-like', $e).click(function (event) {

                    event.preventDefault();

                    var offset;
                    var current_pos = $(settings.containerClass, $e).offset();
                    var target_pos = $(this).offset();

                    $('div.panel', $e).css({
                        left: 0
                    })     // reset position of div.panel  
                    // $('p.disclaimer', $e).css({ top: '0px' })
                    webtrends('share_button');

                    offset = target_pos.left - current_pos.left;
                    $('div.panel', $e).offset({
                        left: offset
                    });
                    $('div.panel ul', $e).hide(); 					    // hide ul showing other social media services
                    $('p.disclaimer', $e).css({
                        top: '0px'
                    })			// move disclaimer up
                    $('div.panel, div.panel p.disclaimer', $e).show();

                    $('p.disclaimer a', $e).attr('href', settings.share.url[1] + settings.shareUrl).click(function (event) {//set up link on proceed button and click handler
                        event.preventDefault();
                        webtrends('disclaimer', 'facebook');
                        window.open(this.href, settings.popupName, settings.popupParams);
                    });

                });


            }

            function setUpShareLinks() {

                for (var i = 0; i < settings.share.url.length; i++) {

                    $e.find('li a:eq(' + i + ')').attr('href', settings.share.url[i] + settings.shareUrl).click(function (event) {
                        //show disclaimer

                        event.preventDefault();

                        //webtrends();
                        webtrends('service_selected', $(this).parent('li').attr('class'));

                        $('p.disclaimer', $e).show();
                        $('p.disclaimer a', $e).attr('href', $(this).attr('href'));

                        // switch background to coloured version first deselecting all other elements
                        $('a.selected', $e).each(function () {
                            $(this).removeClass('selected')
                        })
                        $(this).addClass('selected');

                        $('p.disclaimer a', $e).click(function (event) {
                            event.preventDefault();
                            webtrends('disclaimer', $(this).closest('div.panel').find('ul li a.selected').parent('li').attr('class'));
                            window.open(this.href, settings.popupName, settings.popupParams);
                            $('div.shareTool p.disclaimer', $e).hide();
                            $('div.shareTool p.message', $e).show();

                        });
                    });
                }
            }

            function updateTotal(e, position) { // jquery object, position in settings array

                var sum = 0, facebook = 0;

                if ($('div.shareTool', e).data('facebook') !== undefined) { // separate count for facebook

                    facebook = $('div.shareTool ul li.facebook', e).data('value');

                    if (facebook > 0) {
                        $('div.shareTool span.likes', e).html(facebook);
                        $('div.shareTool span.likes', e).show()
                    }

                    $('div.shareTool ul li', e).filter('.twitter, .digg, .reddit').each(function () {
                        if ($(this).data('value') !== undefined) {
                            sum += $(this).data('value');
                        }
                    });

                } else { //total for everything apart from facebook
                    $('div.shareTool ul li', e).each(function () {
                        if ($(this).data('value') !== undefined) {
                            sum += $(this).data('value');
                        }
                    });
                }

                if (sum > 0) {
                    $('a.shareButton span.total', e).html(sum).css({
                        'display': 'inline-block'
                    });
                }

            }

            function JSONPCall(url, position, e) {
                $.getJSON(url, function (data) {
                    switch (position) {
                        case 0:     //twitter
                            if (data.count !== undefined) {
                                $('div.shareTool ul li.twitter', e).data('value', parseInt(data.count, 10));
                            }
                            break;
                        case 1:     //facebook
                            if (data.shares !== undefined) {
                                $('div.shareTool ul li.facebook', e).data('value', parseInt(data.shares, 10));
                            }
                            break;
                        case 2:     //digg
                            if (data.stories.length !== 0) {        // use same heuristric as for reddit ??
                                $('div.shareTool ul li.digg', e).data('value', parseInt(data.stories[0].diggs, 10));
                            }
                            break;
                        case 3:     //reddit
                            if (data.data.children.length !== 0) {  // what to do for cases where there are multiple stories ??
                                // find length of children, iterate through object summing children[i].data.score
                                $('div.shareTool ul li.reddit', e).data('value', parseInt(data.data.children[0].data.score, 10));
                            }
                            break;
                    }
                    updateTotal(e, position);
                });
            //.error(function (jqXHR, textStatus, errorThrown) {
            //   alert("error " + textStatus);
            //});
            }

            function getNumberOfShare(e) { // jquery object

                for (var i = 0; i < settings.api.url.length; i++) {
                    JSONPCall(settings.api.url[i] + settings.shareUrl + settings.api.callback[i], i, e); //url, position in settings array, jquery object 
                }
            }

            function cleanURL(url) {

                if (!url.match(/http/)) { // relative URL             
                    url = location.protocol + '//' + location.host + url
                }
                //return url.replace(/(;jsessionid=[A-z0-9=;:]*)/, '').replace(/(\?clear=true)/, '').replace(/(www)\d/, "$1");
                return url.replace(/;jsessionid=.*/, '')
            }

            function webtrends(stage, service) {
                if (!service) {
                    service = 'nonSelected'
                }
                dcsMultiTrack('DCS.dcsuri', '/share_tool/' + stage + '/' + service + '/sharedLink/' + settings.shareUrl + '/sharedFrom/' + location.href); // add something to normalise www\d to www in domain

            }

        });

    };

    $(document).ready(function () {
        // Handler for .ready() called.
        $('.share-page, .share-link').shareTool();
        $('.share-page-tab').shareTool();
        //print
        $('#printTab').click(function (e) {
            e.preventDefault();
            window.print();
        });
		
        //va js show
		
        $('#jsVA').show();
        $('#nonjsVA').hide();
    });


    /* Check for external links and invoke lightbox */
    $(function() {
		$('a.extLink').each(function() {
			$(this).attr({target:'_blank'}).hsbclightbox({
				minimumcam:'30',
				heading:'You are about to leave the UK Personal website.',
				content:'<p>However, you are currently logged on to Internet Banking. For security reasons you will be logged off if you choose to continue.</p><p>Please select one of the following options:<br /><a title="Continue" class="logoff" href="#">Continue to "'+$(this).attr("title")+'" and log me off</a><br /><a title="Cancel" class="cancel" href="#">Cancel</a></p>'
			});
		});
    
		$('a.mobileLink').click(function(e) {
            e.preventDefault();
            document.cookie='noMobile=false;path=/1/2/';
            location.replace($(this).attr('href'));
        }).closest('li').removeAttr("style");
    });

    // Debugging Code - Should always be at bottom of all code
    var log;
    if (window.console && console.log) {
        log = console.log;
    }
    else {
        log = function() { };    
}

function p(msg) {
    log('Debug mode: ', msg);
}








////////////////////////////// LOG OFF SCRIPT //////////////////////////////



////////////////////////////////////////////////////////////////////////////
///// Warning, editing this script will have an impact on LIFECHOICES. /////
////////////////////////////////////////////////////////////////////////////
/////   Ensure you understand the impact before making any changes.    /////
////////////////////////////////////////////////////////////////////////////



var logOffURLArray = Array("/1/2/a-logged-off", "/1/2/p-logged-off", "/1/2/b-logged-off");
    var logOffCUNArray = Array("hsbc.a.loggedoff", "hsbc.p.loggedoff", "hsbc.b.loggedoff");
    var logOffNameArray = Array("Advance","Premier","BankAcc");
	
    var cookieBreaks;
    var cookieName;
    var cookieValue;
	
    var thisPageVal;
	
    var imgFound = false;
	
    $(document).ready(function(){

        if($("#genericPopupWin")[0]){
        //popup page, do nothing
        } else {
            sortLogOff();
        }
		
    });


    function sortLogOff(){
	
        cookieBreaks = document.cookie.split(";");

        if($('h1:first').html() == "My accounts"){
		
            var im = document.getElementsByTagName("img");
					
            for (i = 0; i < im.length; i++){
			
                if (im[i].src.indexOf("/content/uk/images/buttons/en/hsbc_advance_gateway_branding.gif") >= 0){
                    document.cookie='logoffType='+logOffNameArray[0]+';path=/;';
                    imgFound = true;
                    thisPageVal = logOffNameArray[0];
                } else if (im[i].src.indexOf("/content/uk/images/buttons/en/premier_gav.gif") >= 0){
                    document.cookie='logoffType='+logOffNameArray[1]+';path=/;';
                    imgFound = true;
                    thisPageVal = logOffNameArray[1];
                } 
            }
				
            if(imgFound == false){
                document.cookie='logoffType='+logOffNameArray[2]+';path=/;';
                thisPageVal = logOffNameArray[2];
            }
			
			
            for(var n=0; n < logOffNameArray.length; n++){
						
                if(thisPageVal==logOffNameArray[n]){
							
                    var m = document.getElementsByTagName("A");
								
                    for (i = 0; i < m.length; i++){	
							
                        if (m[i].title.indexOf("Log off") >= 0){
                            m[i].href=logOffURLArray[n]+"?idv_cmd=idv.Logoff&HBEU_dyn_lnk="+logOffNameArray[n]+"_LogOff&nextPage="+logOffCUNArray[n];
                        }
						
                    }

                }
						
            }
							
			
			
        } else {

            for (i=0; i<cookieBreaks.length; i++){
			
                cookieName=cookieBreaks[i].split("=")[0];
                cookieValue=cookieBreaks[i].split("=")[1];

                if (cookieName=="logoffType" || cookieName==" logoffType"){
				
                    for(var n=0; n < logOffNameArray.length; n++){
						
                        if(cookieValue==logOffNameArray[n]){
							
                            var m = document.getElementsByTagName("A");
								
                            for (i = 0; i < m.length; i++){	
							
                                if (m[i].title.indexOf("Log off") >= 0){
                                    m[i].href=logOffURLArray[n]+"?idv_cmd=idv.Logoff&HBEU_dyn_lnk="+logOffNameArray[n]+"_LogOff&nextPage="+logOffCUNArray[n];
                                }

                            }
						
                        }
							
                    }
					
                }
					
            }
			
        }	
    }
})(jQuery);

//fix touch move events on sliders
(function($) {
    // Detect touch support
    $.support.touch = 'ontouchend' in document;

    // Ignore browsers without touch support and when $.ui isn't loaded
    if (!$.support.touch || !$.ui) {
        return;
    }

    var mouseProto = $.ui.mouse.prototype,
        _mouseInit = mouseProto._mouseInit,
        touchHandled;

    /**
     * Simulate a mouse event based on a corresponding touch event
     * @param {Object} event A touch event
     * @param {String} simulatedType The corresponding mouse event
     */
    function simulateMouseEvent(event, simulatedType) {

        // Ignore multi-touch events
        if (event.originalEvent.touches.length > 1) {
            return;
        }

        event.preventDefault();

        var touch = event.originalEvent.changedTouches[0],
            simulatedEvent = document.createEvent('MouseEvents');

        // Initialize the simulated mouse event using the touch event's coordinates
        simulatedEvent.initMouseEvent(
            simulatedType, // type
            true, // bubbles
            true, // cancelable
            window, // view
            1, // detail
            touch.screenX, // screenX
            touch.screenY, // screenY
            touch.clientX, // clientX
            touch.clientY, // clientY
            false, // ctrlKey
            false, // altKey
            false, // shiftKey
            false, // metaKey
            0, // button
            null // relatedTarget
        );

        // Dispatch the simulated event to the target element
        event.target.dispatchEvent(simulatedEvent);
    }

    /**
     * Handle the jQuery UI widget's touchstart events
     * @param {Object} event The widget element's touchstart event
     */
    mouseProto._touchStart = function(event) {

        var self = this;

        // Ignore the event if another widget is already being handled
        if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
            return;
        }

        // Set the flag to prevent other widgets from inheriting the touch event
        touchHandled = true;

        // Track movement to determine if interaction was a click
        self._touchMoved = false;

        // Simulate the mouseover event
        simulateMouseEvent(event, 'mouseover');

        // Simulate the mousemove event
        simulateMouseEvent(event, 'mousemove');

        // Simulate the mousedown event
        simulateMouseEvent(event, 'mousedown');
    };

    /**
     * Handle the jQuery UI widget's touchmove events
     * @param {Object} event The document's touchmove event
     */
    mouseProto._touchMove = function(event) {

        // Ignore event if not handled
        if (!touchHandled) {
            return;
        }

        // Interaction was not a click
        this._touchMoved = true;

        // Simulate the mousemove event
        simulateMouseEvent(event, 'mousemove');
    };

    /**
     * Handle the jQuery UI widget's touchend events
     * @param {Object} event The document's touchend event
     */
    mouseProto._touchEnd = function(event) {

        // Ignore event if not handled
        if (!touchHandled) {
            return;
        }

        // Simulate the mouseup event
        simulateMouseEvent(event, 'mouseup');

        // Simulate the mouseout event
        simulateMouseEvent(event, 'mouseout');

        // If the touch interaction did not move, it should trigger a click
        if (!this._touchMoved) {

            // Simulate the click event
            simulateMouseEvent(event, 'click');
        }

        // Unset the flag to allow other widgets to inherit the touch event
        touchHandled = false;
    };

    /**
     * An extension of the $.ui.mouse _mouseInit method to support touch events.
     * This method extends the widget with bound touch event handlers that
     * translate touch events to mouse events and pass them to the widget's
     * original mouse event handling methods.
     */
    mouseProto._mouseInit = function() {

        var self = this;

        // Delegate the touch handlers to the widget's element
        self.element.bind('touchstart', $.proxy(self, '_touchStart')).bind('touchmove', $.proxy(self, '_touchMove')).bind('touchend', $.proxy(self, '_touchEnd'));

        // Call the original $.ui.mouse init method
        _mouseInit.call(self);
    };
})(jQuery);


//BrightCove - MCM event bridge
(function($,w,d,u){
	$(d).ready(function(){
		w.setTimeout(function(){
			if(!w.brightcove) return;
			w.BCV = {
				callbacks:{
					__done	:false,
					playHdlr:{},
					play	:function(e){
						var m = e.media.displayName,
							p = d.title.split(/[^a-zA-Z 0-9]+/g)[0],
							elem;
						
						if(dcsMultiTrack){dcsMultiTrack(	
							'DCS.dcsuri','/flash/Vid/'+w.BCV.utils.format(p,'dcsuri')+'/'+w.BCV.utils.format(m,'dcsuri')+'/PlayBtn',
							'WT.ti','Flash:FHC:Vid:'+w.BCV.utils.format(p,'ti')+':'+w.BCV.utils.format(m,'ti')+':PlayBtn',
							'WT.pn_sku','','WT.tx_u','','WT.tx_e','','HSBC_u','','HSBC_e','','WT.si_n','','WT.si_x',''
						)};
						
						if(w.csaHSBCclick){w.csaHSBCclick({ 
							name	:e.target._name, 
							id		:e.target.experience.id, 
							alt		:e.media.displayName, 
							src		:e.media.FLVFullLengthURL, 
							href	:e.media.thumbnailURL, 
							tagName	:e.target.experience.type
						 })};
					},
					template:function(e){
						window.setTimeout(function(){
							try{
								var ex, exp, fn;
								for(ex in window.brightcove.experiences){
									exp = window.brightcove.api.getExperience(ex);
									if(exp instanceof window.brightcove.api.BrightcoveExperience){
										window['cb_'+exp.id] = function(){window.BCV.callbacks.play(arguments[0])};
										exp.getModule(window.brightcove.api.modules.APIModules.VIDEO_PLAYER).addEventListener(window.brightcove.api.events.MediaEvent.PLAY, window['cb_'+exp.id]);
									}
								}
							}catch(e){}
						},5000);
					}
				},
				utils	:{
					format	:function(s, f){
						switch(f){
							case 'dcsuri' 	: return $.trim((' '+s).toLowerCase().replace(/\s(.)/g,function(){return arguments[1].toUpperCase();}));
							case 'ti'		: return $.trim(s.toLowerCase().replace(/\s/g,'').replace(/^\w/g,function(){return arguments[0].toUpperCase()}));
							default 		: return $.trim(s);
						}
					}
				},
				objToHTML	:function(o){if(!o.id || !o.c || !o.p) return;var r='<object id="'+o.id+'" class="'+o.c+'">',k;for(k in o.p)r+='<param name="'+k+'" value="'+o.p[k]+'"/>';return r+'</object>';},
				dataToObj	:function(d){if(d.indexOf('?')<0 && d.indexOf('&')<0)return;var a=d.split('?')[1].split('&'),q=a.length,o={},b;while(q--){b=a[q].split('=');if(b.length>1)o[b[0].replace('amp;')]=b[1];}return o;},
				domObjToObj	:function(h){if(!h||!h.nodeName||!h.nodeName.toLowerCase==='object')return;var o={id:h.id,c:h.className},n;for(n in h.childNodes){if(h.childNodes[n])o[h.childNodes[n].name]=h.childNodes[n].value;}return o;},
				buildObj	:function(a){
					a = a || {};
					var o = {}, t;
					o.id = a.id||'';
					o.c = a.className||'';
					if('data' in a){
						//post create
						t = this.dataToObj(decodeURIComponent(a.data));
						if(!t) return null;
						o.p = {
							bgcolor:t.bgcolor||'',
							width:t.width||'',
							height:t.height||'',
							playerID:t.playerID||'',
							playerKey:t.playerKey||'',
							isVid:t.isVid||'',
							isUI:t.isUI||'',
							dynamicStreaming:t.dynamicStreaming||'',
							wmode:t.wmode||'',
							includeAPI:true,
							secureConnections:location.protocol==='https:',
							secureHTMLConnections:location.protocol==='https:',
							templateLoadHandler:"BCV.callbacks.template",
							templateReadyHandler:"BCV.callbacks.template",
							"@videoPlayer":t["@videoPlayer"]||''
						}
					}
					return this.objToHTML(o);
				}
			};
			
			if('Premier2014' in w && 'videoLightbox' in w.Premier2014){
				w.Premier2014.videoLightboxOld = w.Premier2014.videoLightbox;
				w.Premier2014.videoLightbox = function(arguments){
					w.Premier2014.videoLightboxOld(arguments);
					w.BCV.callbacks.template(arguments);
				}
			}
			
			if(!w.BCV.callbacks.__done) w.BCV.callbacks.template();
			
			var nH;
			$('body object.BrightcoveExperience').each(function(){
				nH = w.BCV.buildObj(this);
				if(nH) this.outerHTML=nH;
				
			}).show();
			w.brightcove.createExperiences();
		},1500);	
	});	
	$('body object.BrightcoveExperience').hide();
})(jQuery,window,document);