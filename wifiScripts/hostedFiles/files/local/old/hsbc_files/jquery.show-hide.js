/**
 * @projectDescription: jQuery plugin for show/hiding content with a trigger
 */
 
(function($){
	$.fn.showHide = function(opts) {
		
		opts = $.extend({
			activeClass: 'open',
			duration: 'normal',
			event: 'click',
			trigger: '.showHideTrigger',
			content: '.showHideContent'
		}, opts);
		
		return this.each(function(i) {
			var $this = $(this),
				$trigger = $this.find(opts.trigger),
				$content = $this.find(opts.content);

			$content.hide().attr('aria-hidden', true);
			
			$trigger.bind(opts.event, function(e) {
				e.preventDefault();
				toggle();
			});
			
			$this.bind('toggle.showHide', function(){
				toggle();
			});
			
			/**
			 * Toggles the content node and adds/removes relevant classes
			 * 
			 * @param: {Boolean} slide - slide $content or not
			 */
			function toggle(slide){
				if(!slide){
					$content.slideToggle(opts.duration, function(){
						setTriggers();
					});
				}
				else{
					$content.show();
					setTriggers();
				}
				$trigger.toggleClass(opts.activeClass);
			}
			
			/**
			 * Sets onopen and onclose triggers
			 */
			function setTriggers(){
				if($trigger.hasClass(opts.activeClass)){
					$this.trigger('onopen.showHide');
					$content.attr('aria-hidden', false);
				}
				else{
					$this.trigger('onclose.showHide');
					$content.attr('aria-hidden', true);					
				}
			}
		});
	};
})(jQuery);

(function($){

	$(function () {
		$('#products tbody').showHide({
			trigger: '.furtherInfo .handle a',
			content: '.furtherInfo .content',
			activeClass: 'selected'
		});
	});
	
})(jQuery);
