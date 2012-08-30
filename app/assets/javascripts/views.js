/*_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g,
    evaluate: /\{%(.+?)%\}/g	
};*/

var app = app || {}, models = models || {};

(function($){
	
	// Load functions
	$(function(){
		
		app = new App();
		app.taskList = new TaskList();

		$('.dropdown-toggle').dropdown();
	});
	
	// Element shortcuts
	var $page		= $("#page"),
		$header		= $("#header"),
		$container	= $(".container"),
		$list 		= $(".list"),
		$listItems	= $(".list .list-items"),
		$newInput	= $("#new-task"),
		$taskTemp	= $("#task-template");
		
	
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
				//xbounds: [0,1000],
				ybounds: [0,5000],
				placeholderClass: 'task done'
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
				projects = models.projects,
				project = projects.getName(id);
			
			this.$el.html(this.template({
				task: this.model.toJSON(),
				project: project,
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
	
})(jQuery);





