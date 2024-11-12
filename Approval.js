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
	var approvObj
	var approvType
	var divLoader;//Added for NNBPLM-22115
	
var comWidget={
    widgetDataSelected: {},
	onLoad: function() {
			widgetTitle = widget.getValue("Title");
			widget.setTitle(widgetTitle);
			
			allowdType 	= widget.getValue("Type");
			allowdTypes	= allowdType.split("#");
			actualType 	= allowdTypes[0];
			dispType	= allowdTypes[1];
			
			approvObj 	= widget.getValue("Approval Object Name");
			approvType 	= widget.getValue("Approval Process Type");
			
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
			DataDragAndDrop.droppable( theDropElt , { 
				drop : function(data) {	
					
					const objs = JSON.parse(data);
					let objList = objs.data.items;
					let objsLength = objList.length;
					let objCount;
					let objType;
					let datajson = {};	
					let datajson1 = {};	
					let itemsjson = [];
					let returnitems = [];
					let returndata = {};
					let objJSON = {};
					let stat;
					let respdata;
					let datarsp;
          //Added for NNBPLM-24476 - START
					let objIds 		= [];
          //Added for NNBPLM-24476 - END
					//Added for NNBPLM-20191 - START
					if("Commissioning Instruction"==approvObj && "Endorse"==approvType) {
						if(objsLength > 1) {
							alert("Multiple CIs cannot be drag and dropped for Endorsement");
							return;
						}
					}
					//Added for NNBPLM-20191 - END
					//Added  for NNBPLM-24476 - START
					if("Commissioning Instruction"==approvObj && "Approve"==approvType) {
						if(objsLength > 1) {
							alert("Multiple CIs cannot be drag and dropped for Approval");
							return;
						}
					}
					//Added for NNBPLM-24476 - END
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
							objJSON = {"objectid":objList[objCount].objectId};
							//Added  for NNBPLM-24476 - START
							objIds.push("\""+objList[objCount].objectId+"\"");
							//Added  for NNBPLM-24476 - END
							itemsjson.push(objJSON);
						}
					}
					//Added  for NNBPLM-24476 - START
					var dataResp = comWidget.getObjectsDetail(objIds);
					let sAtt = comWidget.objectDropped(dataResp);
					//Added  for NNBPLM-24476 - END
					datajson={"mode":"check","items":itemsjson,"object type":approvObj}
					datarsp=comWidget.checkCI(datajson);
					
					stat = datarsp.status;
					
					if(stat === "Failure") {
						alert(datarsp.data);
					} else {
						datajson1 = {"mode":"precheck","items":itemsjson,"object type":approvObj,"approvaltype":approvType}
						respdata = comWidget.callwebservice(datajson1);
						returndata = respdata.data;
						returnitems = returndata.items;
						//Added for NNBPLM-20191 -- START
						let elemTr = document.getElementsByTagName("tr");
						//alert(elemTr);
						//alert(elemTr.length);
						if("Commissioning Instruction"==approvObj && "Endorse"==approvType) {
							if(elemTr.length>1) {
								alert("Multiple CIs cannot be drag and dropped for Endorsement");
								return;
							}
						}
						//Added for NNBPLM-20191 -- END
						//Added  for NNBPLM-24476 - START
						if("Commissioning Instruction"==approvObj && "Approve"==approvType) {
							//Modified  for NNBPLM-25410 - START
							if(elemTr.length > 1) {
							//Modified  for NNBPLM-25410 - START
								alert("Multiple CIs cannot be drag and dropped for Approval");
								return;
							}
						}
						//Added for NNBPLM-24476 - END
						
						//Modified for NNBPLM-24476 Added approvType and sAtt arguments
 						comWidget.createview(returnitems,approvType,sAtt)
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
						//btnSubmit.className="createci";
						btnSubmit.id="submit";
						btnSubmit.addEventListener('click', function (){
						let datajson = {};	
						let itemsjson = [];
						let objJSON = {};
						let datarsp = {};
						let bflag = false;
            //Added for NNBPLM-24477 : start
						let sTaskMsg = "";
						let bCITaskflag = false;
            //Added for NNBPLM-24477 : end
						let Allrows = document.getElementById("tableBody").rows;
						let rowlength = Allrows.length;
						//Added for NNBPLM-24476 - START
						let rowsAllCell;
						let rowsAllCellLen;
						let cellCount;
						let cellAtt;
						let objAttrVal=[];			
						let editableElements;	
						let eElmCount;
						let eElmLen;
						let bSuccess = true;
						let customAttr=[];
						let attDetail={};
						let objJson={};
						let objArrJson=[];
						let objId;
						let attTempDis;
						let mapAtts = new Map();
						//Added for NNBPLM-24476 - END
						//console.log("rowlength:: "+rowlength);
						for(var icount=0; icount<rowlength; icount++) {
							let statusvalue = Allrows[icount].getElementsByClassName("statusflag")[0].value;
							//Added for NNBPLM-24476 - START
							//Modified for NNBPLM-25391 - START
							if("Commissioning Instruction"==approvObj && "Approve"==approvType) {
							//Modified for NNBPLM-25391 - START
								objId 				= Allrows[icount].getElementsByClassName("objectid")[0].value;
								rowsAllCell			= Allrows[icount].getElementsByClassName("EditableCell");
								rowsAllCellLen		= rowsAllCell.length;
								mapAtts = new Map();
								cellLevel:for(cellCount = 0;cellCount < rowsAllCellLen; cellCount++)
								{
								editableElements 	= rowsAllCell[cellCount].getElementsByClassName("Attribute");
								eElmLen				= rowsAllCell[cellCount].getElementsByClassName("Attribute").length;
								customAttr=[];
								cellAtt				= rowsAllCell[cellCount].getAttribute("attribute");
								let attTempVal;
								for (eElmCount = 0;eElmCount < eElmLen; eElmCount++) 
									{
										objAttrVal=[];
										objAttr = editableElements[eElmCount].getAttribute("attribute");
										if(objAttr=="EDF_WorkOrderNeeded"){
											attTempVal=editableElements[eElmCount].checked;
											//bWOR = attTempVal;
											if(attTempVal){
												attTempVal = false;
											} 
											else {
												attTempVal = true;
											}
										}
										else if(objAttr=="EDF_WorkItemNumber"){
											attTempVal=editableElements[eElmCount].value;
											attTempDis=editableElements[eElmCount].disabled;
											if(!attTempDis){
												if(attTempVal == "" || attTempVal == null ){
													alert("Please enter the Work Item Number.");
													editableElements[eElmCount].focus();
													bSuccess = false;
												}
											}
										}
										else{
											attTempVal=editableElements[eElmCount].value;
										}
										mapAtts.set(objAttr,attTempVal);
									}	
								}
								for (let [key, value] of mapAtts) {
									attDetail = {"name":key,"values":value};
									customAttr.push(attDetail);
								}
							}
							//Added for NNBPLM-24476 - END
							//Added for NNBPLM-21175 Start
							let statusMessage = Allrows[icount].getElementsByClassName("message")[0].value; //Added for US NNBPLM-21175
							//Added for NNBPLM-21175 End
            
							if("Success"==statusvalue) {
								let objectid = Allrows[icount].getElementsByClassName("objectid")[0].value
								
								objJSON = {"objectid":objectid}
								itemsjson.push(objJSON);
							} else if("Warning"==statusvalue) {
								if(statusMessage.contains("Open CCPs")) //Added for US NNBPLM-21175
									bflag = true;
									//Added for NNBPLM-24477 --Start
								if(statusMessage.startsWith("Task status from EAM")){
									bCITaskflag = true;
									sTaskMsg = statusMessage;
								}
								   //Added for NNBPLM-24477 --end
								let objectid = Allrows[icount].getElementsByClassName("objectid")[0].value
								
								objJSON = {"objectid":objectid}
								itemsjson.push(objJSON);
							}
							
						}
						
						if(itemsjson.length != 0 && bSuccess==true) {
							comWidget.showLoader(); //Added for NNBPLM-22115
              							//Modified for NNBPLM-24476 - Start # Added customAttributes key
                            datajson = {"mode":"postprocess", "items":itemsjson,"object type":approvObj,"approvaltype":approvType,"customAttributes":customAttr};
							//Modified for NNBPLM-24476 - End
						//	console.log("datajson:: "+JSON.stringify(datajson));
							if(bflag) {
								var resp = confirm("There are CCPs in Hold Active associated with some of the CIs. Click on OK to Override the CCPs and continue with the Endorsement.");
								
								if(resp==true){
									comWidget.callPostProcessWebservice(datajson); //Modified for NNBPLM-22115
								}
								//Added for NNBPLM-24477 --Start
							}else if(bCITaskflag) {
								let taskWarning = "";
								if(sTaskMsg.contains("Task status is not")){
									taskWarning = "Task status is not in 'Working' state, Do you still want to continue?";
								}else{
									taskWarning = sTaskMsg+" , Do you still want to continue?";
								}
								var resp1 = confirm(taskWarning);
								
								if(resp1==true){
									comWidget.callPostProcessWebservice(datajson); //Modified for NNBPLM-22115
								}
								//Added for NNBPLM-24477 --end
							}else {
								comWidget.callPostProcessWebservice(datajson); //Modified for NNBPLM-22115
							}
						}
						});
						let paraelem = document.createElement("p");
						paraelem.id="paratext";
						if("Commissioning Instruction"==approvObj) {
							if("Endorse"==approvType) {
								paraelem.innerHTML = "Select "+approvType+" to send the Commissioning Instruction to Apriso."
								btnSubmit.value = approvType;
							} else if("Approve"==approvType) {
								paraelem.innerHTML = "Select "+approvType+" to move the Commissioning Instruction to Approved maturity state."
								btnSubmit.value = approvType;
							} else if("Complete"==approvType) {
								paraelem.innerHTML = "Select "+approvType+" to move the Commissioning Instruction to Completed maturity state."
								btnSubmit.value = approvType;
							} else if("Verify"==approvType) {
								paraelem.innerHTML = "Select "+approvType+" to move the Commissioning Instruction to Verified maturity state."
								btnSubmit.value = approvType;
							}
						} else if("Commissioning Procedure"==approvObj) {
							if("Accept"==approvType) {
								paraelem.innerHTML = "Select "+approvType+" to move the Commissioning Procedure to Accepted maturity state."
								btnSubmit.value = approvType;
							} else if("Graded"==approvType) {
								paraelem.innerHTML = "Select "+approvType+" to move the Commissioning Procedure to Graded maturity state."
								btnSubmit.value = approvType;
							} else if("Approve"==approvType) {
								paraelem.innerHTML = "Select "+approvType+" to move the Commissioning Procedure to Approved maturity state."
								btnSubmit.value = approvType;
							} else if("Complete"==approvType) {
								paraelem.innerHTML = "Select "+approvType+" to move the Commissioning Procedure to Completed maturity state."
								btnSubmit.value = approvType;
							}
						} else if("Test Execution"==approvObj) {
							if("Acceptance"==approvType) {
								paraelem.innerHTML = "Select "+approvType+"  to move the Test Execution to Acceptance bookmark folder."
								btnSubmit.value = approvType;
							} else if("Accept"==approvType) {
								paraelem.innerHTML = "Select "+approvType+" to move the Test Execution to Accept bookmark folder."
								btnSubmit.value = approvType;
							} else if("Reject"==approvType) {
								paraelem.innerHTML = "Select "+approvType+" to move the Test Execution to Reject bookmark folder."
								btnSubmit.value = approvType;
							} else if("Additional Verification"==approvType) {
								paraelem.innerHTML = "Select "+approvType+" to move the Test Execution to Additional Verification bookmark folder."
								btnSubmit.value = approvType;
							}
						}
						let paratextelem = document.getElementById("paratext");
						if(typeof(paratextelem) == 'undefined' || paratextelem == null){
						//widget.body.appendChild(btnSave);
							mainDiv.append(paraelem);
						} 
						mainDiv.appendChild(document.createElement("br"));
						let submitelem =  document.getElementById("submit");
						if(typeof(submitelem) == 'undefined' || submitelem == null){
						//widget.body.appendChild(btnSave);
							mainDiv.appendChild(btnSubmit);
						} 
						
					
					}
					//console.log("objIds");
				}
			});
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
		// Web Service for getting Test Specification & Case Object Detail
		if(actualType=="VV_Test_Case")
		{
			urlObjWAF = widget.getValue("urlBASE")+"resources/vrp/many/testcases";
		}
		else if(actualType=="VV_Test_Specification")
		{
			urlObjWAF = widget.getValue("urlBASE")+"resources/vrp/many/testspecifications";
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
				
				
				//comWidget.objectDropped(dataResp);
				//var attributes = JSON.parse(JSON.stringify(dataResp.customAttributes));							
			},
			onFailure: function(error, backendresponse, response_hdrs) {
				alert(backendresponse.message);
				console.log(backendresponse);
				console.log(response_hdrs);
				widget.body.innerHTML += "<p>Something Went Wrong"+error+"</p>";
			}
		})
		return dataRespTC;
	},
	
	objectDropped: function(items) {
		
		var itemsLength=items.length;
		var attrCount;
		var attrName;
		var attrVal=[];
		let itemCount;
		let objAttValCount;
		let objAttValLen;
		//var object = {};
		let mapAtts = new Map();
		
		applyRow = document.createElement('tr');
		applyRow.id = "ApplyRow";
		headerRow = document.createElement('tr');
		for (itemCount = 0; itemCount < itemsLength; itemCount++) 
		{
			
			let selectedTitle=items[itemCount].title;
			let selectedObjId=items[itemCount].id;
			let selectedObjType=items[itemCount].type;
			let attributes = items[itemCount].customAttributes;
			let attrLength = attributes.length;
			for (attrCount = 0; attrCount < attrLength; attrCount++) 
			{
				attrVal=[];
				attrName = attributes[attrCount].name;
				
				objAttValLen = attributes[attrCount].values.length;
				for(objAttValCount=0;objAttValCount<objAttValLen;objAttValCount++)
				{
					attrVal.push(attributes[attrCount].values[objAttValCount]);
				}
				
				mapAtts.set(attrName,attrVal);
			}
			mapAtts.set("Type",selectedObjType);
			mapAtts.set("Name",selectedTitle);
			mapAtts.set("Id",selectedObjId);
			
			//comWidget.createRowData(mapAtts,itemCount);
		}
		return mapAtts;
	},
	//Added for NNBPLM-24476 - END
	
	
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
	checkCI: function(objJson) 
	{
		let returnresp;
		urlWAF = widget.getValue("urlBASE")+"/resources/ApprovalWebServices/process";

		
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
			async : false,
			onComplete: function(dataResp) {
				bSuccess = true;
			
				returnresp = dataResp;

			},
			onFailure: function(error) {
					
					console.log("error: "+error);
			}
			
		});
		return returnresp;
	},
	callwebservice: function(objJson) 
	{
		let returnresp;
		urlWAF = widget.getValue("urlBASE")+"/resources/ApprovalWebServices/process";

		
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
			async : false,
			onComplete: function(dataResp) {
				bSuccess = true;
				returnresp = dataResp;

			},
			onFailure: function(error) {
					//widget.body.innerHTML += "<p>Something Went Wrong- "+error+"</p>";
					//widget.body.innerHTML += "<p>" + JSON.stringify(error) + "</p>";
					console.log("error: "+error);
			}
			
		});
		return returnresp;
	},
	createview: function(items,state,objectData) {
		let itemslength = items.length;
		
		//Creating the header for the table
		headerRow = document.createElement("tr");
		headerCol1 = document.createElement("th");
		headerCol1.setAttribute("scope", "col");
		headerCol1.innerText = "Name";
		headerCol2 = document.createElement("th");
		headerCol2.setAttribute("scope", "col");
		headerCol2.innerText = "Status";
		headerCol3 = document.createElement("th");
		headerCol3.setAttribute("scope", "col");
		headerCol3.innerText = "Message";
    //Modified for NNBPLM-24476 - START
		headerCol5 = document.createElement("th");
		headerCol5.setAttribute("scope", "col");
    //Modified for NNBPLM-24476 - END
		headerRow.appendChild(headerCol1);
		headerRow.appendChild(headerCol2);
		headerRow.appendChild(headerCol3);
		//Added for NNBPLM-24476 - START
		//Modified for NNBPLM-25391 - START
		if("Commissioning Instruction"==approvObj && "Approve" == state) {
		//Modified for NNBPLM-25391 - END
			headerCol4 = document.createElement("th");
			headerCol4.setAttribute("scope", "col");
			headerCol4.innerText = "WO and Task"
			headerRow.appendChild(headerCol4);
		}
		//Added for NNBPLM-24476 - END
		headerRow.appendChild(headerCol5);
		//adding the test cases selected
		
		for(var i=0;i<itemslength;i++) {
			let resultstatus = items[i].status;
			let message = items[i].Message;
			let title = items[i].title;
			var rowelem = document.createElement("tr");
			
			let itemcol1 = document.createElement("td");
			itemcol1.innerHTML = title;
			let idInput1 = document.createElement('input');
			idInput1.type = "hidden";
			idInput1.className = "objectid";
			idInput1.value = items[i].objectId;
			itemcol1.append(idInput1);
			
			let itemcol2 = document.createElement("td");
			let divcircle1 = document.createElement("div");
			 if(resultstatus=="Success") {
				 divcircle1.className = "successflag";
			 } else {
				  divcircle1.className = "failureflag";
			 }
			//itemcol2.innerHTML = resultstatus;
			let idInput2 = document.createElement('input');
			idInput2.type = "hidden";
			idInput2.value = items[i].status;
			idInput2.className = "statusflag";
			itemcol2.append(divcircle1);
			itemcol2.append(idInput2);
			
			let itemcol3 = document.createElement("td");
			itemcol3.innerHTML = message;
			let idInput3 = document.createElement('input');
			idInput3.type = "hidden";
			idInput3.value = message; //Modified for US NNBPLM-21175
			idInput3.className = "message";
			itemcol3.append(idInput3);
			
		//Added for NNBPLM-24476 - START
			let icell1 = document.createElement('td');
			//Modified for NNBPLM-25391 - START
			if("Commissioning Instruction"==approvObj && "Approve" == state) {
			//Modified for NNBPLM-25391 - END
		icell1.className="EditableCell";
		icell1.setAttribute("scope", "col");
		let wondAttrName = "EDF_WorkOrderNeeded";
		let wonAttrName = "EDF_WorkOrderNumber";
		let wotnAttrName = "EDF_WorkOrderTaskNumber";
		let AttrVal = objectData.get(wondAttrName);
		let sWOTNAttrVal = objectData.get(wotnAttrName);
		//Main div
		let itemdiv = document.createElement('div');
		itemdiv.id="resp-table";
		
		//Workorder Needed
		itemInput = document.createElement('input');
		itemInput.type = "checkbox";
		itemInput.className="Editable Attribute";
		if(sWOTNAttrVal != ""){
			itemInput.disabled = true;
		}
		if(AttrVal == "FALSE"){
			itemInput.checked = true;	
		} else {
			itemInput.checked = false;
		}
		itemInput.value = AttrVal;
		itemInput.id = "won";
		itemInput.style.border="1px solid";
		itemInput.setAttribute("attribute", wondAttrName);
		itemInput.addEventListener('change', function () {
				
				var editableElements = document.getElementsByClassName("Editable Attribute");
				var len = editableElements.length;
				for (var i = 0;i < len; i++) {
					if(editableElements[0].checked){
						if(i > 0 ){
						editableElements[i].disabled = true;
						editableElements[i].value = "";
						//generateBtn[0].disabled = true;
						editableElements[i].style.border="1px solid";
						}
					} 
					else {
						if(editableElements[i].id != "wotn"){
							editableElements[i].disabled = false;
							//generateBtn[0].disabled = false;
						}
					}
				}
			})
		const bdiv = document.createElement("div");
		bdiv.id = "resp-table-body";
		
		const rdiv = document.createElement("div");
		rdiv.className = "resp-table-row";
		
		const dWONR = document.createElement("div");
		dWONR.id = "div_title" ;
		dWONR.className = "table-body-cell";
		dWONR.innerHTML = "Work Order Not Required";
		//div.style = "background-color: lightblue;";
		
		const dWONRD = document.createElement("div");
		dWONRD.id = "div_won_title" ;
		dWONRD.className = "table-body-cell";
		dWONRD.appendChild(itemInput);
		
		
		rdiv.appendChild(dWONR);
		rdiv.appendChild(dWONRD);
		bdiv.appendChild(rdiv);
		itemdiv.appendChild(bdiv);
		
		//Item Number
		const inDivR = document.createElement("div");
		inDivR.className = "resp-table-row";
		
		const inDivT = document.createElement("div");
		inDivT.id = "div_title" ;
		inDivT.innerHTML = "Work Item Number" ;
		inDivT.className = "table-body-cell";
		
		var ddInput = document.createElement("input");
		ddInput.type = "text";
		ddInput.id = "wtn";
		//ddInput.style.border = "solid #000000";
		
		let wtnAttrVal = objectData.get("EDF_WorkItemNumber");
		
		if( wtnAttrVal == "undefined" || wtnAttrVal == null){
				ddInput.value = "";
		}
		else {
			ddInput.value = wtnAttrVal;
		}
		//ddInput.disabled = readOnly;
		if( sWOTNAttrVal != "" || AttrVal == "FALSE"){
			ddInput.disabled = true;
		} 
		else {
			ddInput.disabled = false;
		}
		ddInput.style.border="1px solid";
		ddInput.className="Editable Attribute";
		ddInput.setAttribute("attribute", "EDF_WorkItemNumber");
		const inDivD = document.createElement("div");
		inDivD.id = "div_tn_d" ;
		inDivD.className = "table-body-cell";
		inDivD.appendChild(ddInput);
		inDivR.appendChild(inDivT);
		inDivR.appendChild(inDivD);
		bdiv.appendChild(inDivR);
		
		//WorkOrder Number
		const wnoDivR = document.createElement("div");
		wnoDivR.className = "resp-table-row";
		
		const wnoDivT = document.createElement("div");
		wnoDivT.id = "div_title" ;
		wnoDivT.innerHTML = "Work Order Number" ;
		wnoDivT.className = "table-body-cell";
		
		itemInput = document.createElement('input');
		itemInput.type = "text";
		
		itemInput.id = "wno";
		let wnoAttrVal = objectData.get(wonAttrName);
		
		if( sWOTNAttrVal != "" || AttrVal == "FALSE"){
			itemInput.disabled = true;
		}
		else {
			itemInput.disabled = false;
		}
		//itemInput.disabled = readOnly;
		itemInput.value = wnoAttrVal;
		itemInput.style.border="1px solid";
		itemInput.className="Editable Attribute";
		itemInput.setAttribute("attribute", wonAttrName);
		
		const wnoDivD = document.createElement("div");
		wnoDivD.id = "div_wno_d" ;
		wnoDivD.className = "table-body-cell";
		wnoDivD.appendChild(itemInput);
		wnoDivR.appendChild(wnoDivT);
		wnoDivR.appendChild(wnoDivD);
		bdiv.appendChild(wnoDivR);
		
		//Task Number
		const tnDivR = document.createElement("div");
		tnDivR.className = "resp-table-row";
		
		const tnDivT = document.createElement("div");
		tnDivT.id = "div_title" ;
		tnDivT.innerHTML = "Task Number" ;
		tnDivT.className = "table-body-cell";
		
		itemInput = document.createElement('input');
		itemInput.type = "text";
		let wotnAttrVal = objectData.get(wotnAttrName);
		itemInput.value = wotnAttrVal;
		itemInput.id = "wotn";
		itemInput.disabled = readOnly;
		itemInput.style.border="1px solid";
		itemInput.className="Editable Attribute";
		itemInput.setAttribute("attribute", wotnAttrName);
		
		
		const tnDivD = document.createElement("div");
		tnDivD.id = "div_wno_d" ;
		tnDivD.className = "table-body-cell";
		tnDivD.appendChild(itemInput);
		tnDivR.appendChild(tnDivT);
		tnDivR.appendChild(tnDivD);
		bdiv.appendChild(tnDivR);
		
		
		
		icell1.appendChild(itemdiv);
		icell1.setAttribute("scope", "col");
		//itemRow.appendChild(icell1);
		//itemcol4.appendChild(inDivD);
			}
		//Added for NNBPLM-24476 - END
			let delcolum = document.createElement("td");
			let dltInput = document.createElement('i');
			//dltInput.type = "button";
			dltInput.title = "Delete";
			dltInput.className="delete WUXIcon wux-ui-3ds wux-ui-3ds-trash WUXIcon-sizeSM";
			dltInput.addEventListener('click', function () {
				let i = this.parentNode.parentNode.rowIndex;
				
				let table = this.parentNode.parentNode.parentNode;
				table.deleteRow(i-1);
			})
			delcolum.appendChild(dltInput);
			
			rowelem.appendChild(itemcol1);
			rowelem.appendChild(itemcol2);
			rowelem.appendChild(itemcol3);
			//Added for NNBPLM-24476 - START
			//Modified for NNBPLM-25391 - START
			if("Commissioning Instruction"==approvObj && "Approve" == state) {
			//Modified for NNBPLM-25391 - END
				rowelem.appendChild(icell1);
			}
			//Added for NNBPLM-24476 - END
			rowelem.appendChild(delcolum);
			
			tbody.appendChild(rowelem);
		}

	
	},
	/*Added for NNBPLM-22115 Start*/
	callPostProcessWebservice: function(objJson) 
	{
		urlWAF = widget.getValue("urlBASE")+"/resources/ApprovalWebServices/process";
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
			async : true,
			onComplete: function(dataResp) {
				comWidget.hideLoader();
				alert(dataResp.data);
				//Added for NNBPLM-24476 - START
				let sWOVal = dataResp.WO;
				//let sWOVal = "WORK NO";
				let sTaskVal = dataResp.TASK;
				//let sTaskVal = "TASK NUMBER";
				if(sTaskVal == 'undefined' || sTaskVal == "" || sTaskVal == null){
					//bSuccess = true;
					//alert("Work Order is :"+sWOVal+" WO Task Number :"+sTaskVal); //Added for NNBPLM-22115
				} else {
					let fWO = document.getElementById("wno");
					let fWOTN = document.getElementById("wotn");
					fWO.value =  sWOVal;
					fWOTN.value = sTaskVal;
					
				}
				//Added for NNBPLM-24476 - END
				
			},
			onFailure: function(error) {
				comWidget.hideLoader();
				console.log("error: "+error);
			}
			
		});
	},
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
	}
	/*Added for NNBPLM-22115 End*/
};
// Add the events for the widget
widget.addEvent('onLoad',comWidget.onLoad);
widget.addEvent("onRefresh", comWidget.onLoad);
});
