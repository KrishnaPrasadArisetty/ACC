require(["DS/DataDragAndDrop/DataDragAndDrop","DS/PlatformAPI/PlatformAPI","DS/WAFData/WAFData","DS/i3DXCompassServices/i3DXCompassServices"], function(DataDragAndDrop,PlatformAPI,WAFData,BaseUrl){
	
	//var widgetTitle;
	
	var allowdType ;
	var allowdTypes;
	var actualType ;
	var dispType   ;
	
	var divBody;
	var divMain;
	var table;
	var thead;
	var tbody;
	
	var applyRow;
	var headerRow;
	var arrObjList;
	var readOnly = true;
	//var test = b.ClipboardError;
	
	var projecttemplate;
	var inputCITemp;
	var ctdtemplate;
	var cpirange
	var divLoader;//Added for NNBPLM-22115
	
var comWidget={
    widgetDataSelected: {},
	onLoad: function() {
			//widgetTitle = widget.getValue("Title");
			//widget.setTitle(widgetTitle);
			
			allowdType 	= widget.getValue("Type");
			allowdTypes	= allowdType.split("#");
			actualType 	= allowdTypes[0];
			dispType	= allowdTypes[1];
		
			arrObjList	= [];
			mainDiv = widget.createElement('div');
			mainDiv.id ="mainDiv";
			divBody = widget.createElement('div');
			divBody.id	= "tableContainer";
			table 	= widget.createElement('table');
			table.id="mainTable";
			thead 	= widget.createElement('thead');
			thead.id	= "tableHead";
			tbody 	= widget.createElement('tbody');
			tbody.id	= "tableBody";
			//tbody="tableBody";
			
			let inlinediv = document.createElement('div');
			inlinediv.className='inlinediv';
			let inputCITemp = document.createElement('input');
			inputCITemp.type='textbox';
			inputCITemp.id = 'template';
			//inputCITemp.placeholder = 'Enter the CI Title';
			let inputLabel=  document.createElement('label');
			inputLabel.innerHTML="CI Title :&nbsp;"

			inlinediv.appendChild(inputLabel);
			inlinediv.appendChild(inputCITemp);
			
			//mainDiv.appendChild(document.createElement("br"));
			//mainDiv.appendChild(document.createElement("br"));
			
			let inputLabel1=  document.createElement('label');
			inputLabel1.innerHTML="&nbsp;&nbsp;&nbsp;&nbsp;Target Unit: &nbsp;"

			
			let dropUnit = document.createElement('select');
			dropUnit.className="dropdown";
			dropUnit.id="tunit";
			//dropUnit.text="Target Unit";
			//dropUnit.placeholder = 'Enter the CPI Unit';
			cpiUnit = widget.getValue("Target Unit");
			cpiUnitValues	= cpiUnit.split("#");
			cpiRangeValues = cpiUnitValues[1].split(",");
			//console.log("cpiRangeValues:::"+cpiRangeValues);
			for (var i = 0; i < cpiRangeValues.length; i++){
				//console.log("cpiRangeValues 111:::"+ cpiRangeValues[i]);
				var option = document.createElement('option');
				option.value = cpiRangeValues[i];
				option.innerHTML = cpiRangeValues[i];
				if("Not Unit Specific" == cpiRangeValues[i]) {
					option.selected = true;
				}
					dropUnit.options.add(option);
				
			}
			inlinediv.appendChild(inputLabel1);
			inlinediv.appendChild(dropUnit);
			
			mainDiv.appendChild(inlinediv);
			//mainDiv.appendChild(document.createElement("br"));
			mainDiv.appendChild(document.createElement("br"));
			
			
			table.appendChild(thead);
			table.appendChild(tbody);
			divBody.appendChild(table);
			mainDiv.appendChild(divBody);
			/*Added for NNBPLM-22115 Start*/
			divLoader = widget.createElement('div');
			divLoader.className="loader";
			divLoader.id="loader";
			divLoader.style="display: none !important;";
			mainDiv.appendChild(divLoader);
			/*Added for NNBPLM-22115 End*/
			//console.log("I am here");
			//Added for NNBPLM-18735 - START
			comWidget.setBaseURL();
			setTimeout(() => {
				comWidget.setCSRF();
				comWidget.setSecurityContext();
			}, 1000);
			//Added for NNBPLM-18735 - END
			
			let dropText = 'Drop '+ dispType +' objects here!';
			var dropTitle = widget.createElement('div', {'class': 'myDropEltClass', text : dropText});
			widget.body.innerHTML="";
			dropTitle.inject(widget.body);
			var theDropElt = widget.body.querySelector('.myDropEltClass');
			
			DataDragAndDrop.droppable( theDropElt , {  
				drop : function(data) {	
					//console.log("Dropped Objects");
					//console.log(data);
					//var data1 = data;
					const objs 		= JSON.parse(data);
					let objList 	= objs.data.items;
					let objsLength	= objList.length;
					let objCount;
					let objType;
					let test		= [];
					let objIds 		= [];
					
					for (objCount = 0; objCount < objsLength; objCount++) 
					{
						objType=objList[objCount].objectType;
						if(actualType!=objType)
						{
							alert(objType +" Type of data not allowed");
							return;
						}
						else
						{
							if(arrObjList.indexOf(objList[objCount].objectId) !== -1)  
							{  
								continue;
							}
							else{
								objIds.push("\""+objList[objCount].objectId+"\"");
								arrObjList.push(objList[objCount].objectId);
							}
						}
					}
					//console.log("objIds");
					//console.log(objIds);
					
					var dataResp = comWidget.getObjectsDetail(objIds);
					
					comWidget.objectDropped(dataResp);
					 
					// from Object Dropped Start
					// Adding the header row in thead
					let elmThead = document.getElementById("tableHead");
					if(typeof(elmThead) == 'undefined' || elmThead == null){
						thead.appendChild(headerRow);
					} 
					
					let elmContainer = document.getElementById("mainDiv");
					if(typeof(elmContainer) == 'undefined' || elmContainer == null){
						widget.body.appendChild(mainDiv);
					}
					const btnSubmit = document.createElement('input');
					btnSubmit.type="button";
					btnSubmit.value = 'Create CI';
					//btnSubmit.className="createci";
					btnSubmit.id="submit";
					btnSubmit.addEventListener('click', function (){
						comWidget.showLoader(); //Added for NNBPLM-22115
						let datajson = {};	
						let itemsjson = [];
						let objJSON = {};
						
						projecttemplate = widget.getValue("Project Template");
						ctdtemplate = widget.getValue("CTD Template");
						let cititle = document.getElementById("template").value;
						let targetunit = document.getElementById("tunit").value;
						//console.log("targetunit ::: "+ targetunit);
						//console.log("projecttemplate ::: "+ projecttemplate);
						let Allrows = document.getElementById("tableBody").rows;
						let rowlength = Allrows.length;
						//console.log("rowlength:: "+rowlength);
						for(var icount=0; icount<rowlength; icount++) {
							let objectid = Allrows[icount].getElementsByClassName("objectid")[0].value;
							//console.log("physicalid:: "+objectid);
							objJSON = {"objectId":objectid};
							itemsjson.push(objJSON);
						}
						//console.log("itemsjson:: "+JSON.stringify(itemsjson));
						//Added urlBASE to datajson for NNBPLM-25185
						datajson = {"BaseUrl":widget.getValue("urlBASE"), "projecttemplate":projecttemplate, "CITtile":cititle, "items":itemsjson,"CTDTemplate":ctdtemplate,"targetunit":targetunit};
						
						//console.log("datajson:: "+JSON.stringify(datajson));
						let bStatus = comWidget.createCI(datajson);
						
					});
					let submitelem =  document.getElementById("submit");
					if(typeof(submitelem) == 'undefined' || submitelem == null){
						//widget.body.appendChild(btnSave);
						mainDiv.appendChild(btnSubmit);
					} 
					// from Object Dropped END
					widget.body.style="border:5px hidden;";
				},
				enter : function(){
				}						
			}) ;
	},
	setBaseURL: function() 
	{
		BaseUrl.getServiceUrl( { 
		serviceName: '3DSpace', 
		platformId:  widget.getValue('x3dPlatformId'),
		onComplete :  function (URLResult) {
					 widget.setValue("urlBASE", URLResult+"/");
					},
		onFailure:  function( ) { alert("Something Went Wrong");
		}
		}) ; 
	},
	
	setCSRF: function() {
			// Web Service call to get the crsf token (security) for the current session
			let urlWAF = widget.getValue("urlBASE")+"resources/v1/application/CSRF";
			let dataWAF = {
			};
			let headerWAF = {
			};
			let methodWAF = "GET";
			let dataResp=WAFData.authenticatedRequest(urlWAF, {
				method: methodWAF,
				headers: headerWAF,
				data: dataWAF,
				type: "json",
				async : false,
				onComplete: function(dataResp) {
					// Save the CSRF token to a hidden widget property so it can be recalled
					let csrfArr=dataResp["csrf"];
					widget.setValue("csrfToken", csrfArr["value"]);
				},
				onFailure: function(error) {
					widget.body.innerHTML += "<p>Something Went Wrong- "+error+"</p>";
					widget.body.innerHTML += "<p>" + JSON.stringify(error) + "</p>";
				}
			});
	},
	//Added for NNBPLM-18735 - START
	setSecurityContext: function() {
		// Web Service call to get the security context for the login person
		let urlWAF = widget.getValue("urlBASE")+"/resources/modeler/pno/person/?current=true&select=preferredcredentials&select=collabspaces";
		let dataWAF = {
		};
		let headerWAF = {
		};
		let methodWAF = "GET";
		let dataResp=WAFData.authenticatedRequest(urlWAF, {
			method: methodWAF,
			headers: headerWAF,
			data: dataWAF,
			type: "json",
			async : false,
			onComplete: function(dataResp) {
				comWidget.credentialDataParser(dataResp);
			},
			onFailure: function(error) {
				widget.body.innerHTML += "<p>Something Went Wrong- "+error+"</p>";
				widget.body.innerHTML += "<p>" + JSON.stringify(error) + "</p>";
			}
		});
	},
	credentialDataParser:function(e){
		var t,i,n;

		this.optionsList=[],this.defaultCollabSpace=null;

		var o=e.preferredcredentials;

		if(o.collabspace&&o.role&&o.organization){
			var r=o.collabspace,s=o.role,a=o.organization,t=r.name,i=s.name,n=a.name;
			this.defaultCollabSpace=i+"."+n+"."+t;
		}
		var l=e.collabspaces;
		if(l&&l.length>0){
			for(var c=!1,d=void 0,u=0;u<l.length;u++){
				for(var p=(f=l[u]).couples||[],g=0;g<p.length;g++){
					var m=p[g];
					if(void 0===d&&(d=m.organization.name),d!==m.organization.name){
						c=!0;
						break
					}
				}
				if(c)
				break
			}
			for(u=0;u<l.length;u++){
				var f,h=(f=l[u]).name,v=f.title;
				for(p=f.couples,g=0;g<p.length;g++){
					var C=p[g],b=C.organization,y=C.role,_=b.name,S=b.title,D=y.name,w=y.nls;
					var I=D+"."+_+"."+h;
					var A=c?v+" ● "+S+" ● "+w:v+" ● "+w;	
					this.optionsList.push({label:A,value:I})
				}
			}
		}
		 
		 widget.addPreference({
			name: "SecurityContext",
			type: "list",
			label: "SecurityContext",
			defaultValue: this.defaultCollabSpace,
			options:this.optionsList
		});
	},
	//Added for NNBPLM-18735 - END
	getObjectsDetail: function(objIds) 
	{
		var headerWAF = {
			ENO_CSRF_TOKEN: widget.getValue("csrfToken"),
			//ENO_CSRF_TOKEN: "",
			SecurityContext: widget.getValue("SecurityContext"),
			Accept: "application/json",
			'Content-Type': 'application/json'
		};
		var methodWAF = "POST";
		var urlObjWAF;
		// Web Service for getting Test Case Object Detail
		if(actualType=="VV_Test_Case")
		{
			urlObjWAF = widget.getValue("urlBASE")+"resources/vrp/many/testcases";
		}
		var dataRespTC;
		let dataResp=WAFData.authenticatedRequest(urlObjWAF, {
			method: methodWAF,
			headers: headerWAF,
			data: '['+objIds+']',
			type: "json",
			async : false,
			onComplete: function(dataResp) {
				dataRespTC=dataResp;
				//console.log("getObjectDetail return >> ");
				//console.log(dataResp);
				//console.log(dataRespTC);
						
			},
			onFailure: function(error, backendresponse, response_hdrs) {
				alert(backendresponse.message);
				//console.log(backendresponse);
				//console.log(response_hdrs);
				widget.body.innerHTML += "<p>Something Went Wrong"+error+"</p>";
			}
		})
		return dataRespTC;
	},
	objectDropped: function(items) {
		let itemslength = items.length;
		
		//Creating the header for the table
		headerRow = document.createElement("tr");
		headerCol1 = document.createElement("th");
		headerCol1.setAttribute("scope", "col");
		headerCol1.innerText = "Test Cases";
		headerCol2 = document.createElement("th");
		headerCol2.setAttribute("scope", "col");
		headerRow.appendChild(headerCol1);
		headerRow.appendChild(headerCol2);
		
		
		//adding the test cases selected
		for(var i=0; i<itemslength; i++ ) {
			let tctitle = items[i].title;
			//console.log(tctitle);
			
			var rowelem = document.createElement("tr");
			
			let itemcol = document.createElement("td");
			itemcol.innerHTML = tctitle;
			let idInput = document.createElement('input');
			idInput.type = "hidden";
			idInput.className = "objectid";
			idInput.value = items[i].id;
			
			itemcol.appendChild(idInput);
			
			let delcolum = document.createElement("td");
			let dltInput = document.createElement('i');
			dltInput.title="Delete"
			//dltInput.type = "button";
			//dltInput.value = "X";
			dltInput.className="delete WUXIcon wux-ui-3ds wux-ui-3ds-trash WUXIcon-sizeSM";
			dltInput.addEventListener('click', function () {
				let i = this.parentNode.parentNode.rowIndex;
				//console.log(this.parentNode.parentNode);
				//console.log("index ::: "+i);
				let table = this.parentNode.parentNode.parentNode;
				//console.log("Elem::: "+this.parentNode.parentNode.parentNode);
				table.deleteRow(i-1);
			})
			delcolum.appendChild(dltInput);
			
			rowelem.appendChild(itemcol);
			rowelem.appendChild(delcolum);
			
			tbody.appendChild(rowelem);
	
		}
	
	},
	createCI: function(objJson) 
	{
		//let bSuccess=false;
		urlWAF = widget.getValue("urlBASE")+"resources/CreateCIWidgetServices/process";

		
		// We make a custom REST web service call for creating the CI
		
		let headerWAF = {
			ENO_CSRF_TOKEN: widget.getValue("csrfToken"),
			SecurityContext: widget.getValue("SecurityContext"),
			Accept: "application/json",
			"Content-Type": "application/json"
		};
		let methodWAF = "POST";
		let dataResp=WAFData.authenticatedRequest(urlWAF, {
			method: methodWAF,
			headers: headerWAF,
			data: JSON.stringify(objJson),
			type: "json",
			async : true, //Modified for NNBPLM-22115
			onComplete: function(dataResp) {
				bSuccess = true;
				//console.log("dataResp>>>");
				//console.log(dataResp);
				//console.log(dataResp.data);
				comWidget.hideLoader(); //Added for NNBPLM-22115
				alert(dataResp.data);

			},
			onFailure: function(error) {
				comWidget.hideLoader(); //Added for NNBPLM-22115
					//widget.body.innerHTML += "<p>Something Went Wrong- "+error+"</p>";
					//widget.body.innerHTML += "<p>" + JSON.stringify(error) + "</p>";
					console.log("error: "+error);
			}
			
		});
		//return bSuccess;
	},
	/*Added for NNBPLM-22115 Start*/
	showLoader: function() 
	{
		let idSaveButton = document.getElementById("submit");
		idSaveButton.disabled = true;
		idSaveButton.classList.add("disable");
		let idLoaderDiv = document.getElementById("loader");
		idLoaderDiv.style="display: block !important;";
		
	},
	hideLoader: function() 
	{
		let idSaveButton = document.getElementById("submit");
		idSaveButton.disabled = false;
		idSaveButton.classList.remove("disable");
		let idLoaderDiv = document.getElementById("loader");
		idLoaderDiv.style="display: none !important;";
	},
	/*Added for NNBPLM-22115 End*/
	
};
// Add the events for the widget
widget.addEvent('onLoad',comWidget.onLoad);
widget.addEvent("onRefresh", comWidget.onLoad);
});