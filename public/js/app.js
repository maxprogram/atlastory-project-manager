
var app = app || {};

(function($){
	
	// Load functions
	$(function(){
		
		app = new App();
		$('.dropdown-toggle').dropdown();
	});
	
	// Element shortcuts
	var $page		= $("#page"),
		$header		= $("#header"),
		$container	= $(".container");
		
	
	// App view
	var App = Backbone.View.extend({
		el: $(window),
		events: {
			"resize": "resize"
		},
		initialize: function(){
			this.resize();
			
		},
		resize: function(){
			var appHeight	= this.$el.height(),
				headHeight	= $header.height();
			$page.height(appHeight);
			$container.height(appHeight - headHeight);
		}
	});


	
})(jQuery);

