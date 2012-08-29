
Backbone.old_sync = Backbone.sync
Backbone.sync = function(method, model, options) {
    var new_options =  _.extend({
        beforeSend: function(xhr) {
            var token = jQuery('meta[name="csrf-token"]').attr('content');
            if (token) xhr.setRequestHeader('X-CSRF-Token', token);
        }
    }, options)
    Backbone.old_sync(method, model, new_options);
};


var app = app || {};

(function($){

	var MODEL = Backbone.Model.extend({
		urlRoot: "",
		defaults: {}
	});
	
	app.COLLECTION = Backbone.Collection.extend({
		model: MODEL,
		url: ""
	});
	
	
})(jQuery);