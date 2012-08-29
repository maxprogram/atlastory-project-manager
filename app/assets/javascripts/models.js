
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


var app = app || {}, models = models || {};

(function($){

	var Task = Backbone.Model.extend({
		defaults: {
			name: "",
			description: "",
			project: "today",
			status: "today",
			category: "personal",
			due_date: "",
			completed: false,
			project_order: 100,
			today_order: 100
		},
		toggle: function(){
			this.save({completed: !this.get("completed")});
		}
	});
	
	// Collection for all lists
	var List = Backbone.Collection.extend({
		model: Task,
		comparator: function(t){
			return parseFloat(t.get("today_level"));
		},
		initialize: function(){
			this.on("all", this.render, this);
			//this.fetch();
		},
		render: function(){}
	});

	// Collection for today list
	var TodayList = List.extend({ url: "/tasks/today" });
	
	// Collection for project lists
	models.ProjectList = List.extend({
		url: function(){
			var base = "/tasks";
			return base;
		},
		comparator: function(t){
			return parseFloat(t.get("project_order"));
		}
	});

	models.today = new List();
	
	
})(jQuery);