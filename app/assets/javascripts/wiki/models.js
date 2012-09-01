
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
	

	models.projects = new ProjectsList();	
	
	
})(jQuery);