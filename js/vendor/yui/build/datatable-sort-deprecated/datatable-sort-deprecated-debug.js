/*
YUI 3.5.0 (build 5089)
Copyright 2012 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/
YUI.add('datatable-sort-deprecated', function(Y) {

/**
 * Plugs DataTable with sorting functionality.
 *
 * @module datatable
 * @submodule datatable-sort
 */

/**
 * Adds column sorting to DataTable.
 * @class DataTableSort
 * @extends Plugin.Base
 */
var YgetClassName = Y.ClassNameManager.getClassName,

    DATATABLE = "datatable",
    COLUMN = "column",
    ASC = "asc",
    DESC = "desc",

    //TODO: Don't use hrefs - use tab/arrow/enter
    TEMPLATE = '<a class="{link_class}" title="{link_title}" href="{link_href}">{value}</a>';


function DataTableSort() {
    DataTableSort.superclass.constructor.apply(this, arguments);
}

/////////////////////////////////////////////////////////////////////////////
//
// STATIC PROPERTIES
//
/////////////////////////////////////////////////////////////////////////////
Y.mix(DataTableSort, {
    /**
     * The namespace for the plugin. This will be the property on the host which
     * references the plugin instance.
     *
     * @property NS
     * @type String
     * @static
     * @final
     * @value "sort"
     */
    NS: "sort",

    /**
     * Class name.
     *
     * @property NAME
     * @type String
     * @static
     * @final
     * @value "dataTableSort"
     */
    NAME: "dataTableSort",

/////////////////////////////////////////////////////////////////////////////
//
// ATTRIBUTES
//
/////////////////////////////////////////////////////////////////////////////
    ATTRS: {
        /**
        * @attribute trigger
        * @description Defines the trigger that causes a column to be sorted:
        * {event, selector}, where "event" is an event type and "selector" is
        * is a node query selector.
        * @type Object
        * @default {event:"click", selector:"th"}
        * @writeOnce "initOnly"
        */
        trigger: {
            value: {event:"click", selector:"th"},
            writeOnce: "initOnly"
        },
        
        /**
        * @attribute lastSortedBy
        * @description Describes last known sort state: {key,dir}, where
        * "key" is column key and "dir" is either "asc" or "desc".
        * @type Object
        */
        lastSortedBy: {
            setter: "_setLastSortedBy",
            lazyAdd: false
        },
        
        /**
        * @attribute template
        * @description Tokenized markup template for TH sort element.
        * @type String
        * @default '<a class="{link_class}" title="{link_title}" href="{link_href}">{value}</a>'
        */
        template: {
            value: TEMPLATE
        },

        /**
         * Strings used in the UI elements.
         *
         * The strings used are defaulted from the datatable-sort language pack
         * for the language identified in the YUI "lang" configuration (which
         * defaults to "en").
         *
         * Configurable strings are "sortBy" and "reverseSortBy", which are
         * assigned to the sort link's title attribute.
         *
         * @attribute strings
         * @type {Object}
         */
        strings: {
            valueFn: function () { return Y.Intl.get('datatable-sort-deprecated'); }
        }
    }
});

/////////////////////////////////////////////////////////////////////////////
//
// PROTOTYPE
//
/////////////////////////////////////////////////////////////////////////////
Y.extend(DataTableSort, Y.Plugin.Base, {

    /////////////////////////////////////////////////////////////////////////////
    //
    // METHODS
    //
    /////////////////////////////////////////////////////////////////////////////
    /**
    * Initializer.
    *
    * @method initializer
    * @param config {Object} Config object.
    * @private
    */
    initializer: function(config) {
        var dt = this.get("host"),
            trigger = this.get("trigger");
            
        dt.get("recordset").plug(Y.Plugin.RecordsetSort, {dt: dt});
        dt.get("recordset").sort.addTarget(dt);
        
        // Wrap link around TH value
        this.doBefore("_createTheadThNode", this._beforeCreateTheadThNode);
        
        // Add class
        this.doBefore("_attachTheadThNode", this._beforeAttachTheadThNode);
        this.doBefore("_attachTbodyTdNode", this._beforeAttachTbodyTdNode);

        // Attach trigger handlers
        dt.delegate(trigger.event, Y.bind(this._onEventSortColumn,this), trigger.selector);

        // Attach UI hooks
        dt.after("recordsetSort:sort", function() {
            this._uiSetRecordset(this.get("recordset"));
        });
        this.on("lastSortedByChange", function(e) {
            this._uiSetLastSortedBy(e.prevVal, e.newVal, dt);
        });

        //TODO
        //dt.after("recordset:mutation", function() {//reset lastSortedBy});
        
        //TODO
        //add Column sortFn ATTR
        
        // Update UI after the fact (render-then-plug case)
        if(dt.get("rendered")) {
            dt._uiSetColumnset(dt.get("columnset"));
            this._uiSetLastSortedBy(null, this.get("lastSortedBy"), dt);
        }
    },

    /**
    * @method _setLastSortedBy
    * @description Normalizes lastSortedBy
    * @param val {String | Object} {key, dir} or "key"
    * @return {key, dir, notdir}
    * @private
    */
    _setLastSortedBy: function(val) {
        if (Y.Lang.isString(val)) {
            val = { key: val, dir: "desc" };
        }

        if (val) {
            return (val.dir === "desc") ?
                { key: val.key, dir: "desc", notdir: "asc" } :
                { key: val.key, dir: "asc",  notdir:"desc" };
        } else {
            return null;
        }
    },

    /**
     * Updates sort UI.
     *
     * @method _uiSetLastSortedBy
     * @param val {Object} New lastSortedBy object {key,dir}.
     * @param dt {Y.DataTable.Base} Host.
     * @protected
     */
    _uiSetLastSortedBy: function(prevVal, newVal, dt) {
        var strings    = this.get('strings'),
            columnset  = dt.get("columnset"),
            prevKey    = prevVal && prevVal.key,
            newKey     = newVal && newVal.key,
            prevClass  = prevVal && dt.getClassName(prevVal.dir),
            newClass   = newVal && dt.getClassName(newVal.dir),
            prevColumn = columnset.keyHash[prevKey],
            newColumn  = columnset.keyHash[newKey],
            tbodyNode  = dt._tbodyNode,
            fromTemplate = Y.Lang.sub,
            th, sortArrow, sortLabel;

        // Clear previous UI
        if (prevColumn && prevClass) {
            th = prevColumn.thNode;
            sortArrow = th.one('a');

            if (sortArrow) {
                sortArrow.set('title', fromTemplate(strings.sortBy, {
                    column: prevColumn.get('label')
                }));
            }

            th.removeClass(prevClass);
            tbodyNode.all("." + YgetClassName(COLUMN, prevColumn.get("id")))
                .removeClass(prevClass);
        }

        // Add new sort UI
        if (newColumn && newClass) {
            th = newColumn.thNode;
            sortArrow = th.one('a');

            if (sortArrow) {
                sortLabel = (newVal.dir === ASC) ? "reverseSortBy" : "sortBy";

                sortArrow.set('title', fromTemplate(strings[sortLabel], {
                    column: newColumn.get('label')
                }));
            }

            th.addClass(newClass);

            tbodyNode.all("." + YgetClassName(COLUMN, newColumn.get("id")))
                .addClass(newClass);
        }
    },

    /**
    * Before header cell element is created, inserts link markup around {value}.
    *
    * @method _beforeCreateTheadThNode
    * @param o {Object} {value, column, tr}.
    * @protected
    */
    _beforeCreateTheadThNode: function(o) {
        var sortedBy, sortLabel;

        if (o.column.get("sortable")) {
            sortedBy = this.get('lastSortedBy');

            sortLabel = (sortedBy && sortedBy.dir === ASC &&
                         sortedBy.key === o.column.get('key')) ?
                            "reverseSortBy" : "sortBy";

            o.value = Y.Lang.sub(this.get("template"), {
                link_class: o.link_class || "",
                link_title: Y.Lang.sub(this.get('strings.' + sortLabel), {
                                column: o.column.get('label')
                            }),
                link_href: "#",
                value: o.value
            });
        }
    },

    /**
    * Before header cell element is attached, sets applicable class names.
    *
    * @method _beforeAttachTheadThNode
    * @param o {Object} {value, column, tr}.
    * @protected
    */
    _beforeAttachTheadThNode: function(o) {
        var lastSortedBy = this.get("lastSortedBy"),
            key = lastSortedBy && lastSortedBy.key,
            dir = lastSortedBy && lastSortedBy.dir,
            notdir = lastSortedBy && lastSortedBy.notdir;

        // This Column is sortable
        if(o.column.get("sortable")) {
            o.th.addClass(YgetClassName(DATATABLE, "sortable"));
        }
        // This Column is currently sorted
        if(key && (key === o.column.get("key"))) {
            o.th.replaceClass(YgetClassName(DATATABLE, notdir), YgetClassName(DATATABLE, dir));
        }
    },

    /**
    * Before header cell element is attached, sets applicable class names.
    *
    * @method _beforeAttachTbodyTdNode
    * @param o {Object} {record, column, tr, headers, classnames, value}.
    * @protected
    */
    _beforeAttachTbodyTdNode: function(o) {
        var lastSortedBy = this.get("lastSortedBy"),
            key = lastSortedBy && lastSortedBy.key,
            dir = lastSortedBy && lastSortedBy.dir,
            notdir = lastSortedBy && lastSortedBy.notdir;

        // This Column is sortable
        if(o.column.get("sortable")) {
            o.td.addClass(YgetClassName(DATATABLE, "sortable"));
        }
        // This Column is currently sorted
        if(key && (key === o.column.get("key"))) {
            o.td.replaceClass(YgetClassName(DATATABLE, notdir), YgetClassName(DATATABLE, dir));
        }
    },
    /**
    * In response to the "trigger" event, sorts the underlying Recordset and
    * updates the lastSortedBy attribute.
    *
    * @method _onEventSortColumn
    * @param o {Object} {value, column, tr}.
    * @protected
    */
    _onEventSortColumn: function(e) {
        e.halt();
        //TODO: normalize e.currentTarget to TH
        var table  = this.get("host"),
            column = table.get("columnset").idHash[e.currentTarget.get("id")],
            key, field, lastSort, desc, sorter;

        if (column.get("sortable")) {
            key       = column.get("key");
            field     = column.get("field");
            lastSort  = this.get("lastSortedBy") || {};
            desc      = (lastSort.key === key && lastSort.dir === ASC);
            sorter    = column.get("sortFn");

            table.get("recordset").sort.sort(field, desc, sorter);

            this.set("lastSortedBy", {
                key: key,
                dir: (desc) ? DESC : ASC
            });
        }
    }
});

Y.namespace("Plugin").DataTableSort = DataTableSort;





}, '3.5.0' ,{requires:['datatable-base-deprecated','plugin','recordset-sort'], lang:['en']});
