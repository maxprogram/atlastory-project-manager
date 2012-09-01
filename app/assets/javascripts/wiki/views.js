
var app = app || {}, models = models || {};

(function($){
	
	// Load functions
	$(function(){
		
		app = new App();
		
		app.sidebar = new Sidebar();
		
	});
	
	// Element shortcuts
	var $page		= $("#page"),
		$header		= $("#header"),
		$container	= $(".container"),
		$sidebar 	= $(".sidebar"),
		$projects	= $(".side-projects"),
		$currProj	= $("#current-project");
		
	
	// App view
	/////////////////////
	
	var App = Backbone.View.extend({
		el: $(window),
		events: {
			"resize": "resize"
		},
		initialize: function(){
			this.project_id = 1; // "Today" id = 1
			this.resize();
		},
		resize: function(){
			var appHeight	= this.$el.height(),
				headHeight	= $header.height();
			$page.height(appHeight);
			$container.height(appHeight - headHeight);
		}
	});

	

	// Sidebar list view
	/////////////////////
	
	var Sidebar = Backbone.View.extend({
		el: $sidebar,
		events: {
			"click #todayList": "openToday",
			"click #projectList": "openProjects"
		},
		initialize: function(){
			models.projects.on("add change reset", this.render, this);
		},
		render: function(){
			$projects.empty();
			models.projects.each(function(project,i){
				if (project.get("id")==1) return; // Don't show "Today" list
				if (project.get("status")!="current") return; // Only show current projects
				var projectView = new SidebarView({model: project});
				$projects.append(projectView.render().el);
			});
		},
		openToday: function(){
			$("li",$sidebar).removeClass("active");
			this.$("#todayList").addClass("active");
			$currProj.html("Today");
			
			
		},
		openProjects: function(){
			$("li",$sidebar).removeClass("active");
			this.$("#projectList").addClass("active");

			
		}
	});
	
	// Sidebar view
	/////////////////////
	
	var SidebarView = Backbone.View.extend({
		tagName: "li",
		className: "sub",
		template: JST['project'],
		events: {
			"click"	: "change"
		},
		initialize: function(){
			this.model.on("change", this.render, this);
			this.model.on("destroy", this.unrender, this);
		},
		render: function(){
			var id = this.model.get("id"),
				name = this.model.get("name");
			this.$el.html(this.template({name: name, id: id}));
			return this;
		},
		change: function(e){
			$("li",$sidebar).removeClass("active");
			this.$el.addClass("active");
			
			// Switches list model + creates new view
			var project = parseInt($(e.target).attr("data"));
			
			// Fetches specific project tasks from server
			app.todos.fetch({ data: {project_id: project} });
			
			app.project_id = project;
			$currProj.html(models.projects.getName(project));
		},
		unrender: function(){
			this.$el.remove();
		}
	});


	
})(jQuery);





