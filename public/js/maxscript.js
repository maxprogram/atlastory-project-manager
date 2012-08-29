/*
=====================
MaxScript jQuery Add-Ons
Version: 2.1
Last update: 7/21/2012
=====================
*/

/**
////////////////////////
	jQuery Plugins
////////////////////////
**/

function getEl(id){return document.getElementById(id)}

(function($) {

	// Gets mouse position for all browsers
	
	var Mouse = {
		x: 0,
		y: 0,
		init: function(c){ 
			var posX, posY;
			if (!c) c = window.event;
			if (c.pageX||c.pageY){posX=c.pageX; posY=c.pageY;}
			else if (c.clientX||c.clientY){
				posX = c.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				posY = c.clientY + document.body.scrollTop + document.documentElement.scrollTop;}
			Mouse.x = posX;
			Mouse.y = posY;
		}
	};
	
	$(function(){
		$(window).bind("mousemove", Mouse.init);
	});
	
	// Mobile device detection
	
	$.device = {
		name: "Non-mobile",
		detect: function(key) {
			var name;
			if(this[key] === undefined) {
				name = navigator.userAgent.match(new RegExp(key, 'i'));
			}
			
			if (name != null){
				this[key] = true;
				this.name = name;
			}
			else this[key] = false;
			
			return this[key];
		},
		init: function() {
			this.detect("iPhone");
			this.detect("iPad");
			this.detect("iPod");
			this.detect("Android");
			this.detect("webOS");
			this.detect("Windows Phone");
			this.iOS = false;
			this.mobile = false;
			
			if (this.iPhone || this.iPad || this.iPod)
				this.iOS = true;
			if (this['iOS'] || this['Android'] || this['webOS'] || this['Windows Phone'])
				this.mobile = true;
		}
	}
	$.device.init();
	
	// Creates a new element within selector(s)
	
	$.fn.newE = function(element, options) {
		var attributes = $.extend({ // Default options
			"id": "",
			"klass": "",
			"css": "",
			"content": "",
			"title": "",
			"src": "",
			"href": ""
		}, options);
		return this.each(function(){
			var child = document.createElement(element);
			if (attributes.id!="") child.id = attributes.id;
			if (attributes.klass!="") $(child).addClass(attributes.klass);
			if (attributes.css!="") $(child).css(attributes.css);
			if (attributes.content!="") $(child).html(attributes.content);
			if (attributes.title!="") child.title = attributes.title;
			if (attributes.src!="") child.src = attributes.src;
			if (attributes.href!="") child.href = attributes.href;
			$(this).append(child);
		});
	};
	$.newE = function(element, options) {
		var attributes = $.extend({ // Default options
			"id": "", "klass": "", "css": "", "content": "", "title": "", "src": "", "href": ""
		}, options);
		var child = document.createElement(element);
		if (attributes.id!="") child.id = attributes.id;
		if (attributes.klass!="") $(child).addClass(attributes.klass);
		if (attributes.css!="") $(child).css(attributes.css);
		if (attributes.content!="") $(child).html(attributes.content);
		if (attributes.title!="") child.title = attributes.title;
		if (attributes.src!="") child.src = attributes.src;
		if (attributes.href!="") child.href = attributes.href;
		return child;
	};
	
	// Change element positions and sizes
	
	$.fn.cP = function(x, y) {
		return this.each(function(){
			if (x!=null && x!="") $(this).css("left",x);
			if (y!=null && y!="") $(this).css("top",y);
		});
	};
	$.fn.cS = function(w, h) {
		return this.each(function(){
			if (w!=null && w!="") $(this).width(w);
			if (h!=null && h!="") $(this).height(h);
		});
	};
	
	// Prevents selection
	
	$.fn.selectOff = function() {
		return this.each(function(){
			if ($.support.selectstart)
				$(this).on("selectstart.selectOff", function(){return false});
			else $(this).on("mousedown.selectOff", function(){return false});
		});
	};
	$.fn.selectOn = function() {
		return this.off(".selectOff");
	};
	
	// Color functions
	
	$.color = function(input,output,value,o){
		var Convert = {
			hexTOrgb: function(val){
				var	o 		= val.toLowerCase(),
					red 	= parseInt(o.slice(0,2),16),
					green	= parseInt(o.slice(2,4),16),
					blue	= parseInt(o.slice(4),16);
				return [red,green,blue];
			},
			rgbTOrgba: function(rgb,o){
				var a		= rgb.split(","),
					red		= parseInt(a[0].slice(4)),
					green	= parseInt(a[1]),
					blue	= parseInt(a[2]),
					combo	= red+", "+green+", "+blue+", "+o;
				return "rgba("+combo+")";
			},
			_hex: function(val){
				return ('0' + val.toString(16)).slice(-2);
			},
			hex: function(val){
				var f = this._hex;
				return f(val[0])+f(val[1])+f(val[2]);
			},
			shade: function(val,p){
				var v = [], i;
			    for (i=0;i<3;i++){
			        v[i] = Math.round(val[i]*p);
			        if (v[i]>255) v[i] = 255;
			        if (v[i]<0) v[i] = 0;
			    }
			    return v;
			}
		};
		
		return Convert[input+"TO"+output](value,o);
	};
	
	// Drag element UI
	
	$.fn.drag = function(options){
		var o = $.extend({
			constraint: false,
			xbounds: false,
			ybounds: false,
			snap: [1,1],
			onStart: function(){},
			onDrag: function(){},
			onStop: function(){},
			dragClass: ""
		}, options);
		return this.each(function(){
			$(this).data("drag",new DragObj($(this), o));
		});
	};
	$.fn.dragUpdate = function(o){return $(this).data("drag").update(o)};
	
	function DragObj(el,o){
		
		this.o = o;
		var self = this, ui = {};
		
		this.update = function(options){
			$.extend(self.o, options);
		}
		
		function init(){
			ui.pos = el.position();
			el.css({
				position: 'absolute',
				top: ui.pos.top,
				left: ui.pos.left
			});
			el.mousedown(setEvents); 
			return self;
		}
		
		function setEvents(e){
			// Adds drag events
			window.focus();
			$(document).mousemove(mouseMove)
				.mouseup(mouseUp)
				.selectOff();
			
			// Sets starting positions
			ui.el = el;
			ui.startX = Mouse.x;
			ui.startY = Mouse.y;
			ui.pos = el.position();
			el.addClass(self.o.dragClass);
			self.o.onStart(e,ui);
			return false;
		}
			
		function mouseMove(e){
			window.focus();
			var	movedX 	= Mouse.x - ui.startX,
				movedY 	= Mouse.y - ui.startY,
				parent	= el.parent();

			movedX = Math.round(movedX/self.o.snap[0]) * self.o.snap[0];
			movedY = Math.round(movedY/self.o.snap[1]) * self.o.snap[1];
				
			if (self.o.constraint=="x") movedY = 0;
			if (self.o.constraint=="y") movedX = 0;
			
			var	moveX = ui.pos.left + movedX,
				moveY = ui.pos.top + movedY;
			
			if (self.o.constraint=="container"){
				var	rightBound	= parent.width()-el.outerWidth(),
					bottomBound	= parent.height()-el.outerHeight();
				if (moveX < 0) moveX = 0;
				if (moveX > rightBound) moveX = rightBound;
				if (moveY < 0) moveY = 0;
				if (moveY > bottomBound) moveY = bottomBound;
			}
			if (self.o.xbounds) {
				var rightBound = self.o.xbounds[1] - el.outerWidth();
				if (moveX < self.o.xbounds[0]) moveX = self.o.xbounds[0];
				if (moveX > rightBound) moveX = rightBound;
			}
			if (self.o.ybounds) {
				var bottomBound = self.o.ybounds[1] - el.outerHeight();
				if (moveY < self.o.ybounds[0]) moveY = self.o.ybounds[0];
				if (moveY > bottomBound) moveY = bottomBound;
			}
			
			el.css({left: moveX, top: moveY});
			ui.left = moveX;
			ui.top = moveY;
			ui.movedX = movedX;
			ui.movedY = movedY;
			if (movedX!=0 || movedY!=0) self.o.onDrag(e,ui);
		}
		
		function mouseUp(e){
			$(document).off("mousemove",mouseMove)
				.off("mouseup",mouseUp)
				.selectOn();
			el.removeClass(self.o.dragClass);
			self.o.onStop(e,ui);
		}
		return init();
	};
	
	
	// Resize element UI
	
	$.fn.resize = function(options){
		var o = $.extend({
			container: false,
			maxHeight: null,
			maxWidth: null,
			minHeight: 20,
			minWidth: 20,
			snap: [1,1],
			n: false,
			e: false,
			s: false,
			w: false,
			onStart: function(){},
			onResize: function(){},
			onStop: function(){},
			resizeClass: ""
		}, options);
		return this.each(function(){
			$(this).data("resize",new ResizeObj($(this), o));
		});
	};
	$.fn.resizeUpdate = function(o){return $(this).data("resize").update(o)};
	
	function ResizeObj(el,o){
		
		this.o = o;
		var	self = this, ui = {}, direction,
			allDirects = ["n", "e", "s", "w"],
			directs = {};
			
		this.update = function(options){
			$.extend(self.o, options);
		}
		
		function init(){
			ui.old = {
				left: el.position().left,
				top: el.position().top,
				width: el.width(),
				height: el.height()
			};
			el.css({position: 'absolute',top: ui.old.top,left: ui.old.left});
			$(allDirects).each(function(i,d){
				if (o[d]!=false) {
					directs[d] = $(self.o[d], el);
					directs[d].css("cursor",d+"-resize");
					directs[d].mousedown(setEvents);
				}
			});
			return self;
		}
		
		function setEvents(e){
			// Sets starting positions
			ui.startX = Mouse.x;
			ui.startY = Mouse.y;
			ui.old = {
				left: el.position().left,
				top: el.position().top,
				width: el.width(),
				height: el.height()
			};
			
			// Gets what direction is being resized
			var handle = $(e.target);
			$(allDirects).each(function(i,d){
				if (handle.is(directs[d]) || handle.parent().is(directs[d]))
					direction = d;
			});
			
			// Adds drag events & prevents text selection
			window.focus();
			$(document).mousemove(mouseMove)
				.mouseup(mouseUp)
				.selectOff();
			
			el.addClass(self.o.resizeClass);
			self.o.onStart(e,ui);
			return false;
		}
			
		function mouseMove(e){
			var handle = directs[direction];
			
			window.focus();
			var	ops		= self.o,
				movedX 	= Mouse.x - ui.startX,
				movedY 	= Mouse.y - ui.startY,
				width 	= ui.old.width,
				height 	= ui.old.height,
				moveX, moveY;
			movedX = Math.round(movedX/ops.snap[0]) * ops.snap[0];
			movedY = Math.round(movedY/ops.snap[1]) * ops.snap[1];
			
			switch (direction){
				case "n":
					movedX = 0;
					height -= movedY;
					break;
				case "e":
					movedY = 0;
					width += movedX;
					movedX = 0;
					break;
				case "s":
					movedX = 0;
					height += movedY;
					movedY = 0;
					break;
				case "w":
					movedY = 0;
					width -= movedX;
					break;
				default:
					console.log("No handles!");
			}
			moveX = ui.old.left + movedX;
			moveY = ui.old.top + movedY;
			
			// Restrict resize to parent container if option is on
			if (ops.container) {
				var	parent = el.parent(),
					rightBound = parent.width() - width,
					bottomBound = parent.height() - height;
				if (moveX < 0 || moveX > rightBound) return true;
				if (moveY < 0 || moveY > bottomBound) return true;
			}
			
			// Restrict size
			var	maxX	= ui.old.left + ui.old.width - ops.minWidth,
				minX	= ui.old.left + ui.old.width - ops.maxWidth,
				maxY	= ui.old.top + ui.old.height - ops.minHeight,
				minY	= ui.old.top + ui.old.height - ops.maxHeight;
			if (width<=ops.minWidth){
				width = ops.minWidth;
				if (direction=="w") moveX = maxX;
			}
			if (height<=ops.minHeight){
				height = ops.minHeight;
				if (direction=="n") moveY = maxY;
			}
			if (ops.maxWidth!=null && width>=ops.maxWidth){
				width = ops.maxWidth;
				if (direction=="w") moveX = minX;
			}
			if (ops.maxHeight!=null && height>=ops.maxHeight){
				height = ops.maxHeight;
				if (direction=="n") moveY = minY;
			}
			
			el.css({
				left: moveX, top: moveY,
				width: width, height: height
			});
			ui.left = moveX;
			ui.top = moveY;
			ui.width = width;
			ui.height = height;
			if (ui.old.width!=width || ui.old.height!=height)
				self.o.onResize(e,ui);
		}
		
		function mouseUp(e){
			$(document).off("mousemove",mouseMove)
				.off("mouseup",mouseUp)
				.selectOn();
			
			el.removeClass(self.o.resizeClass);
			self.o.onStop(e,ui);
		}
		return init();
	};
	
	
	// Scroll wheel usage
	
	$.fn.wheel = function(options){
		var o = $.extend({
			scroll: 1,
			onUp: function(){},
			onDown: function(){}
		}, options);
		return this.each(function(){
			$(this).data("wheel",new Wheel($(this), o));
		});
	};
	
	function Wheel(el,o){
		
		var	self = this, ui = {};

		function init(){
			setEvents();
			return self;
		}
		function setEvents(e){
			if(this.addEventListener){
				el[0].addEventListener('DOMMouseScroll', wheel, false);
				el[0].addEventListener('mousewheel', wheel, false);
			}
			else {el[0].onmousewheel = wheel;}
			return false;
		}
		function wheel(e){
			var	e = e || window.event, scroll;
			if (e.wheelDelta) scroll = e.wheelDelta / 120 * o.scroll;
			else scroll = -e.detail / 3 * o.scroll;
			if (window.opera) scroll = -scroll;
			
			ui.el		= e.target;
			ui.scroll	= scroll;
			ui.left		= Mouse.x - el.offset().left;
			ui.top		= Mouse.y - el.offset().top;
			
			if (scroll < 0) o.onDown(e,ui);
			if (scroll > 0) o.onUp(e,ui);
			
			e = $.event.fix(e);
			if (e.preventDefault) e.preventDefault();
		}
		return init();
	};

// Modal

	$.modal = $.modal || {};
	$.modal.obj = null;
	
	$.fn.modal = function(){
		return this.each(function(){
			var $self = $(this), dur = 200;
			if ($.modal.obj==null){
				$.modal.obj = $("<div />").addClass("modal");
				$self.before($.modal.obj);
			}
			$(".close",this).click(function(){
				$self.fadeOut(dur);
				$.modal.obj.fadeOut(dur);
			});
			$.modal.obj.click(function(){
				$(".close",$self).trigger("click");
			});
			
			$.modal.obj.fadeToggle(dur);
			$self.fadeToggle(dur);
		});
	};


// Sortable list

	$.fn.sortable = function(options){
		var o = $.extend({
			xbounds: false,
			ybounds: false,
			snap: [1,1],
			onStart: function(){},
			onDrag: function(){},
			onStop: function(){},
			dragClass: ""
		}, options);
		return this.each(function(){
			$(this).data("sortable",new Sortable($(this), o));
		});
	};
	$.fn.sortableUpdate = function(o){return $(this).data("sortable").update(o)};
	
	function Sortable(el,o){
		
		this.o = o;
		var self = this;
		var placeholder, lastIndex = 0;
		
		function start(e,ui){
			var pos	= ui.el.position();
			lastIndex = ui.el.index();
				
			ui.el.css({
				position: 'absolute',
				top: pos.top, left: pos.left,
				zIndex: 10000
			});
			placeholder = $("<li/>").css("visibility","hidden");
			ui.el.before(placeholder);
			self.o.onStart(e,ui);
		}
		function drag(e,ui){
			var pos 	= ui.top,
				h		= ui.el.outerHeight(),
				index	= ui.el.index(),
				step	= Math.round(ui.movedY/h)+lastIndex+1;
			
			if (step > index){
				$("li",el).eq(step).after(placeholder,ui.el);
			} else if (step < index){
				$("li",el).eq(step-1).before(placeholder,ui.el);
			}
			self.o.onDrag(e,ui);
		}
		function stop(e,ui){
			placeholder.remove();
			ui.el.css({
				position: 'relative',
				top: 0, left: 0,
				zIndex: 9999
			});
			if (ui.el.index() != lastIndex) {
				self.o.onStop(e,ui);
				lastIndex = ui.el.index();
			}
		}
		
		// Point drag events to new sortable functions:
		var sortOps = {
			onStart: start,
			onDrag: drag,
			onStop: stop
		};
		var dragOps = $.extend({},this.o,sortOps);
		
		// Update options and make sure all items are draggable
		this.update = function(options){
			$.extend(self.o, options);
			dragOps = $.extend({},self.o,sortOps);
			$("li",el).each(function(){
				if (!$(this).data("drag")) $(this).drag(dragOps).css({
					position: 'relative',
					top: 0, left: 0
				});
			});
		}
		
		function init(){
			$("li",el).drag(dragOps).css({
				position: 'relative',
				top: 0, left: 0
			});
		}
		return init();
	}

// Scrollbar shadows

	$.scrollb = $.scrollb || { };
	$.fn.scrollbar = function(){
		this.each(function(){$(this).data("scrollbar",new Scroll($(this)));})
	};
	$.fn.scrollbarUpdate = function(){
		this.each(function(){$(this).data("scrollbar").update();})
	};
	function Scroll(root){
		$("<div/>").addClass("top-shadow").appendTo(root);
		$("<div/>").addClass("bottom-shadow").appendTo(root);
		
		var	viewport 	= $(".viewport",root),
			topShadow	= $(".top-shadow",root),
			botShadow	= $(".bottom-shadow",root);
		
		viewport.scroll(shadows);
		this.update = shadows;
		
		function shadows(){
			var	height		= viewport.height(),
				content		= viewport[0].scrollHeight,
				scroll		= viewport.scrollTop(),
				topOpacity	= 16 - (height - scroll)/height * 16,
				botOpacity	= (content - scroll - height)/content * 16;
			if (scroll > 0) topShadow.show();
			else topShadow.hide();
			if (content - scroll > height) botShadow.show();
			else botShadow.hide();
			topShadow.css("opacity",topOpacity);
			botShadow.css("opacity",botOpacity);
		}
	}

// TinyScrollbar with fade

	$.tiny = $.tiny || { };
	
	$.tiny.scrollbar = {
		options: {	
			axis: 'y', // vertical or horizontal scrollbar? ( x || y ).
			wheel: 40,  //how many pixels must the mouswheel scroll at a time.
			scroll: true, //enable or disable the mousewheel;
			size: 'auto', //set the size of the scrollbar to auto or a fixed number.
			sizethumb: 'auto', //set the size of the thumb to auto or a fixed number.
			interval: 2000 // time in milliseconds that scrollbar remains visible
		}
	};	
	
	$.fn.tinyscrollbar = function(options) { 
		var options = $.extend({}, $.tiny.scrollbar.options, options); 		
		this.each(function(){ $(this).data('tsb', new Scrollbar($(this), options)); });
		return this;
	};
	$.fn.tinyscrollbar_update = function(sScroll) { return $(this).data('tsb').update(sScroll); };
	
	function Scrollbar(root, options){
		
		var eViewport = $('.viewport', root);
		var content = eViewport.children();
		eViewport.append($("<div/>").addClass("sOverview"));
		content.appendTo($(".sOverview",eViewport));
		eViewport.before("<div class='sScrollbar'><div class='sTrack'><div class='sThumb'><div class='sEnd'></div></div></div></div>");
		
		var oSelf = this;
		var oWrapper = root;
		var oViewport = { obj: $('.viewport', root) };
		var oContent = { obj: $('.sOverview', root) };
		var oScrollbar = { obj: $('.sScrollbar', root) };
		var oTrack = { obj: $('.sTrack', oScrollbar.obj) };
		var oThumb = { obj: $('.sThumb', oScrollbar.obj) };
		var sAxis = options.axis == 'x', sDirection = sAxis ? 'left' : 'top', sSize = sAxis ? 'Width' : 'Height';
		var iScroll, iPosition = { start: 0, now: 0 }, iMouse = {};
		var barFade = "in", runFade = true, barTime;
		
		function initialize() {	
			oSelf.update();
			setEvents();
			return oSelf;
		}
		this.update = function(sScroll){
			oViewport[options.axis] = oViewport.obj[0]['offset'+ sSize];
			oContent[options.axis] = oContent.obj[0]['scroll'+ sSize];
			oContent.ratio = oViewport[options.axis] / oContent[options.axis];
			oScrollbar.obj.toggleClass('disable', oContent.ratio >= 1);
			oTrack[options.axis] = options.size == 'auto' ? oViewport[options.axis] : options.size;
			oThumb[options.axis] = Math.min(oTrack[options.axis], Math.max(0, ( options.sizethumb == 'auto' ? (oTrack[options.axis] * oContent.ratio) : options.sizethumb )));
			oScrollbar.ratio = options.sizethumb == 'auto' ? (oContent[options.axis] / oTrack[options.axis]) : (oContent[options.axis] - oViewport[options.axis]) / (oTrack[options.axis] - oThumb[options.axis]);
			iScroll = (sScroll == 'relative' && oContent.ratio <= 1) ? Math.min((oContent[options.axis] - oViewport[options.axis]), Math.max(0, iScroll)) : 0;
			iScroll = (sScroll == 'bottom' && oContent.ratio <= 1) ? (oContent[options.axis] - oViewport[options.axis]) : isNaN(parseInt(sScroll)) ? iScroll : parseInt(sScroll);
			setSize();
			if(!(oContent.ratio >= 1)){
				fade();
				oScrollbar.obj.bind("mouseover mousemove mouseout", fade);
			} else {
				oScrollbar.obj.unbind("mouseover mousemove mouseout", fade);
			}
		};
		function setSize(){
			oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
			oContent.obj.css(sDirection, -iScroll);
			iMouse['start'] = oThumb.obj.offset()[sDirection];
			var sCssSize = sSize.toLowerCase(); 
			oScrollbar.obj.css(sCssSize, oTrack[options.axis]);
			oTrack.obj.css(sCssSize, oTrack[options.axis]);
			oThumb.obj.css(sCssSize, oThumb[options.axis]);		
		};		
		function setEvents(){
			oThumb.obj.bind('mousedown', start);
			oThumb.obj[0].ontouchstart = function(oEvent){
				oEvent.preventDefault();
				oThumb.obj.unbind('mousedown');
				start(oEvent.touches[0]);
				return false;
			};	
			oTrack.obj.bind('mouseup', drag);
			if(options.scroll && this.addEventListener){
				oWrapper[0].addEventListener('DOMMouseScroll', wheel, false);
				oWrapper[0].addEventListener('mousewheel', wheel, false );
			}
			else if(options.scroll){oWrapper[0].onmousewheel = wheel;}
			if(!(oContent.ratio >= 1)){
				oScrollbar.obj.bind("mouseover mousemove mouseout", fade);
			}
			oThumb.obj.hide();
		};
		
		function fade(){
			if (runFade == true) {
				if (barFade == "out"){
					oThumb.obj.fadeIn("fast");
					barFade = "in";
					runFade = false;
					barTime = setTimeout(function(){
						runFade=true;
						fade();
						runFade=true;
						clearTimeout(barTime);
					}, options.interval);
				} else if (barFade == "in"){
					oThumb.obj.fadeOut("fast");
					barFade = "out";
					runFade = false;
					barTime = setTimeout(function(){runFade=true;}, options.interval);
				}
			} else {
				clearTimeout(barTime);
				if (barFade == "out"){
					barTime = setTimeout(function(){runFade=true;}, options.interval);
				} else if (barFade == "in"){
					barTime = setTimeout(function(){
						runFade=true;
						fade();
						runFade=true;
						clearTimeout(barTime);
					}, options.interval);
				}
			}
		};

		function start(oEvent){
			iMouse.start = sAxis ? oEvent.pageX : oEvent.pageY;
			var oThumbDir = parseInt(oThumb.obj.css(sDirection));
			iPosition.start = oThumbDir == 'auto' ? 0 : oThumbDir;
			oScrollbar.obj.unbind("mouseout");
			$(document).bind('mousemove', drag);
			document.ontouchmove = function(oEvent){
				$(document).unbind('mousemove');
				drag(oEvent.touches[0]);
			};
			$(document).bind('mouseup', end);
			oThumb.obj.bind('mouseup', end);
			oThumb.obj[0].ontouchend = document.ontouchend = function(oEvent){
				$(document).unbind('mouseup');
				oThumb.obj.unbind('mouseup');
				end(oEvent.touches[0]);
			};
			fade();
			return false;
		};		
		function wheel(oEvent){
			if(!(oContent.ratio >= 1)){
				var oEvent = oEvent || window.event;
				var iDelta = oEvent.wheelDelta ? oEvent.wheelDelta/120 : -oEvent.detail/3;
				iScroll -= iDelta * options.wheel;
				iScroll = Math.min((oContent[options.axis] - oViewport[options.axis]), Math.max(0, iScroll));
				oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
				oContent.obj.css(sDirection, -iScroll);
				
				oEvent = $.event.fix(oEvent);
				oEvent.preventDefault();
				fade();
			};
		};
		function end(oEvent){
			$(document).unbind('mousemove', drag);
			$(document).unbind('mouseup', end);
			oThumb.obj.unbind('mouseup', end);
			oScrollbar.obj.bind("mouseout", fade);
			fade();
			document.ontouchmove = oThumb.obj[0].ontouchend = document.ontouchend = null;
			return false;
		};
		function drag(oEvent){
			if(!(oContent.ratio >= 1)){
				iPosition.now = Math.min((oTrack[options.axis] - oThumb[options.axis]), Math.max(0, (iPosition.start + ((sAxis ? oEvent.pageX : oEvent.pageY) - iMouse.start))));
				iScroll = iPosition.now * oScrollbar.ratio;
				oContent.obj.css(sDirection, -iScroll);
				oThumb.obj.css(sDirection, iPosition.now);
				fade();
			}
			return false;
		};
		
		return initialize();
	};
})(jQuery);
