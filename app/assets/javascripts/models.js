
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
			status: "next",
			category: "personal",
			due_date: "",
			completed: false,
			project_order: 90,
			today_order: 90
		},
		initialize: function(){
			// Saves task to the currently displayed project
			if (!this.get("project_id"))
				this.save("project_id",app.project_id);
		},
		toggle: function(){
			var done = this.get("completed"),
				status = this.get("status");
			// If it's a project task, toggle archive also
			if (this.get("project_id")!=1 && status!="today")
				status = (done) ? "next" : "archive";
			this.save({
				completed: !done,
				status: status
			});
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
			var done = this.get("completed");
			this.save({
				completed: !done,
				status: (done) ? "current" : "archive"
			});
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
		render: function(){
			this.sort({silent:true});
		},
		completed: function(){
			return this.filter(function(task){
				return task.get("completed")
			});
		}
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
		render: function(){
			this.sort({silent:true});
		},
		getProject: function(id){
			return this.find(function(project){
				return project.get("id")==id
			});
		},
		getName: function(id){
			var project = this.getProject(id);
			var name = (project) ? project.get("name") : "";
			return name;
		}
	});

	// Rails collections
	var TodayList = List.extend({ url: "/today" });
	
	// Collection for project lists
	var ProjectList = List.extend({
		url: "/tasks",
		comparator: function(t){
			return parseFloat(t.get("project_order"));
		},
		initialize: function(){
			this.on("all", this.render, this);
		}
	});

	models.projects = new ProjectsList();
	models.today = new TodayList();
	models.project = new ProjectList();
	
	
})(jQuery);