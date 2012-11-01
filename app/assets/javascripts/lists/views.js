
var app = app || {}, models = models || {};

(function($){
	
	// Load functions
	$(function(){
		
		app = new App();
		app.list = new TaskList();
		app.sidebar = new Sidebar();

		$('.dropdown-toggle').dropdown();
		$currProj.click(function(){
			$sidebar.toggleClass("off");
		});
	});
	
	// Element shortcuts
	var $page		= $(".container-fluid"),
		$header		= $("#header"),
		$header2	= $("#header2"),
		$container	= $(".content"),
		$sidebar 	= $(".sidebar"),
		$projects	= $(".side-projects"),
		$list 		= $(".list"),
		$listItems	= $(".list .list-items"),
		$listOther	= $(".list .list-other"),
		$listDone	= $(".list .list-done"),
		$newInput	= $("#new-task"),
		$taskTemp	= $("#task-template"),
		$currProj	= $("#current-project");
		
	
	// App view
	/////////////////////
	
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
				headHeight	= $header.height() + $header2.height();
			$page.height(appHeight);
			$container.height(appHeight - headHeight);
		}
	});

	// Task list view
	/////////////////////
	
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
			$listOther.empty();
			$listDone.empty();
			
			app.todos.each(function(task,i){
				var taskView = new TaskView({model: task}),
					status = task.get("status");
				// If it's not in the current project don't render it
				if (task.get("project_id")!=app.project_id && status!="today") return;
				// Puts task in correct list
				if (status=="waiting_for")
					$listOther.append(taskView.render().el);
				else if (status=="archive")
					$listDone.append(taskView.render().el);
				else {
					$listItems.append(taskView.render().el);
					$listItems.sortableUpdate({ // Triggers order change when sorting is done
						onStop: function(){task.trigger("change:order");}
					});
					self.views.push(taskView);
				}
			});
		},
		orderChange: function(){
			// Updates the order attributes based on DOM index
			if (app.project_id==1) var today=true;
			_(this.views).each(function(view,i){
				var index = $(view.el).index();
				if (today) view.model.save({today_order: index},{silent:true});
				else view.model.save({project_order: index},{silent:true})
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
	/////////////////////
	
	var TaskView = Backbone.View.extend({
		tagName: "li",
		className: "task",
		template: JST['task'],
		events: {
			"click .check"	: "done",
			"keypress .edit": "updateName",
			"click .edit"	: "focus",
			"mousedown .edit": "focus",
			"dblclick .name": "edit",
			"click .delete"	: "remove",
			"click .move"	: "moveTo",
			"click .status"	: "statusTo"
		},
		initialize: function(){
			this.model.on("change", this.render, this);
			this.model.on("destroy", this.unrender, this);
			// Project fetch can delay sometimes so this renders it when finished
			models.projects.on("reset change:name", this.render, this)
		},
		render: function(){
			var self = this,
				id = this.model.get("project_id"),
				projects = models.projects,
				projectName = projects.getName(id);
			
			this.$el.html(this.template({
				task: this.model.toJSON(),
				project: projectName,
				list: "today",
				projects: projects.toJSON()
			}));

			this.$el.toggleClass("done",this.model.get("completed"));
			this.$el.addClass(this.model.get("status"));
			if (id==1) this.$el.addClass("today");
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
		focus: function(e){
			// Stops sortable/drag function when editing name
			e.stopPropagation();
		},
		updateName: function(e){
			var input = this.input.val();
			if (e.which!==13 || !input.trim()) return; // Submits on "Enter"
			
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
			// Saves new status/order based on list type
			if (app.project_id==1) this.model.save({
				status: status, today_order: order });
			else this.model.save({
				status: status, project_order: order });

			return false;
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
			$newInput.attr("placeholder","Add new task...");
			$currProj.html("Today").trigger("click");
			// Switches list model + creates new view
			app.todos.off();
			app.todos = models.today;
			app.list = new TaskList();
			app.todos.fetch();
			app.project_id = 1;
		},
		openProjects: function(){
			$("li",$sidebar).removeClass("active");
			this.$("#projectList").addClass("active");
			$newInput.attr("placeholder","Add new project...");
			$currProj.html("Projects").trigger("click");
			// Switches list model + creates new view
			app.todos.off();
			app.todos = models.projects;
			app.list = new ProjectList();
			app.todos.fetch();
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
			$newInput.attr("placeholder","Add new task...");
			
			// Switches list model + creates new view
			var project = parseInt($(e.target).attr("data"));
			app.todos.off();
			app.todos = models.project;
			app.list = new TaskList();
			// Fetches specific project tasks from server
			app.todos.fetch({ data: {project_id: project} });
			
			app.project_id = project;
			$currProj.html(models.projects.getName(project)).trigger("click");
		},
		unrender: function(){
			this.$el.remove();
		}
	});

	// Project list view
	/////////////////////
	
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
			$listOther.empty();
			$listDone.empty();
			
			_(app.todos.models).each(function(project,i){
				if (project.get("id")==1) return;
				var projectView = new ProjectView({model: project}),
					status = project.get("status");
				if (status=="waiting_for" || status=="someday")
					$listOther.append(projectView.render().el);
				else if (status=="archive")
					$listDone.append(projectView.render().el);
				else {
					$listItems.append(projectView.render().el);
					$listItems.sortableUpdate({
						onStop: function(){project.trigger("change:order");}
					});
					self.views.push(projectView);
				}
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
	/////////////////////
	
	var ProjectView = Backbone.View.extend({
		tagName: "li",
		className: "task",
		template: JST['task'],
		events: {
			"click .check"	: "done",
			"keypress .edit": "updateName",
			"click .edit"	: "focus",
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
				project = "";
			
			this.$el.html(this.template({
				task: this.model.toJSON(),
				list: "projects",
				project: project
			}));

			this.$el.toggleClass("done",this.model.get("completed"));
			this.$el.addClass(this.model.get("status"));
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
		focus: function(e){
			e.stopPropagation();
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





