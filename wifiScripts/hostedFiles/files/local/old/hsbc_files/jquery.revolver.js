/*
 * @projectDescription Creates a revolving series of content slides
 * @version: 2.15
 * @optional: jquery.onfontresize.js
 */
(function($){	
    $.fn.revolver = function(opts){
        opts = $.extend(true,{
            duration: 500,
            interval: 7500,
            index: 0,
            selectors: {
                item: 			'.revolverItem',
                prev: 			'.revolverPrev',
                next: 			'.revolverNext',
                pager: 			'.revolverPager',
                select:			'.revolverSelect'
            },
            classes: {
                window:				'revolverWindow',
                belt: 				'revolverBelt',
                pagerItem: 			'pagerItem',
                pagerItemSelected: 	'pagerItemSelected',
                prevDisabled: 		'prevDisabled',
                nextDisabled: 		'nextDisabled',
                selected:			'selected'
            },
            infinite: true,
            mobile: false,
            selected: -1,
            stopOnHover: true,
            movedItems:	1
        }, opts);
		
        return this.each(function(){
            var $this = $(this),
            $window = $this.find('.' + opts.classes.window),
            $belt = $this.find('.' + opts.classes.belt),
            $prev = $this.find(opts.selectors.prev),
            $next = $this.find(opts.selectors.next),
            maxHeight = 0,
            currIndex = opts.index,
            visibleItems = 0,
            busy = false,
            autoPlayTimer = null,
            items = [],
            filteredItems = [],
            selected = opts.selected;
            
            if(!$window.length){
                $window = $('<div class="' + opts.classes.window + '"/>').prependTo($this).width($this.width());
                $belt = $('<div class="' + opts.classes.belt + '"/>').prependTo($window);
            }
			
            var $pager = null;
            $this.find(opts.selectors.pager).empty();
            if($this.find(opts.selectors.pager)[0].nodeName !== 'UL'){
                $this.find(opts.selectors.pager).append('<ul />');
                $pager = $this.find(opts.selectors.pager + ' ul');
            }
            else{
                $pager = $this.find(opts.selectors.pager);
            }
			
            var $items = $this.find(opts.selectors.item).appendTo($belt),
            itemWidth = $items.outerWidth();
				
            //add aria role attributes
            $this.attr({
                'aria-live':		'polite',	
                'aria-relevant':	'all'
            });
			
            //load images before revolver is called
            var imageTotal = $this.find('img').length,
            imageCount = 0;
				
            if(imageTotal){
                $this.find('img').each(function(){
                    $(this)
                    .attr('src', $(this).attr('src') + '?' + new Date().getTime())
                    .load(function(){
                        if(++imageCount == imageTotal){
                            loadComplete();
                        }
                    });
                });
            }
            else{
                loadComplete();
            }
			
            /**
			 * Sets relevant css properties and makes calls to other functions.
			 */
            function loadComplete(){
                $items.each(function(i){
                    maxHeight = Math.max(maxHeight, $(this).outerHeight());
					
                    if((i+1) * itemWidth <= $window.width()){
                        visibleItems++;
                    }
                    if(opts.infinite){
                        items.push($(this));
                    }
                });
                if (visibleItems === 0){
                    visibleItems = 1;
                }
				
                //return if not enough items to warrant revolver
                if($items.length <= visibleItems){
                    $this.trigger('onabortrevolver');
                    return;
                }
				
                if(opts.infinite){
                    filteredItems = items;
                    filter();
                }
				
                $window.css({
                    position: 'relative',
                    height: maxHeight,
                    overflow: 'hidden'
                });
                $belt.css({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: getBeltWidth(itemWidth)
                });
				
                if(typeof $.onFontResize === 'object'){
                    $(document).bind('fontresize', function(){
                        $window.height(getMaxHeight());
                    });
                }
				
                drawPager();
                bindNavEvents();
                bindCustomEvents();
				
                if(opts.selected != -1){
                    $(opts.selectors.select).live('click', function(){
                        $this = $(this);
                        selected = $this.closest(opts.selectors.item).attr('data-index');
                        $(opts.selectors.item).removeClass(opts.classes.selected);
                        $this.closest(opts.selectors.item).addClass(opts.classes.selected);
                    });
                }
                $this.trigger('onloadcompleterevolver');
            }
            /**
			 * Gets the width of the belt
			 */
            function getBeltWidth(width){
                return width * $items.length;
            }
            /**
			 * Displays prev and next buttons and binds click events to them.
			 * Sets autoplay if opts.interval > 0.
			 */
            function bindNavEvents(){
                $prev
                .css({
                    display: 'block',
                    cursor: 'pointer'
                })
                .click(function(e){
                    e.preventDefault();
                    if(!$(this).hasClass(opts.classes.prevDisabled)){
                        change(currIndex-opts.movedItems, false, true, true);
                    }
                });
                $next
                .css({
                    display: 'block',
                    cursor: 'pointer'
                })
                .click(function(e){
                    e.preventDefault();
                    if(!$(this).hasClass(opts.classes.nextDisabled)){
                        change(currIndex+opts.movedItems, false, true, true);
                    }
                });
					
                if(opts.interval > 0){
                    setTimer(currIndex+opts.movedItems);
                    if(!opts.mobile && opts.stopOnHover){
                        $this.hover(function(){
                            clearInterval(autoPlayTimer);
                        }, function(){
                            setTimer(currIndex+opts.movedItems);
                        });
                    }
                }
            }
            /**
			 * Binds custom events to $this.
			 */
            function bindCustomEvents(){
                $this
                .bind('changerevolver', function(e, index){
                    change(index, false, true);
                })
                .bind('stoprevolver', function(){
                    clearInterval(autoPlayTimer);
                })
                .bind('startrevolver', function(){
                    setTimer(currIndex+1);
                })
                .bind('changeselectedrevolver', function(e, index){
                    selected = index;
                    $(opts.selectors.item).removeClass(opts.classes.selected);
                    filteredItems[index].addClass(opts.classes.selected);
                })
                .bind('filterbyclassrevolver', function(e, className, exclude){
                    filterByClass(className, exclude);
                })
                .bind('changeitemsrevolver', function(e, elements, selected){
                    filteredItems = elements;
						
                    currIndex = 0;
                    filter();
                    drawPager();
                    change(currIndex, true, true);
                })
                .bind('resizerevolver', function(e, width, height){
                    $window.css({
                        width: width,
                        height: height
                    });
                    $items.width(width);
                    $belt.width(getBeltWidth(width));
                    itemWidth = width;
                });
            }
            /**
			 * Draws the pager items and attaches pager events
			 */
            function drawPager(){
                $pager.empty().show();
                for(var i=0; i<filteredItems.length; i++){
                    var className = (i === filteredItems.length-1) ? 'last' : '',
                    $pagerItem = $(
                        '<li><a href="#" class="' + opts.classes.pagerItem + ' ' + className + '">' +
                        'Carousel item ' + (i+1) +
                        '</a></li>'
                        );
                    $pager.append($pagerItem);
                }
                $pager.find('.' + opts.classes.pagerItem).each(function(i){
                    $(this)
                    .css('text-indent', '-9999px')
                    .click(function(e){
                        e.preventDefault();
                        change(i, false, true, true);
                    });
                });
                updatePager(currIndex);
                if($pager.find('.' + opts.classes.pagerItem).length-1 < visibleItems){
                    $pager.hide();
                }
            }
            /**
			 * Appends filtered items to the belt
			 */
            function filter(){
                for(var i=0; i<filteredItems.length; i++){
                    filteredItems[i]
                    .hide()
                    .attr({
                        'data-index': i,
                        'aria-hidden': 'true'
                    });
                }
				
                for(var i=0; i<visibleItems; i++){
                    filteredItems[currIndex+i]
                    .show()
                    .attr('aria-hidden', 'false');
                }
            }
            /**
			 * Filters the items by class.
			 * @param: className {string} - class to filter by
			 * @param: exclude {boolean} - exclude the filter items
			 */
            function filterByClass(className, exclude){
                if(busy){
                    setTimeout(function(){
                        filterByClass(className, exclude)
                        }, opts.duration);
                    return;
                }
                else{
                    filteredItems = [];
                    var filteredIndex = 0;
                    $.each(items, function(index){
                        $this = $(this);
                        if(exclude){
                            if(!$this.hasClass(className)){
                                filteredItems[filteredIndex] = items[index];
                                filteredItems[filteredIndex]
                                .show()
                                .attr({
                                    'data-index': filteredIndex,
                                    'aria-hidden': 'false'
                                });
                                filteredIndex++;
                            }
                        }
                        else{
                            if($this.hasClass(className)){
                                filteredItems[filteredIndex] = items[index];
                                filteredItems[filteredIndex]
                                .show()
                                .attr({
                                    'data-index': filteredIndex,
                                    'aria-hidden': 'false'
                                });
                                filteredIndex++;
                            }
                        }
                    });
					
                    currIndex = 0;
                    $belt.empty();
                    for(var i=0; i<filteredItems.length; i++){
                        $belt.append(filteredItems[i]);
                    }
                    drawPager();
                    change(currIndex, true, true, true);
					
                    //return if not enough items to warrant revolver
                    if(filteredIndex <= visibleItems){
                        $prev.hide();
                        $next.hide();
                        if(opts.interval > 0){
                            clearInterval(autoPlayTimer);
                        }
                    }
                    else{
                        $prev.show();
                        $next.show();
                        if(opts.interval > 0){
                            setTimer(currIndex + opts.movedItems);
                        }
                    }
                }
            }
            /**
			 * Gets the maximum height of all items
			 * @returns maximum height
			 */
            function getMaxHeight(){
                var height = 0;
                $items.each(function(){
                    height = Math.max(height, $(this).outerHeight());
                });
                return height;
            }
            /**
			 * Sets the timer to run the autoplay functionality
			 * @param: index {int} - index to start autoplay at
			 */
            function setTimer(index){
                var timeIndex = index;
                clearInterval(autoPlayTimer);
                autoPlayTimer = setInterval(function(){
                    change(timeIndex, false);
                    if(opts.infinite && timeIndex >= filteredItems.length) {
                        timeIndex = (timeIndex - filteredItems.length) + opts.movedItems;
                    } 	
                    else if(!opts.infinite && timeIndex >= $items.length - visibleItems) {
                        timeIndex = 0;
                    }
                    else{
                        timeIndex += opts.movedItems;
                    }
                }, opts.interval);
            }
            /**
			 * Changes the visible panels.
			 * @param: index {int} - index to change to
			 * @param: snap {boolean} - whether to snap or animate
			 * @param: resetTimer {boolean} - whether to reset the timer or not
			 * @param: userDriven {boolean} - whether the user has made the revolver change or not
			 */	
            function change(index, snap, resetTimer, userDriven){
                var duration = snap ? 0 : opts.duration;
				
                if(!opts.infinite){
                    if(index > filteredItems.length - visibleItems){
                        index = filteredItems.length - visibleItems;
                    }
                }
                if(opts.interval > 0 && resetTimer){
                    clearInterval(autoPlayTimer);
                }
                if(!busy){
                    busy = true;
					
                    if(opts.infinite){ 
                        var left = 0,
                        forward = true,
                        count = 0,
                        limit = index+visibleItems;
						
                        //calculate closest direction					
                        var forwardDist = 0, 
                        backDist = 0;
                        if(currIndex < index){
                            forwardDist = index - currIndex;
                            backDist = filteredItems.length - forwardDist;
                        }
                        else if(currIndex > index){
                            backDist = currIndex - index;
                            forwardDist = filteredItems.length - backDist;
                        }
						
                        if(forwardDist < backDist){
                            forward = true;	
                        }
                        else if(forwardDist === backDist){
                            if(index > currIndex){
                                forward = true;
                            }
                            else{
                                forward = false;
                            }
                        }
                        else{
                            forward = false;	
                        }
											
                        if(index < 0){
                            index = filteredItems.length - (index*-1);
                        }
						
                        if(forward){
                            for(var i=0; i<forwardDist; i++){
                                var itemNum = currIndex+visibleItems+i;
                                if (itemNum >= filteredItems.length){
                                    itemNum = itemNum - filteredItems.length;	
                                }
                                var item = filteredItems[itemNum];
                                if (opts.selected != -1 && item.attr('data-index') != selected){
                                    item.removeClass(opts.classes.selected);
                                }
                                $belt.append(item.show().attr('aria-hidden', 'false'));
                                count++;
                            }
                            left = (itemWidth*forwardDist)*-1;
                        }
                        else{
                            for(var i=0; i<backDist; i++){
                                var itemNum = currIndex-i-1;
                                if (itemNum < 0){
                                    itemNum = filteredItems.length+(currIndex-i-1);
                                }
                                var item = filteredItems[itemNum];
                                if (opts.selected != -1 && item.attr('data-index') != selected){
                                    item.removeClass(opts.classes.selected);
                                }
                                $belt.prepend(item.show().attr('aria-hidden', 'false'));
                                count++;
                            }
                            $belt.css('left', (itemWidth*backDist)*-1);
                            left = 0;
                        }
												
                        if(index > filteredItems.length-1){
                            index = index - filteredItems.length;
                        }
						
                        $this.trigger('onbeforechangerevolver', currIndex);
                        $belt.animate({
                            left: left
                        }, duration, function(){
                            updatePager(index);
                            $belt.children().each(function(i){
                                var itemIndex = parseInt($(this).attr('data-index'));
                                var inRange = calcWithinRange(itemIndex, index, visibleItems, filteredItems.length);
                                if(!inRange){
                                    $(this).hide().attr('aria-hidden', 'true');
                                }
                            });
                            $belt.css('left', 0);
                            busy = false;
							
                            if(opts.interval > 0 && resetTimer){
                                setTimer(index+1);
                            }
							
                            if(userDriven){
                                //focus on first <a> for accessibility
                                $belt.find(opts.selectors.item + ':visible').find('a:eq(0)').focus();
                            }
							
                            currIndex = index;
                            $this.trigger('onchangerevolver', currIndex);
                        });
                    }
                    else{
                        $this.trigger('onbeforechangerevolver', currIndex);
                        $belt.animate({
                            left: (index * itemWidth) * -1
                            }, duration, function(){
                            updateNavigation(index);
                            updatePager(index);
                            busy = false;
							
                            if(opts.interval > 0 && resetTimer){
                                setTimer(index+1);
                            }
							
                            if(userDriven){
                                //focus on first <a> for accessibility
                                $belt.find(opts.selectors.item + ':visible').eq(0).find('a').focus();
                            }
							
                            currIndex = index;
                            $this.trigger('onchangerevolver', currIndex);
                        });
                    }
                }
            }
            /**
			 * Updates the navigation
			 * @param: index {int} - current index of visible panels
			 */
            function updateNavigation(index){
                if(index == 0){
                    $prev.addClass(opts.classes.prevDisabled);
                }
                else{
                    $prev.removeClass(opts.classes.prevDisabled);
                }
				
                if(index == $items.length - visibleItems){
                    $next.addClass(opts.classes.nextDisabled);
                }
                else{
                    $next.removeClass(opts.classes.nextDisabled);
                }
            }
            /**
			 * Updates the pager
			 * @param: index {int} - current index of visible panels
			 */
            function updatePager(index){ 
                $pager.find('.' + opts.classes.pagerItem).each(function(i){
                    if((i >= index && i < index+visibleItems) || (opts.infinite && (i <= index + (visibleItems-1)-filteredItems.length))){
                        $(this)
                        .attr('title', 'Current carousel item')
                        .addClass(opts.classes.pagerItemSelected);
                    }
                    else{
                        $(this)
                        .attr('title', '')
                        .removeClass(opts.classes.pagerItemSelected);
                    }
                });
            }
            /**
			 * Calculates if the current index item is within the range of visible elements
			 * @param: itemIndex: The index position of the specified element
			 * @param: index: The index of the first visible item on the page
			 * @param: visibleItems: The number of visible items within the set
			 * @param: setSize: size of the set of items
			 * @returns: Boolean (true if in range else false) 
			*/
            function calcWithinRange(itemIndex, index, visibleItems, setSize){
                //calculate range of values
				
                var tempIndex = index;
                var valueRange = new Array(visibleItems);
				
                for(var i = 0; i < visibleItems; i++){
                    if(tempIndex > setSize-1){
                        tempIndex = 0;	
                    }
                    valueRange[i] = tempIndex;
                    tempIndex++;
                }
                //check if value is in the calculated range
                if($.inArray(itemIndex, valueRange) != -1){
                    return true;	
                }
                else{
                    return false;	
                }
            }
        });
    }
})(jQuery);