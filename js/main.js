/*
 * 
 * Author: Dean Jennings
 * 
*/

/*
YUI().use('cache', function(Y){
	var myCache = new Y.CacheOffline({max:5});
	var testEntry = myCache.retrieve("key1");
	console.log('test', testEntry);
	myCache.add("key1", {'thisTest':'test string'});
	var cachedEntry = myCache.retrieve("key1");
	console.log(cachedEntry);
});
*/

jQuery(document).ready(function() {
	if (jQuery.browser.opera) {
		jQuery('html').addClass('opera');
	}
	jQuery('.delay_show').each(function() {
		jQuery(this).removeClass('delay_show');
	});
	
	
	var myObj = function() {
		this.field1 = 'value1';
		this.field2 = 'value2';	
		var target = this.target = jQuery('html');
		this.init();
		this.bindEvents();
	};
	
	myObj.prototype.init = function() {
		this.field2 = 'new value';
	};
	
	myObj.prototype.get = function() {
		return this.field2;
	};
	
	myObj.prototype.set = function(val) {
		this.field2 = val;
	};
	
	myObj.prototype.bindEvents = function() {
		var thisContext = this;					/* provide a context variable for closures */
		this.target.on('click', function() {	/* this results in a closure */
			thisContext.target.trigger('testEvent');
		});
		this.target.on('testEvent', function(data) {
			console.log(data.currentTarget.className);
			console.log(thisContext.get());
		});
		this.target.on('click', '.topic', function() {
			if(jQuery(this).css('cursor').toLowerCase() === 'pointer') {
				var  $parent = jQuery(this).closest('.info_card');
				if ($parent.hasClass('expanded')) {
					$parent.removeClass('expanded');
				} else {
					var list = jQuery('.info_card').removeClass('expanded');
					$parent.addClass('expanded');
				}
			}
		});
	};
	
	/* var myTest = */ new myObj();
//	alert(myTest.get());
//	myTest.set('another new value');
//	alert(myTest.get());
});

/*
var thisTest = document.getElementsByTagName('body')[0],
	attr = 'this is a test';
console.log(thisTest);
thisTest.setAttribute('myTest', attr);
console.log(thisTest.getAttribute('myTest'));
attr = {};
attr.testAttr = 'this is a JSON test';
thisTest.setAttribute('myTest', attr);
console.log(thisTest.getAttribute('myTest').testAttr);
*/

/*
YUI().use('node', 'event', 'cache', function(Y){
	var testObj = function() {
		this.dataStore = {};
	};
	
	testObj.prototype.setData = function(el, data) {
		var id = el.get('id');
		if (id === null || id == '') {
			id = Y.guid();
			el.set('id', id);
		}
		this.dataStore[id] = data;
	}
	
	testObj.prototype.getData = function(el) {
		return this.dataStore[el.get('id')];
	}
	
	var oBody = Y.one('body'),
		myObj = new testObj();
	myObj.setData(oBody, {'data': 'my test data object'});
	var returnedData = myObj.getData(oBody).data;




	var myCache = new Y.CacheOffline({max:5});
	var testEntry = myCache.retrieve("key1");
	console.log('test', testEntry);
	myCache.flush();
	testEntry = myCache.retrieve("key1");
	console.log('flushed', testEntry);
	myCache.add("key1", returnedData);
	var cachedEntry = myCache.retrieve("key1");
	console.log('rebuilt', cachedEntry);

});

*/
jQuery.noConflict();
$ = document.querySelectorAll.bind(document);



