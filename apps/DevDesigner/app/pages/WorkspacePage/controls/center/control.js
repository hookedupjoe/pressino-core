/*
Author: Joseph Francis
License: MIT
*/
(function (ActionAppCore, $) {

	var ControlSpecs = {
		"options": {
			padding: false
		},
		"content": [
		{
			ctl: "layout",
			name: "layout",
			north: [{
				ctl: "div",
				attr: {
					pagespot: "nav-tabs",
					text: ""
				}
			}],
			center: [
				
				{
					ctl: "div",
					attr: {
						pagespot: "ws-work-area"
					},
					content: [
						{
							ctl: "div",
							attr: {
								appuse: "cards",
								group: "workspace-outline",
								item: "workspace"
							},
							content: [
								{
									ctl: "segment",
									basic: true,
									slim: true,
									content: [
									
										{
											ctl: "title",
											icon: "hdd",
											color: "black",
											size: "large",
											text: "Designer Workspace"
										},
										{
											ctl: "segment",
											basic: true,
											slim: true,
											content: [
												{
													"ctl": "button",
													"color": "teal",
													"size": "large",
													"pageaction": "addCatalog",
													"labeled": true,
													"right": true,
													"icon": "archive",
													"name": "btn-new-cat",
													"text": "Add New Catalog"
												},
												{
													"ctl": "button",
													"color": "white",
													"size": "large",
													"pageaction": "refreshCatalogs",
													"labeled": true,
													"right": true,
													"icon": "recycle",
													"name": "btn-refresh-cats",
													"text": "Refresh"
												},
												{
													"ctl": "div",
													"classes": "pad4",
													"name": "listpanelpad"
												},
												{
													"ctl": "panel",
													"controlname": {"[computed]": "context.app.data.designer.endpoints.get_ws_outline || ''"},
													"name": "listpanel"
												}
	
											]
										}
	
									]
								}
							]
						}
					]
				}
			]
		}
		]
	}

	
	function getBaseURL(){
		return this.parts.listpanel.controlConfig.options.baseURL;
	}
	var ControlCode = {
		_onInit: _onInit,
		_onPreInit: _onPreInit,
		getBaseURL: getBaseURL
	};

	function _onInit(){
		this.parts.listpanel.subscribe('selectMe', onWsSelect.bind(this))
	}

	function _onPreInit(){

	}

	function onWsSelect(theEvent, theControl, theTarget){
		this.publish('selected', [theControl, theTarget])
	}


	var ThisControl = { specs: ControlSpecs, options: { proto: ControlCode, parent: ThisApp } };

	return ThisControl;

})(ActionAppCore, $);

