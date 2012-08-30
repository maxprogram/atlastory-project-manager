
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
			project_id: 1,
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

	var Project = Backbone.Model.extend({
		defaults: {
			name: "",
			description: "",
			status: "current",
			category: "personal",
			due_date: "",
			links: "",
			completed: false,
			order: 100
		},
		toggle: function(){
			this.save({completed: !this.get("completed")});
		}
	});
	
	// Collection for all lists
	var List = Backbone.Collection.extend({
		model: Task,
		comparator: function(t){
			return parseFloat(t.get("today_order"));
		},
		initialize: function(){
			this.on("all", this.render, this);
			this.fetch();
		},
		render: function(){}
	});

	// Collection for list of projects
	var ProjectsList = Backbone.Collection.extend({
		model: Project,
		url: "/projects",
		comparator: function(t){
			return parseFloat(t.get("order"));
		},
		initialize: function(){
			this.on("all", this.render, this);
			this.fetch();
		},
		render: function(){},
		getProject: function(id){
			return this.find(function(project){
				return project.get("id")==id
			});
		}
	});

	// Rails collections
	var TodayList = List.extend({ url: "/today" });
	
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

	models.today = new TodayList();
	models.projects = new ProjectsList();
	
	
})(jQuery);