(function(ActionAppCore, $) {

    var ControlSpecs = {
      options: {
        padding: false,
        css: ['.table-footer {clear:right;line-height:30px;padding-left:10px;border:none;color: #2185d0;}']
      },
      content: [{
        "ctl": "layout",
        "attr": {
          "rem-template": "none"
        },
        "name": "lo",
        "north": [{
          ctl: 'div',
          name: 'toolbar',
          content: []
        }, {
          "ctl": "control",
          "controlname": "SearchBar",
          "catalog": "_wordpress",
          "name": "searchbar"
        },
        {
          ctl: 'div',
          classes: 'ui message small mar0 pad4 hidden',
          attr: {'myspot':'filtered-count'},
          name: 'filtered-count'
        }],
        "disabled-east": [{
          "ctl": "segment",
          "basic": true,
          "slim": true,
          "content": [{
            "ctl": "segment",
            "color": "blue",
            content: [{
              "ctl": "spot",
              "name": "preview"
            }]
          }]
        }],
        "center": [{
          ctl: 'spot',
          name: 'report-area'
        }],
        "south": [{
          "ctl": "ui",
          "name": "footer-toolbar",
          "classes": "labeled icon compact pad0",
          "content": [{
            "ctl": "button",
            "color": "blue",
            "icon": "outline square check blue",
            "toLeft": true,
            compact: true,
            basic: true,
            "name": "btn-fb-all",
            "onClick": {
              "run": "action",
              "action": "selectAll"
            }
          },
            {
              "ctl": "button",
              "toLeft": true,
              "color": "blue",
              "icon": "outline times square blue",
              compact: true,
              basic: true,
              "name": "btn-fb-none",
              "onClick": {
                "run": "action",
                "action": "selectNone"
              }
            },
            {
              "ctl": "button",
              "toLeft": true,
              compact: true,
              basic: true,
              "color": "blue",
              "icon": "recycle",
              "name": "btn-tb-refresh",
              "onClick": {
                "run": "action",
                "action": "refresh"
              }
            },
            {
              "ctl": "button",
              "toLeft": true,
              "color": "blue",
              "icon": "table",
              compact: true,
              basic: true,
              "name": "btn-fb-export",
              "onClick": {
                "run": "action",
                "action": "exportTable"
              }
            },
            {
              ctl: "div",
              classes: "item",
              text: '<span class="table-footer one-liner" myspot="selected-count"></span>'
            }]
        }]
      }]
    };
  
    var ControlCode = {};
  
    ControlCode.refresh = function(theOptions) {
      var tmpOptions = theOptions || {};
      if (tmpOptions.full === true) {
        // --- do a full pull
        this.lastTimestamp = false;
      }
      this.showReport(theOptions);
    };
  
    ControlCode.notDeleted = function(data, filterParams) {
      return (data._deleted != "1");
    };
  
    ControlCode.postProcessData = function() {
      var tmpRows = this.mainTable.getRows();
      this.batchSelect = true;
  
      this.batchSelect = false;
  
      if (!this.syncReload) {
        this.publish('dataChange', [this.tableData, this]);
      }
  
    };
  
    ControlCode.refreshData = function(theData, theOptions) {
      var tmpThis = this;
      var tmpSelectedRows = this.mainTable.getSelectedRows();
      this.mainTable.replaceData(theData).then(function() {
        var tmpRows = [];
        for (let iPos = 0; iPos < tmpSelectedRows.length; iPos++) {
          const tmpItem = tmpSelectedRows[iPos];
          var tmpID = '';
          var tmpData = tmpItem.getData() || {};
          if (tmpData) {
            tmpID = tmpData.id || '';
            tmpRows.push(tmpID);
          }
        }
        if (tmpRows.length > 0) {
          tmpThis.mainTable.selectRow(tmpRows);
          tmpThis.refreshSelection();
        }
      }).catch(function() {
        console.error('The table did not update for some reason', arguments);
      });
  
      this.tableData = theData;
      var tmpOptions = theOptions || {};
  
      if (tmpOptions.select) {
        this.selectByUNID(tmpOptions.select);
      }
      this.postProcessData();
      this.refreshTableUI();
    };
  
  
    ControlCode.createTable = function(theOptions) {};
  
    ControlCode.refreshReport = function() {
      this.createTable();
    };
  
    ControlCode.loadCurrentReport = function() {
      this.createTable();
    };
  
    ControlCode.refreshSize = function() {
      ThisApp.resizeToLayout($(this.mainTableEl));
      if (this.mainTable) {
        this.mainTable.redraw();
        this.mainTable.setHeight('100%');
      }
    };
  
    ControlCode.refreshTableUI = function(theOptions) {
      var tmpOptions = theOptions || {};
      this.refreshSize();
      this.refreshSelection();
    };
  
    ControlCode._onParentResize = function() {
      var tmpThis = this;
      // --- ToDo: Buffer to do less times?
      ThisApp.delay(200).then(function() {
        tmpThis.refreshSize();
      });
    };
  
    ControlCode.initTable = function(theDetails, theOptions) {
      var tmpDetails = theDetails || {};
  
      var tmpData = tmpDetails.data || [];
      var tmpCols = tmpDetails.columns || this.columnSpecs || false;
      if (!(tmpCols)) {
        console.error("No column details passed, can not initialize empty table.");
        return false;
      }
  
      this.tableData = [];
      this.columnSpecs = tmpCols;
  
      try {
        if (!(this.mainTable)) {
          this.mainTableEl = this.getSpot('report-area');
  
          this.tableData = tmpData;
          //this.initTableIndex();
  
          var tmpRowSelected = ActionAppCore.debounce(function(theEvent, row) {
            if (this.batchSelect) {
              return;
            }
            this.refreshSelection();
            //this.publish('data-selected', [this, row.getData()]);
          },
            200);
  
          // var tmpWH = $(window).height();
          // //-- Current blank view height
          var tmpVH = $('[spot="viewer"]').height();
          // var tmpBuffer = 60;
  
          // tmpWH = tmpWH - tmpVH - tmpBuffer;
  
          // if( tmpWH < 300){
          //   tmpWH = 300;
          // }
          // var tmpH = theEl.closest('.ui-layout-pane').height();
  
          this.tableConfig = $.extend({
            rowDblClick: onDoubleClick.bind(this),
            height: "100%",
            selectableRangeMode: "click",
            selectable: true,
            maxHeight: "100%",
            persistence: false,
            reactiveData: true,
            data: this.tableData,
            columns: this.columnSpecs,
            tableBuilt: onTableBuilt.bind(this),
            scrollVertical: onScrollVert.bind(this),
            scrollHorizontal: onScrollHoriz.bind(this),
            rowSelected: tmpRowSelected.bind(this),
            rowClick: tmpRowSelected.bind(this),
            rowDeselected: rowDeselected.bind(this),
            groupToggleElement: "header"
          },
            this.tableConfig);
  
          this.mainTable = new Tabulator(this.mainTableEl.get(0), this.tableConfig);

          //--- New Version 5, just subscribe to events now ...
          // this.mainTable.on("tableBuilt", onTableBuilt.bind(this));
          // this.mainTable.on("scrollVertical", onScrollVert.bind(this));
          // this.mainTable.on("scrollHorizontal", onScrollHoriz.bind(this));
          // this.mainTable.on("rowSelected", tmpRowSelected.bind(this));
          // this.mainTable.on("rowClick", tmpRowSelected.bind(this));
          // this.mainTable.on("rowDeselected", rowDeselected.bind(this));
          this.refreshSelection();
        }

        //--- Add default filter to excluded deleted records (one tie)
        //---> NOTE: Disabled, doing a full refresh of data now:
        //---   Use this if the update only method is employed.
        //--------->  this.mainTable.addFilter(this.notDeleted, {});
  
        this.postProcessData();
        this.refreshTableUI(theOptions);
  
      } catch (ex) {
        console.error("Error setting up Tabulator",
          ex);
      }
  
    };
    function onTableBuilt() {
      this.publish('tableBuilt',
        [this]);
    }
    function onScrollVert(thePos) {
      this.lastScrollV = thePos;
    }
    function onScrollHoriz(thePos) {
      this.lastScrollH = thePos;
    }
  
    function matchAny(data, filterParams) {
      var checkVal = filterParams.value.toLowerCase();
      var tmpIsCols = Array.isArray(filterParams.columns);
      var tmpKeyList = data;
      if (tmpIsCols) {
        tmpKeyList = {};
        for (var iPos in filterParams.columns) {
          var tmpCol = filterParams.columns[iPos];
          var tmpKey = tmpCol.field;
          if (tmpKey) {
            tmpKeyList[tmpKey] = true;
          }
        }
      }
  
      var match = false;
      var key = '';
      if (filterParams.startsWith === true) {
        for (key in tmpKeyList) {
          if (data[key].toLowerCase && data[key].toLowerCase().indexOf(checkVal) === 0) {
            match = true;
            break;
          }
        }
      } else {
        for (key in tmpKeyList) {
  
          if (!data[key]) {
            //console.warn("no data for " + key);
          } else {
            if (data[key].toLowerCase && data[key].toLowerCase().indexOf(checkVal) > -1) {
              match = true;
              break;
            }
          }
        }
      }
      return match;
    }
  
    ControlCode.rowSelected = rowSelected;
    function rowSelected(row) {
      if (this.batchSelect) {
        return;
      }
      this.refreshSelection();
      //this.publish('data-selected', [this, row.getData()]);
    }
  
    function rowDeselected(row) {
      if (this.batchSelect) {
        return;
      }
      this.refreshSelection();
    }
    function rowClicked(e, row) {
      if (this.batchSelect) {
        return;
      }
      this.rowSelected(row);
    }
  
    
    ControlCode.recycleSelected = function() {
      var tmpViewer = this;
      ThisApp.confirm('Recycle the selected documents?',
        'Recycle?').then(function(theIsYes) {
          if (theIsYes) {
            tmpViewer.recycleSelectedDocs();
          }
        });
    }

    ControlCode.recycleSelectedDocs = function() {
      var tmpViewer = this;
      var tmpSelected = tmpViewer.getSelectedKeys();
      var tmpData = {
        ids: tmpSelected
      };
  
      var tmpBaseURL = ActionAppCore.ActAppWP.rootPath;
      var tmpPostOptions = {
        formSubmit: false,
        data: tmpData,
        url: tmpBaseURL + '/wp-json/actappdesigner/recycle?open'
      };
  
      ThisApp.apiCall(tmpPostOptions).then(function() {
        tmpViewer.showReport();
      });
  
    };

    ControlCode.addNewDoc = function(theOptions) {
      var tmpOptions = theOptions || {};
      var self = this;
      var tmpForm = tmpOptions.formcontrol;
      if( !(tmpForm) ){
        alert("Error adding document, no form provided. Contact support.", "Error Adding Document");
      }
      tmpForm.prompt({isNew: true}).then(function(theSubmit, theData) {
        if (!theSubmit) {
          return;
        }
        tmpForm.submitForm().then(function() {
          self.showReport();
        });
      });
    }


    ControlCode.editSelectedDoc = function(theOptions) {
      var tmpOptions = theOptions || {};
      //var tmpForm = tmpOptions.formcontrol;
      var tmpData = {control:this,options:tmpOptions};
      //ToDo: Allow onEdit from options?
      tmpOptions.onEdit = this.promptEditForm.bind(tmpData);
      this.getDocToEdit(tmpOptions);
    }
  
    ControlCode.promptEditForm = function(theDoc, theViewer) {
      var self = this.control;
      var tmpOptions = this.options || {};
      var tmpDoc = theDoc;
      var tmpForm = tmpOptions.formcontrol;

      var tmpPromptOptions = tmpOptions.promptOptions || {};
      tmpPromptOptions.doc = tmpDoc;
      if( !tmpForm.submitForm ){
        alert("Form missind submitForm, contact support", "Error Saving Document");
      }

      var self = this;
      tmpForm.prompt(tmpPromptOptions).then(function(theSubmit,
        theData) {
  
        if (!theSubmit) {
          var tmpReqData = {
            id: tmpDoc.id
          };
          ThisApp.apiCall({
            url: ActionAppCore.ActAppWP.restPath + 'actappdesigner/unlockdoc', data: tmpReqData
          }).then(function(theReply) {
            if (!theReply.unlocked) {
              alert('Could not unlock document. Next time it is edited it may show as locked.', "Error Unlocking Document")
            }
          });
        } else {
          tmpForm.submitForm().then(function(theReply) {
            if( !(theReply && theReply.result == 'updated json')){
              alert("There was an issue saving this document. Check your internet connection and try again, if the error persists, contact support.", "Error Saving Document");
            }
            theViewer.showReport();
          });
        }
      });
    }

    ControlCode.getDocToEdit = function(theOptions) {
      var tmpOptions = theOptions || {};
      var tmpEditFunction = tmpOptions.onEdit;
     
      if( !(tmpEditFunction) ){
        alert("There was an issue editing, contact support. No onEdit passed.", "Can not Edit");
        return;
      }
//      var tmpBind = theOptions.bind || false;
      var tmpViewer = this;
      var tmpSelected = tmpViewer.getSelectedKeys();
      var tmpRow = tmpViewer.mainTable.getRow(tmpSelected[0]);
      var tmpDoc = tmpRow._row.data;

      var tmpReqData = {
        id: tmpDoc.id,
        uid: tmpDoc.__uid || ''
      };

      ThisApp.apiCall({
        url: ActionAppCore.ActAppWP.restPath + 'actappdesigner/editdoc',
        data: tmpReqData
      }).then(function(theReply) {
        if (theReply.isLocked) {
          ThisApp.confirm(tmpOptions.recordLockedMsg || "This record is locked. If edited, others may lose changes. Only unlock if you know this was locked in error. Do you want to unlock and edit this document?", tmpOptions.recordLockedTitle || "Document Being Edited")
          .then(function (theIsYes) {
            if (theIsYes) {
              tmpEditFunction(theReply.doc, tmpViewer);
            }
          })
        } else {
          tmpEditFunction(theReply.doc, tmpViewer);
        }
      });
    };

  
    ControlCode.setup = function(theOptions) {
      var tmpOptions = theOptions || {};
      var tmpOptConfig = tmpOptions.tableConfig || {};
      var tmpToolbar = tmpOptions.toolbar || false;
  
      if (tmpToolbar) {
        var tmpConfig = this.getConfig();
      } else {
        tmpToolbar = [{
          "ctl": "spot",
          "name": "top-toolbar"
        }]
      }
  
  
      var tmpViewName = tmpOptions.viewname || tmpOptions.viewName || '';
      this.viewName = tmpViewName;
      this.selectedIndex = {};
  
      this.selectIcon = function(cell, formatterParams) {
        return "<i class='ui icon square outline blue select'></i>";
      };
  
      this.reportCols = tmpOptions.columns || [ {
        "title": "ID",
        "field": "__uid"
      }];
  
      var tmpCheckBoxIcon = {
        formatter: this.selectIcon,
        headerSort: false,
        hozAlign: "center",
        frozen: true
      };
      this.reportCols.unshift(tmpCheckBoxIcon);
  
  
      this.tableConfig = $.extend({}, tmpOptConfig)
      this.tableConfig.columns = this.reportCols;
  
      var tmpToRun = this.showReport.bind(this);
      if (Array.isArray(tmpToolbar)) {
        var tmpTBSpecs = this.getItemSpecs('toolbar');
        tmpTBSpecs.content = tmpToolbar.concat(tmpTBSpecs.content);
      }
  
      this.refreshUI().then(tmpToRun);
  
    }
  
    ControlCode.getReportURL = function(theOptions) {
      return this.reportURL || '';
    }
    ControlCode.setReportURL = function(theURL) {
      this.reportURL = theURL;
    }
    ControlCode.showReport = function(theOptions) {
      var dfd = jQuery.Deferred();
      var tmpOptions = theOptions || {};
      var tmpThis = this;
      var tmpURL = this.getReportURL(theOptions);
      var tmpFullPull = true;
  
      if (tmpThis.lastTimestamp) {
        tmpFullPull = false;
      }
  
      ThisApp.apiCall( {
        loading: this.getEl(),
        cache: true,
        url: tmpURL
      }).then(function(theReply) {
        tmpThis.reloadedNeeded = false;
        var tmpData = theReply;
        if (typeof (tmpData) === 'string') {
          tmpData = JSON.parse(tmpData);
        }
  
        tmpData = tmpData.data || tmpData.docs || tmpData || [];
  
        if (tmpThis.viewerLoaded !== true) {
          tmpThis.viewerLoaded = true;
          tmpThis.initTable( {
            data: tmpData,
            columns: tmpThis.reportCols
          }, theOptions);
        } else {
          tmpOptions.fullPull = tmpFullPull;
          tmpThis.refreshData(tmpData, tmpOptions);
        }
        dfd.resolve(true)
  
      })
  
      return dfd.promise();
    }
  
 
    
  ControlCode.refreshSelection = function () {

    var tmpLastCounts = this.counts || {
      all: 0,
      filtered: 0,
      selected: 0
    };

    var tmpDocCount = this.tableData.length;

    var tmpSelected = this.mainTable.getSelectedRows();
    // --- replace old counts
    this.counts = {
      all: tmpDocCount,
      filtered: this.mainTable.getDataCount('active'),
      selected: tmpSelected.length
    };
    if (this.counts.all == this.counts.filtered) {
      this.counts.filtered = 0;
    }
    var tmpCountChanged = true;
    if (tmpLastCounts.all == this.counts.all && tmpLastCounts.filtered == this.counts.filtered && tmpLastCounts.selected == this.counts.selected) {
      tmpCountChanged = false;
    }

    this.refreshSearchUI();

    var tmpTotalCount = " " + (this.counts.all || "none") + " records.";
    var tmpSelCount = " (" + (this.counts.selected || "none")
      + " selected)";
    var tmpFilterCount = "Search found " + (this.counts.filtered || "none");
    if( this.counts.filtered == 0){
      this.getItemEl('filtered-count').removeClass('green').addClass('hidden');
      tmpFilterCount = ''
    } else {
      this.getItemEl('filtered-count').addClass('green').removeClass('hidden');
    }
    this.loadSpot('selected-count', tmpTotalCount + " " + tmpSelCount)
    this.loadSpot('filtered-count', tmpFilterCount);
    this.publish('selectionChange', [tmpCountChanged, this.counts, this]);

  };


    ControlCode.refreshSelectionORIG_DELETEME = function() {
  
      var tmpLastCounts = this.counts || {
        all: 0,
        filered: 0,
        selected: 0
      };
  
      var tmpDocCount = 0;
      for (var iPos in this.tableData) {
        var tmpDoc = this.tableData[iPos];
        if (tmpDoc && (tmpDoc.id) && (!tmpDoc._deleted)) {
          tmpDocCount++;
        }
      }
  
      var tmpSelected = this.mainTable.getSelectedRows();
      // --- replace old counts
      this.counts = {
        all: tmpDocCount,
        filtered: this.mainTable.getDataCount(),
        selected: tmpSelected.length
      };
      if (this.counts.all == this.counts.filtered) {
        this.counts.filtered = 0;
      }
      var tmpCountChanged = true;
      if (tmpLastCounts.all == this.counts.all && tmpLastCounts.filtered == this.counts.filtered && tmpLastCounts.selected == this.counts.selected) {
        // --- Nothing changed
        tmpCountChanged = false;
      }
  
  
      this.refreshSearchUI();
  
      var tmpTotalCount = " " + (this.counts.all || "none") + " records.";
      var tmpSelCount = " (" + (this.counts.selected || "none")
      + " selected)";
      var tmpFilterCount = " (" + (this.counts.filtered || "none")
      + " filtered)";
      this.loadSpot('selected-count', tmpTotalCount + " " + tmpSelCount)
      this.loadSpot('filtered-count', tmpFilterCount);
      this.publish('selectionChange', [tmpCountChanged, this.counts, this]);
      this.publish('data-selected', [this]);
  
    };
  
    ControlCode.initSearch = function() {
      this.parts.searchbar.subscribe('search', this.quickSearch.bind(this));
      this.parts.searchbar.subscribe('clear', this.clearSearch.bind(this));
    }
  
    ControlCode.refreshSearchUI = function() {
      var tmpClearDisabled = !(this.parts.searchbar.getFieldValue('search').trim());
      this.setItemDisabled('btn-clear-search', tmpClearDisabled)
    };
  
    ControlCode.quickSearch = function() {
      var tmpSS = this.parts.searchbar.getFieldValue('search');
      this.mainTable.clearFilter();
      this.mainTable.addFilter(matchAny, {
        columns: this.columnSpecs,
        value: tmpSS,
        startsWith: false
      });
      this.refreshSelection();
    };
  
    ControlCode.clearSearch = function() {
      this.mainTable.clearFilter();
      this.mainTable.addFilter(this.notDeleted, {});
      this.setFieldValue('search', '');
      this.refreshSelection();
    };

    function onDoubleClick(e,row){
      this.publish('doubleClick',[row]);
      window.getSelection().removeAllRanges();
    }

    
    ControlCode._onDestroy = function() {
      if(this.mainTable && this.mainTable.destroy){
        this.mainTable.destroy();
      }
    }

    ControlCode._onInit = function() {
      this.initSearch();
    }
    ControlCode.selectByUNID = function(theUNID) {
  
      var tmpID = theUNID;
      this.mainTable.deselectRow();
  
      // --- ToDo: Better way?
      var tmpRows = this.mainTable.getRows();
      for (var iPos in tmpRows) {
        var tmpRow = tmpRows[iPos];
        var tmpDoc = tmpRow.getData();
        if (tmpDoc.id == tmpID) {
          tmpRow.select();
          break;
        }
      }
  
      this.refreshSelection();
    };
  
    
    ControlCode.selectAll = function () {
      this.mainTable.deselectRow();
      this.selectFiltered();
    };

    ControlCode.selectAllDELTEME_ORIGINAL_VERSION = function() {
      this.mainTable.deselectRow();
      var selectedRows = this.mainTable.getRows();
      this.batchSelect = true;
      for (var iPos in selectedRows) {
        var tmpRow = selectedRows[iPos];
        var tmpData = tmpRow.getData();
        if (tmpData._deleted != "1") {
          this.mainTable.selectRow(tmpRow);
        }
      }
      this.batchSelect = false;
      this.refreshSelection();
    };
  
    ControlCode.selectNone = function() {
      this.mainTable.deselectRow();
      this.refreshSelection();
    };
  
    ControlCode.selectFiltered = function() {
      this.mainTable.deselectRow();
      var selectedRows = this.mainTable.getRows(true);
      this.batchSelect = true;
      for (var iPos in selectedRows) {
        this.mainTable.selectRow(selectedRows[iPos]);
      }
      this.batchSelect = false;
  
      this.refreshSelection();
    };

    ControlCode.getFirstSelectedDoc = function() {
      var tmpSelected = this.getSelectedKeys();
      if( !(tmpSelected && tmpSelected.length > 0)){return false;}
      var tmpRow = this.mainTable.getRow(tmpSelected[0]);
      if( tmpRow && tmpRow._row && tmpRow._row.data){
        return tmpRow._row.data;
      }
      return false;
    };

    ControlCode.getSelectedKeys = function() {
      var tmpRet = [];
  
      var tmpSelected = this.mainTable.getSelectedRows();
      if (tmpSelected && tmpSelected.length) {
        for (var iPos in tmpSelected) {
          var tmpSel = tmpSelected[iPos];
          var tmpSelDoc = tmpSel.getData();
          if (tmpSelDoc && tmpSelDoc.id) {
            tmpRet.push(tmpSelDoc.id);
          } else {
            console.warn("Document did not have a UNID.", tmpSelDoc);
          }
        }
      }
      return tmpRet;
    };
  
  
    ControlCode.exportTable = function() {
      this.mainTable.download("xlsx", "myview.xlsx", {
        sheetName: "Exported Data"
      });
    }
  
  
    var ThisControl = {
      specs: ControlSpecs,
      options: {
        proto: ControlCode,
        parent: ThisApp
      }
    };
    return ThisControl;
  })(ActionAppCore, $);