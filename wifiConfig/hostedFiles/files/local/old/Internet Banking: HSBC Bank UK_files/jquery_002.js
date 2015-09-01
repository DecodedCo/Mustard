/**
 * @projectDescription: jQuery plugin for replacing default <select> or <ul> with custom ones.
 * @version: 2.10
 */
(function($){
	
    $.fn.customSelect = function(opts){
        opts = $.extend({
            active: 'active',
            startValue: null,
            maxHeight: 300,
            zIndexStart: 0
        }, opts);
		
        var noOfElems = this.length;
        return this.each(function(i){			
            var selectExists = true;
            if(!$(this).find('select').length){
                selectExists = false;
            }
			
            var $this = $(this),
            $node = selectExists ? $this.find('select').hide() : $this.find('ul').hide(),
            $menu = $('<div class="customSelectMenu">').css('zIndex', opts.zindexStart + noOfElems-i).appendTo($this),
            $valueRegion = $('<div tabIndex="0" class="valueRegion"><div class="valueRegionInner"><div class="arrow"/></div></div>"').appendTo($menu),
            $value = $('<div class="value" />').css('overflow', 'hidden').width(100).prependTo($valueRegion.find('.valueRegionInner')),
            $list = $('<ul role="menu" id="menu' + i + '" />').appendTo($menu),
            selectIndex = 0,
            changeCount = 0,
            scrollable = false;
			
            if(selectExists){
                if(typeof($.fn.prop) === 'function'){
                    var selectIndex = $node.prop('selectedIndex');
                }
                else{
                    var selectIndex = $node.attr('selectedIndex');
                }
            }

            $list.css('float', 'left');
            $node.find('option, li').each(function(i){
                var className = '';
                if(i === $node.find('option, li').length-1){
                    className = 'last';
                }
                var $listItem = $(
                    '<li class="' + className + '" role="menuitem" aria-haspopup="menu' + i + '"><span>' + $(this).text() + '</span></li>'
                    ).appendTo($list);
				
                if($(this).find('a').length){
                    $listItem.html(
                        '<span><a href="' + $(this).find('a').attr('href') + '">' + $(this).text() + '</a></span>'
                        );
                }
            });
			
            if($list.width() < $valueRegion.width()){
                $list.width($valueRegion.width());
            }
            else{
                $list.width($list.width());
            }
			
            var width = $list.width();
            if($list.height() >= opts.maxHeight){
                scrollable = true;
                $list.css({
                    height: opts.maxHeight,
                    overflowY: 'scroll'
                });
                width += 20;//add 20px for scrollbar
            }
			
            $list.css({
                'float': 'none',
                position:'absolute',
                width: width
            });
			
            var visibleItems = Math.floor($list.height()/$list.find('li').eq(0).outerHeight());
            $list.hide();
			
            $valueRegion.click(function(e){
                e.preventDefault();
                if($list.is(':visible')){
                    highlight();
                    close();
                }
                else{
                    open();
                }
            });
            $(document).click(function(e){
                if(!$.contains($this[0], e.target)){
                    close();
                }
            });
            var $links = $list.find('li');
            $links.each(function(i){
                $(this)
                .click(function(){
                    selectIndex = i;
                    change();
                    $list.hide();
                })
                .hover(function(){
                    selectIndex = i;
                    highlight();
                }, function(){
                    $(this).removeClass(opts.active);
                });
            });
            $valueRegion.keydown(function(e){
                var keycode = e.keyCode,
                listSize = $list.find('li').length-1
                direction = '';
                if(keycode <= 40 && keycode >= 13){
                    if((keycode === 40) && (e.altKey)){ //alt & down key
                        if(!$list.is(':visible')){
                            open();
                        }
                    }
                    else if(((keycode === 38) && (e.altKey)) || (keycode === 27)){ //alt & up key or esc key
                        if($list.is(':visible')){
                            close();
                        }
                    }
                    else if((keycode === 40) || (keycode === 39)){ //down or right key
                        if(selectIndex < listSize){
                            selectIndex++;
                            direction = 'down';
                        }
                    }
                    else if((keycode === 38) || (keycode === 37)){ //up or left key
                        if(selectIndex > 0){
                            selectIndex--;
                            direction = 'up';
                        }
                    }
                    else if((keycode === 34) || (keycode === 35)){ //page down or end key
                        if(selectIndex < listSize){
                            selectIndex = listSize;
                            direction = 'down';
                        }
                    }
                    else if((keycode === 33) || (keycode === 36)){ //page up or home key
                        if(selectIndex > 0){
                            selectIndex = 0;
                            direction = 'up';
                        }
                    }
                    else if(keycode === 13){ //enter key
                        close();
                        if(!selectExists){
                            document.location = $list.find('li a').eq(selectIndex).attr('href');
                        }
                    }
                    change(direction);
                    //prevent default window scroll events
                    return false;
                }
            });
			
            $this.find('label').click(function(){
                $valueRegion.focus();
            });
			
            change();
			
            /**
			 * Opens the list
			 */
            function open(){
                $list.show();
                $menu.addClass('open');
                $this.trigger('onopencustomselect', selectIndex);
                highlight();
                scroll('down');
            }
            /**
			 * Closes the list
			 */
            function close(){
                $list.hide();
                $menu.removeClass('open');
                $this.trigger('onclosecustomselect', selectIndex);
            }
            /**
			 * Remove the active class from all list items and add it to the selected index
			 */
            function highlight(){
                $links.removeClass(opts.active);
                $links.eq(selectIndex).addClass(opts.active);
            }
            /**
			 * Change the selected value of the custom and real select boxes
			 */
            function change(direction){
                if(changeCount == 0 && opts.startValue != null){
                    $value.text(opts.startValue);
                }
                else{
                    $value.text($list.find('li').eq(selectIndex).text());
                }
				
                truncateValue();
				
                if(selectExists){
                    if(typeof($.fn.prop) === 'function'){
                        $node.prop('selectedIndex', selectIndex);
                    }
                    else{
                        $node.attr('selectedIndex', selectIndex);
                    }
                }
                $this.trigger('onchangecustomselect', selectIndex);
                $menu.removeClass('open');
                highlight();
                if(scrollable){
                    scroll(direction);
                }
                changeCount++;
            }
            /**
			 * Truncates the text in $value with an ellipsis.
			 */
            function truncateValue(){
                $value.css({
                    height: 'auto',
                    overflow: 'visible'
                });
				
                var txt = $value.text(),
                lh = $value.text('.').height();
		
                $value.text(txt);
                while($value.height()>1*lh && txt.length) {
                    txt = txt.substr(0, txt.length-1).replace(/\W$/,'');
                    $value.text(txt + '...');
                }
            }
            /**
			 * Scrolls the list to show the highlighted item if it is not visible.
			 * @param: direction {String} - 'up' or 'down'
			 */
            function scroll(direction){
                var itemHeight = $links.eq(selectIndex).outerHeight();
				
                if(direction === 'down' && selectIndex > visibleItems-1){
                    $list.scrollTop((itemHeight * ((visibleItems-1) - selectIndex)*-1));
                }
                else if(direction === 'up' && $links.eq(selectIndex).position().top < 0){
                    $list.scrollTop(itemHeight * selectIndex);
                }
            }
        });
    }
	
})(jQuery);