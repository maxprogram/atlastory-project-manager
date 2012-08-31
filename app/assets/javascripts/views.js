/*_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g,
    evaluate: /\{%(.+?)%\}/g	
};*/

var app = app || {}, models = models || {};

(function($){
	
	// Load functions
	$(function(){
		
		app = new App();
		app.list = new TaskList();
		app.sidebar = new Sidebar();

		$('.dropdown-toggle').dropdown();
	});
	
	// Element shortcuts
	var $page		= $("#page"),
		$header		= $("#header"),
		$container	= $(".container"),
		$sidebar 	= $(".sidebar"),
		$projects	= $(".side-projects"),
		$list 		= $(".list"),
		$listItems	= $(".list .list-items"),
		$newInput	= $("#new-task"),
		$taskTemp	= $("#task-template"),
		$currProj	= $("#current-project");
		
	
	// App view
	var App = Backbone.View.extend({
		el: $(window),
		events: {
			"resize": "resize"
		},
		initialize: function(){
			this.todos = models.today;
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

	// Task list view
	var TaskList = Backbone.View.extend({
		el: $list,
		events: {
			"keypress #new-task": "add"
		},
		initialize: function(){
			_.bindAll(this,"add");
			
			$listItems.sortable({
				constraint: 'y',
				xbounds: [0,5000],
				ybounds: [0,5000],
				placeholderClass: 'task done',
				dragClass: 'dragging'
			});
			
			app.todos.on("add change reset", this.render, this);
			app.todos.on("change:order", this.orderChange, this);
		},
		render: function(){
			var self = this;
			this.views = [];
			$listItems.empty();
			
			_(app.todos.models).each(function(task,i){
				var taskView = new TaskView({model: task});
				$listItems.append(taskView.render().el);
				$listItems.sortableUpdate({
					onStop: function(){task.trigger("change:order");}
				});
				self.views.push(taskView);
			});
		},
		orderChange: function(){
			_(this.views).each(function(view,i){
				var index = $(view.el).index();
				view.model.save({today_order: index},{silent:true});
			});
		},
		newAttributes: function(){
			return {
				name: $newInput.val(),
				project_id: app.project_id
			}
		},
		add: function(e){
			if (e.which!==13 || !$newInput.val().trim()) return;
			
			app.todos.create(this.newAttributes());
			$newInput.val("");
		}
	});

	// Task view
	var TaskView = Backbone.View.extend({
		tagName: "li",
		className: "task",
		template: JST['task'],
		events: {
			"click .check"	: "done",
			"keypress .edit": "updateName",
			"mousedown .edit"	: "focus",
			"dblclick .name": "edit",
			"click .delete"	: "remove",
			"click .move"	: "moveTo",
			"click .status"	: "statusTo"
		},
		initialize: function(){
			this.model.on("change", this.render, this);
			this.model.on("destroy", this.unrender, this);
			models.projects.on("reset change:name", this.render, this)
		},
		render: function(){
			var self = this,
				id = this.model.get("project_id"),
				projects = models.projects,
				project = projects.getName(id);
			
			this.$el.html(this.template({
				task: this.model.toJSON(),
				project: project,
				list: "today",
				projects: projects.toJSON()
			}));

			this.$el.toggleClass("done",this.model.get("completed"));
			if (this.model.get("status")=="waiting_for")
				this.$el.addClass("waiting-for");
			this.input = this.$(".edit");
			return this;
		},
		done: function(){
			this.model.toggle();
		},
		edit: function(){
			this.$("label").hide();
			this.input.show().focus();
		},
		focus: function(){
			this.input.focus();
		},
		updateName: function(e){
			var input = this.input.val();
			if (e.which!==13 || !input.trim()) return;
			
			this.$("label").show();
			this.input.hide();
			this.model.save("name",input);
		},
		remove: function(){
			this.model.destroy();
		},
		unrender: function(){
			this.$el.remove();
		},
		moveTo: function(e){
			var project = $(e.target).attr("href");
			this.model.save("project_id",project);
			return false;
		},
		statusTo: function(e){
			var status = $(e.target).attr("href"),
				order = 100;
			
			if (status=="today") order = 0;
			this.model.save({
				status: status,
				today_order: order,
				project_order: order
			});

			return false;
		}
	});

	// Sidebar view
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
			_(models.projects.models).each(function(project,i){
				if (project.get("id")==1) return;
				if (project.get("status")!="current") return;
				var projectView = new SidebarView({model: project});
				$projects.append(projectView.render().el);
			});
		},
		openToday: function(){
			$("li",$sidebar).removeClass("active");
			this.$("#todayList").addClass("active");
			$newInput.attr("placeholder","Add new task...");
			$currProj.html("Today");

			app.todos.off();
			app.todos = models.today;
			app.list = new TaskList();
			app.todos.fetch();
		},
		openProjects: function(){
			$("li",$sidebar).removeClass("active");
			this.$("#projectList").addClass("active");
			$newInput.attr("placeholder","Add new project...");
			$currProj.html("Projects");

			app.todos.off();
			app.todos = models.projects;
			app.list = new ProjectList();
			app.todos.fetch();
		}
	});
	
	// Sidebar project
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
			$newInput.attr("placeholder","Add new task...");

			var project = parseInt($(e.target).attr("data"));
			app.todos.off();
			app.todos = models.project;
			app.list = new TaskList();
			app.todos.fetch({ data: {project_id: project} });
			
			app.project_id = project;
			$currProj.html(models.projects.getName(project));
		},
		unrender: function(){
			this.$el.remove();
		}
	});

	// Project list view
	var ProjectList = Backbone.View.extend({
		el: $list,
		events: {
			"keypress #new-task": "add"
		},
		initialize: function(){
			_.bindAll(this,"add");
			
			$listItems.sortable({
				constraint: 'y',
				xbounds: [0,5000],
				ybounds: [0,5000],
				placeholderClass: 'task done',
				dragClass: 'dragging'
			});
			
			app.todos.on("add change reset", this.render, this);
			app.todos.on("change:order", this.orderChange, this);
		},
		render: function(){
			var self = this;
			this.views = [];
			$listItems.empty();
			
			_(app.todos.models).each(function(project,i){
				if (project.get("id")==1) return;
				var projectView = new ProjectView({model: project});
				$listItems.append(projectView.render().el);
				$listItems.sortableUpdate({
					onStop: function(){project.trigger("change:order");}
				});
				self.views.push(projectView);
			});
		},
		orderChange: function(){
			_(this.views).each(function(view,i){
				var index = $(view.el).index();
				view.model.save({order: index},{silent:true});
			});
		},
		newAttributes: function(){
			return {
				name: $newInput.val()
			}
		},
		add: function(e){
			if (e.which!==13 || !$newInput.val().trim()) return;
			
			app.todos.create(this.newAttributes());
			$newInput.val("");
		}
	});

	// Project view
	var ProjectView = Backbone.View.extend({
		tagName: "li",
		className: "task",
		template: JST['task'],
		events: {
			"click .check"	: "done",
			"keypress .edit": "updateName",
			"mousedown .edit": "focus",
			"dblclick .name": "edit",
			"click .delete"	: "remove",
			"click .move"	: "moveTo",
			"click .status"	: "statusTo"
		},
		initialize: function(){
			this.model.on("change", this.render, this);
			this.model.on("destroy", this.unrender, this);
		},
		render: function(){
			var self = this,
				id = this.model.get("project_id"),
				//tasks = models.projects,
				project = "";
			
			this.$el.html(this.template({
				task: this.model.toJSON(),
				list: "projects",
				project: project
			}));

			this.$el.toggleClass("done",this.model.get("completed"));
			if (this.model.get("status")=="waiting_for")
				this.$el.addClass("waiting-for");
			if (this.model.get("status")=="someday")
				this.$el.addClass("someday");
			this.input = this.$(".edit");
			return this;
		},
		done: function(){
			this.model.toggle();
		},
		edit: function(){
			this.$("label").hide();
			this.input.show().focus();
		},
		focus: function(){
			this.input.focus();
		},
		updateName: function(e){
			var input = this.input.val();
			if (e.which!==13 || !input.trim()) return;
			
			this.$("label").show();
			this.input.hide();
			this.model.save("name",input);
		},
		remove: function(){
			this.model.destroy();
		},
		unrender: function(){
			this.$el.remove();
		},
		moveTo: function(e){
			var project = $(e.target).attr("href");
			this.model.save("project_id",project);
			return false;
		},
		statusTo: function(e){
			var status = $(e.target).attr("href"),
				order = 100;
			
			if (status=="current") order = 0;
			this.model.save({
				status: status,
				order: order
			});
			app.todos.sort();
			return false;
		}
	});
	
})(jQuery);





