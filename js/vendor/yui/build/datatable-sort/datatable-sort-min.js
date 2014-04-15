/*
YUI 3.5.0 (build 5089)
Copyright 2012 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/
YUI.add("datatable-sort",function(b){var h=b.Lang,e=h.isBoolean,c=h.isString,g=h.isArray,j=h.isObject,f=b.Array,a=h.sub,i={asc:1,desc:-1,"1":1,"-1":-1};function d(){}d.ATTRS={sortable:{value:"auto",validator:"_validateSortable"},sortBy:{validator:"_validateSortBy",getter:"_getSortBy"},strings:{}};b.mix(d.prototype,{sort:function(k,l){return this.fire("sort",b.merge((l||{}),{sortBy:k||this.get("sortBy")}));},SORTABLE_HEADER_TEMPLATE:'<div class="{className}" tabindex="0"><span class="{indicatorClass}"></span></div>',toggleSort:function(l,r){var q=this._sortBy,s=[],n,p,m,k,o;for(n=0,p=q.length;n<p;++n){k={};k[q[n]._id]=q[n].sortDir;s.push(k);}if(l){l=f(l);for(n=0,p=l.length;n<p;++n){k=l[n];o=-1;for(m=s.length-1;n>=0;--n){if(s[m][k]){s[m][k]*=-1;break;}}}}else{for(n=0,p=s.length;n<p;++n){for(k in s[n]){if(s[n].hasOwnProperty(k)){s[n][k]*=-1;break;}}}}return this.fire("sort",b.merge((r||{}),{sortBy:s}));},_afterSortByChange:function(k){this._setSortBy();if(this._sortBy.length){if(!this.data.comparator){this.data.comparator=this._sortComparator;}this.data.sort();}},_afterSortDataChange:function(k){if(k.prevVal!==k.newVal||k.newVal.hasOwnProperty("_compare")){this._initSortFn();}},_afterSortRecordChange:function(m){var l,k;for(l=0,k=this._sortBy.length;l<k;++l){if(m.changed[this._sortBy[l].key]){this.data.sort();break;}}},_bindSortUI:function(){this.after(["sortableChange","sortByChange","columnsChange"],b.bind("_uiSetSortable",this));if(this._theadNode){this._sortHandle=this.delegate(["click","keydown"],b.rbind("_onUITriggerSort",this),"."+this.getClassName("sortable","column"));}},_defSortFn:function(k){this.set.apply(this,["sortBy",k.sortBy].concat(k.details));},destructor:function(){if(this._sortHandle){this._sortHandle.detach();}},_getSortBy:function(p,n){var o,m,k,l;n=n.slice(7);if(n==="state"){o=[];for(m=0,k=this._sortBy.length;m<k;++m){l=this._sortBy[m];o.push({column:l._id,dir:l.sortDir});}return{state:(o.length===1)?o[0]:o};}else{return p;}},initializer:function(){var k=b.bind("_parseSortable",this);this._parseSortable();this._setSortBy();this._initSortFn();this._initSortStrings();this.after({renderHeader:b.bind("_renderSortable",this),dataChange:b.bind("_afterSortDataChange",this),sortByChange:b.bind("_afterSortByChange",this),sortableChange:k,columnsChange:k,"*:change":b.bind("_afterSortRecordChange",this)});this.publish("sort",{defaultFn:b.bind("_defSortFn",this)});},_initSortFn:function(){var k=this;this.data._compare=function(t,s){var r=0,o,p,m,n,l,q;for(o=0,p=k._sortBy.length;!r&&o<p;++o){m=k._sortBy[o];n=m.sortDir;if(m.sortFn){r=m.sortFn(t,s,(n===-1));}else{l=t.get(m.key);q=s.get(m.key);r=(l>q)?n:((l<q)?-n:0);}}return r;};if(this._sortBy.length){this.data.comparator=this._sortComparator;this.data.sort();}else{delete this.data.comparator;}},_initSortStrings:function(){this.set("strings",b.mix((this.get("strings")||{}),b.Intl.get("datatable-sort")));},_onUITriggerSort:function(n){var p=n.currentTarget.getAttribute("data-yui3-col-id"),o=n.shiftKey?this.get("sortBy"):[{}],m=p&&this.getColumn(p),l,k;if(n.type==="keydown"&&n.keyCode!==32){return;}n.preventDefault();if(m){if(n.shiftKey){for(l=0,k=o.length;l<k;++l){if(p===o[l]||Math.abs(o[l][p]===1)){if(!j(o[l])){o[l]={};}o[l][p]=-(m.sortDir|0)||1;break;}}if(l>=k){o.push(m._id);}}else{o[0][p]=-(m.sortDir|0)||1;}this.fire("sort",{originEvent:n,sortBy:o});}},_parseSortable:function(){var o=this.get("sortable"),n=[],m,k,l;if(g(o)){for(m=0,k=o.length;m<k;++m){l=o[m];if(!j(l,true)||g(l)){l=this.getColumn(l);}if(l){n.push(l);}}}else{if(o){n=this._displayColumns.slice();if(o==="auto"){for(m=n.length-1;m>=0;--m){if(!n[m].sortable){n.splice(m,1);}}}}}this._sortable=n;},_renderSortable:function(){this._uiSetSortable();this._bindSortUI();},_setSortBy:function(){var n=this._displayColumns,s=this.get("sortBy")||[],p=" "+this.getClassName("sorted"),o,q,k,l,r,m;this._sortBy=[];for(o=0,q=n.length;o<q;++o){m=n[o];delete m.sortDir;if(m.className){m.className=m.className.replace(p,"");}}s=f(s);for(o=0,q=s.length;o<q;++o){k=s[o];l=1;if(j(k)){r=k;for(k in r){if(r.hasOwnProperty(k)){l=i[r[k]];break;}}}if(k){m=this.getColumn(k)||{_id:k,key:k};if(m){m.sortDir=l;if(!m.className){m.className="";}m.className+=p;this._sortBy.push(m);}}}},_sortComparator:function(k){return k;},_uiSetSortable:function(){var n=this._sortable||[],v=this.getClassName("sortable","column"),o=this.getClassName("sorted"),w=this.getClassName("sorted","desc"),x=this.getClassName("sort","liner"),s=this.getClassName("sort","indicator"),u={},p,r,l,m,k,t,q;this.get("boundingBox").toggleClass(this.getClassName("sortable"),n.length);for(p=0,r=n.length;p<r;++p){u[n[p].id]=n[p];}this._theadNode.all("."+v).each(function(B){var A=u[B.get("id")],z=B.one("."+x),y;if(A){if(!A.sortDir){B.removeClass(o).removeClass(w);}}else{B.removeClass(v).removeClass(o).removeClass(w);if(z){z.replace(z.get("childNodes").toFrag());}y=B.one("."+s);if(y){y.remove().destroy(true);}}});for(p=0,r=n.length;p<r;++p){l=n[p];m=this._theadNode.one("#"+l.id);q=l.sortDir===-1;if(m){k=m.one("."+x);m.addClass(v);if(l.sortDir){m.addClass(o);m.toggleClass(w,q);m.setAttribute("aria-sort",q?"descending":"ascending");}if(!k){k=b.Node.create(b.Lang.sub(this.SORTABLE_HEADER_TEMPLATE,{className:x,indicatorClass:s}));k.prepend(m.get("childNodes").toFrag());m.append(k);}t=a(this.getString((l.sortDir===1)?"reverseSortBy":"sortBy"),{column:l.abbr||l.label||l.key||("column "+p)});m.setAttribute("title",t);m.setAttribute("aria-labelledby",l.id);}}},_validateSortable:function(k){return k==="auto"||e(k)||g(k);},_validateSortBy:function(k){return k===null||c(k)||j(k,true)||(g(k)&&(c(k[0])||j(k,true)));}},true);b.DataTable.Sortable=d;b.Base.mix(b.DataTable,[d]);},"3.5.0",{lang:["en"],requires:["datatable-base"]});