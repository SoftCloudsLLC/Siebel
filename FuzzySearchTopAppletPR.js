if (typeof(SiebelAppFacade.FuzzySearchTopAppletPR) === "undefined") {

 SiebelJS.Namespace("SiebelAppFacade.FuzzySearchTopAppletPR");
 define("siebel/custom/FuzzySearchTopAppletPR", ["siebel/phyrenderer"],
  function () {	  
   SiebelAppFacade.FuzzySearchTopAppletPR = (function () {
	
	var SiebelConstant = SiebelJS.Dependency("SiebelApp.Constants");
	
	/*
	*
	*
	*
	*/
	var appletField = {
						Contact:{viewName:"FS Contact Search Result View",appletName:"Fuzzy Search Contact List Applet",field:"Last Name"},
						Account:{viewName:"FS Account Search Result View",appletName:"Fuzzy Search Account List Applet",field:"Name"},
						Opportunity:{viewName:"FS Opportunity Search Result View",appletName:"Fuzzy Search Opportunity List Applet",field:"Opportunity Name"},
						Unknown:{viewName:"Fuzzy Search View",appletName:"N/A",field:"N/A"},
						};
	var qS = '';
	var intentType,searchSpec,entity,service,inPropSet,urltoHit,ai,xml,xmlDoc,$xml,reqStatus,saveResultHtml,xmlResp,resp_query,resp_query_s,spellCheckFlg,aI,resultappletId,
	doSpellCheckFlg = 'Y',noSpellCheckFlg = 'N',sCF,sCv,doQuery,noI,noIHTML;
	var loggedName = "";
	

    
	function FuzzySearchTopAppletPR(pm) {
     SiebelAppFacade.FuzzySearchTopAppletPR.superclass.constructor.apply(this, arguments);
    }

    SiebelJS.Extend(FuzzySearchTopAppletPR, SiebelAppFacade.PhysicalRenderer);

    FuzzySearchTopAppletPR.prototype.Init = function () {
     SiebelAppFacade.FuzzySearchTopAppletPR.superclass.Init.apply(this, arguments);
    }

    FuzzySearchTopAppletPR.prototype.ShowUI = function () {
     SiebelAppFacade.FuzzySearchTopAppletPR.superclass.ShowUI.apply(this, arguments);


		var recordSet=  this.GetPM().Get("GetRawRecordSet");
		for (var controlName in recordSet) {
			if (recordSet.hasOwnProperty(controlName)) 
			{
				var control = recordSet[controlName];
				loggedName = control['Login User'];
			}
		}

		/***HTML for the search box***/
		$('.alert.alert-success').remove();
		aI = SiebelApp.S_App.GetActiveView();
		if(aI.GetViewSummary()== 'FS Intent Unknown Dummy View')
		{
			$('#s_vctrl_div_tabScreen').hide();
		}
		
		var html ='<form class="form-wrapper cf"><input type="text" name="fuzzy_search_text_box" class="fuzzy_search_input" placeholder="Search here..." required><button type="submit" class="trigger_search">Search</button></form>';
		
				
		/***HTML for the search box***/
		$("#s_" + this.GetPM().Get("GetFullId") + "_div").html(html);
		
		if($('.resultHolder').length)
		{
			if($('#spellCheckFlg').length){
				if($('#spellCheckFlg').val().trim() == "Y")
				{
					var dymhtml = '<div class="spellcheck">';
					dymhtml += '<div class="did-you-mean" style="float:left;font-size: 16px;font-weight:700;padding-right: 9px;">Did you mean:</div>';
					dymhtml += '<div class="spelling-corrected" style="font-size: 16px;font-weight:700;color:blue;"><a style="color:blue;" href="javascript:void(0);" id="do-search-after-sc">'+$('#resp_query').val()+'</a></div></div>';
					$('form.form-wrapper.cf').after(dymhtml);
				}
			}
			
			if($('#numberofIntents').length) {
				if($('#numberofIntents').val().trim() > 1)
				{
					var totalIntents = $('#numberofIntents').val();
					//what is the current entity shown
					
					var curEnPgNumber,curEntity;
					$('.resultHolder').children('span.SSpec').each(function (){
						var SEntity = appletField[$(this).attr("id")];

						if (SEntity.viewName == aI.GetViewSummary())
						{
							curEntity = $(this).attr("id"); //currently displayed entity
							curEnPgNumber = $(this).attr("data-index");
							
						}
					});

					//construct the entity paging links
					var nextIntentLink = "";
					if(totalIntents > 1)
					{
						var style = 'style="float:left;font-size: 16px;font-weight:700;padding-right: 9px;"';
						if(curEnPgNumber == 1)
						{
							nextIntentLink = '<a href="javascript:void(0);" '+style+' class="pgrEntity" id="next" data-name="'+curEnPgNumber+'">Next Result</a>';
						}
						if ((curEnPgNumber > 1) && (curEnPgNumber < totalIntents))
						{
							//display prev and next
							nextIntentLink = '<a href="javascript:void(0);" '+style+' class="pgrEntity" id="prev" data-name="'+curEnPgNumber+'">Prev Result</a>&nbsp';
							nextIntentLink +='<a href="javascript:void(0);" '+style+' class="pgrEntity" id="next" data-name="'+curEnPgNumber+'">Next Result</a>';
						}
						if(curEnPgNumber == totalIntents)
						{
							//display only prev
							nextIntentLink = '<a href="javascript:void(0);"  '+style+' class="pgrEntity" id="prev" data-name="'+curEnPgNumber+'">Prev Result</a>';
						}
					}
					
						
						if($(".spellcheck").length > 0) {
							$(".spellcheck").after(nextIntentLink)
						}
						else
						{
							$('form.form-wrapper.cf').after(nextIntentLink);
						}
						
						
					
					
					
				}
			}
		}
		
		//set the Natural language string in the text box, if it is not a home page
		if(aI.GetViewSummary()!= 'Fuzzy Search View')
		{
			if($('#spellCheckFlg').length)
			if($('#spellCheckFlg').val().trim() == "Y")
			{
				var valuetoSet = $('input#resp_query_s').val();
				$(".fuzzy_search_input").val(valuetoSet);
			}
			else{
				var valuetoSet = $('input#resp_query').val();
				$(".fuzzy_search_input").val(valuetoSet);
			}
		}
		
		if(SiebelApp.S_App.GetActiveView().GetViewSummary()== 'Fuzzy Search View')
		{
			$('.spellcheck').remove();
		}
		
		
		$('div[title="Second Level View Bar"] > ul.ui-tabs-nav').remove();
		
		//html for showing up the response in the UI
		$('div[title="Second Level View Bar"]').prepend('<div style="margin-left: 45px;height: 100%;background-color: #f1f1f1!important;border-left: 1px #000 solid;padding: 15px;box-sizing: border-box;overflow: hidden;min-height: 0;line-height: 1.3;text-decoration: none;list-style: none;"><textarea class="xml_holder" rows="20"></textarea></div>');
		$('textarea.xml_holder').val($('#xmlResponse').val());
		
		if($('.resultHolder').length)
		{
			if($('.SSpec').attr("id").trim() == 'Unknown')
			{
				var intent_unknown = '<strong> Intent Unknown</strong> Please change or refine your search query.';
				var exception_occured = '<span>Fuzzy Search could not find any information.  Please rephrase your question!</span>';
				var error_msg = ($('#req_status').val() == 'pass') ?  intent_unknown : exception_occured;
				var errorHtml = '<div class="alert alert-success" style="opacity:1;color:#fff;background-color: #10A6BD;border-color:#ebccd1;padding: 15px;margin-bottom: 20px;border:'; errorHtml += '1px solid transparent;border-radius: 4px;transition:opacity .15s linear;">';
				errorHtml += error_msg;
				errorHtml += '</div>';
				$('#'+this.GetPM().Get("GetFullId")).after(errorHtml);
			}
		}
		
				var FAQs = [
			  "opportunities associated to Softclouds LLC",
"opportunities created from 02/02/2016 to 02/23/2016",
"what are the opportunities with 0 revenue",
"which are the opportunities that were not committed",
"which are the opportunities whose probability is 100 percent",
"opportunities which are in submitted status",
"Display the opportunities created this year",
"Display the opportunity which has name as keyboard",
"Opportunities which are in open status",
"Opportunities whose probability is more than 0%",
"Opportunities created by SADMIN user",
"Display teh opportunities whose sales cycle is null",
"Display the opportunities which are not associated to any account",
"List the opportunity whose contact is missing",
"Display the opportunities whose sales method is ACAPS Application",
"Which opportunities are in committed state",
"List the opportunities whose revenue is greater than 0",
"Opportunities whose channel is set as phone",
"Display opportunities whose Priority Flag is true",
"List the opportunities created last week",
"Display the qualified opportunities"
			];
			$( "input[name='fuzzy_search_text_box']" ).autocomplete({
			  source: FAQs
			});
    }
	
	function ConvertNLStoSiebelQuery(qS,sF)
	{
		service = SiebelApp.S_App.GetService("Workflow Process Manager");
				if (service) {
				    inPropSet = CCFMiscUtil_CreatePropSet();
				    urltoHit = 'http://localhost:7001/FuzzyServlet/FuzzyServlet?query=' + qS + '&sp='+sF + '&p=SIEBEL&company=SOFTCLOUDS&companyToken=xyz&user=' + loggedName;
					//urltoHit = 'http://localhost:7001/FuzzyServlet/FuzzyServlet?static=y';
				    
				    inPropSet.SetProperty("RequestURL", urltoHit);
				    inPropSet.SetProperty("ProcessName", "Fuzzy Search NLP Conversion WF");

				    ai = {};
				    ai.async = true;
				    ai.selfbusy = false;
				    ai.scope = this;
				    ai.mask = true;
				    ai.opdecode = true;
				    ai.errcb = function() {

				    };
				    ai.cb = function() {
				        outPropSet = arguments[2];
				        //SiebelJS.Log(outPropSet);
				        if (outPropSet != null) {
				            xml = outPropSet.childArray[0].propArray['ResponseXML'];
				            //console.log(xml);
				            xmlDoc = $.parseXML(xml);
				            var $xml = $(xmlDoc);
				            reqStatus = $xml.find('resultSet').find('status').text();
				            if (reqStatus == 'pass') {
				               
								sCF = $xml.find('resultSet').find('spellingFlag').text();
								sCv = $xml.find('resultSet').find('query_sc').text();
								noI = $xml.find('resultSet').find('numberOfIntents').text();
								doQuery = 'Y';
								//	Saving Result as HTML for further processing 
								$('.resultHolder').remove();
								xmlResp = '<textarea id="xmlResponse" style="display:none;">'+xml+'</textarea>';
								req_status = '<input type="hidden" id="req_status" value="'+reqStatus+'">';
								spellCheckFlg = '<input type="hidden" id="spellCheckFlg" value="'+sCF+'">';
								resp_query = '<input type="hidden" id="resp_query" value="'+qS+'">';
								resp_query_s = '<input type="hidden" id="resp_query_s" value="'+sCv+'">';
								doQuery = (intentType == 'Unknown') ? 'N': 'Y';

								noIHtml = '<input type="hidden" id="numberofIntents" value="'+noI+'">';
								doQuery = (intentType == 'Unknown') ? 'N': 'Y';
								saveResultHtml = "";
								$xml.find('resultSet').find('intent').each(function(index){ 
									intentType = $(this).attr('type');
								searchSpec = $(this).find('searchSpec').text();
									
									if(index == 0)
									{
										entity = appletField[intentType];
									}
									var y = index + 1;
									saveResultHtml += '<span class="SSpec" id="'+intentType+'" data-index="'+y+'" data-name="'+intentType+'">'+searchSpec+'</span>';
								});
								doQuery = '<span id="doQuery">'+doQuery+'</span>';
								$('body').append('<div class="resultHolder" style="display:none;">'+saveResultHtml+doQuery+xmlResp+spellCheckFlg+resp_query+resp_query_s+req_status+noIHtml+'</div>');
								SiebelApp.S_App.GotoView(entity.viewName);
							}
							else{
								sCF,sCv,searchSpec,intentType='Unknown';
								doQuery = 'N';
								$('.resultHolder').remove();
								xmlResp = '<textarea id="xmlResponse" style="display:none;">'+xml+'</textarea>';
								req_status = '<input type="hidden" id="req_status" value="'+reqStatus+'">';
								spellCheckFlg = '<input type="hidden" id="spellCheckFlg" value="'+sCF+'">';
								resp_query = '<input type="hidden" id="resp_query" value="'+qS+'">';
								resp_query_s = '<input type="hidden" id="resp_query_s" value="'+sCv+'">';
								saveResultHtml = '<span class="SSpec" id="'+intentType+'">'+searchSpec+'</span><span id="doQuery">'+doQuery+'</span>';
								noIHtml = '<input type="hidden" id="numberofIntents" value="0">';
								$('body').append('<div class="resultHolder" style="display:none;">'+saveResultHtml+xmlResp+spellCheckFlg+resp_query+resp_query_s+req_status+noIHtml+'</div>');
								entity = appletField[intentType];
								SiebelApp.S_App.GotoView(entity.viewName);
							}							
								
				        }
				        
				    };
				    service.InvokeMethod("RunProcess", inPropSet, ai);
				}
					
				
	}
	
	function ExecuteQueryOnListApplet(AppletName,FieldForQuerying,SearchSpec,SiebelConstant)
	{
	
			var appletName = AppletName;
			var appletToBeQueried;
			view = SiebelApp.S_App.GetActiveView().GetAppletMap();
			var columnId = "";
			var oProp = CCFMiscUtil_CreatePropSet();
			var QueryString = SiebelApp.S_App.GetRequestDefault();
			$.each(view,function (i,v) 
			{ 
				if(i == appletName ) 
				{ 
					appletToBeQueried = v;
					resultappId = appletToBeQueried.GetPModel().Get( "GetFullId" );
				} 
			});
			//$('#resultappId').html("");
			var listOfColumns = appletToBeQueried.GetPModel().Get( "ListOfColumns" );
			
			
			$.each(listOfColumns,function(i,v) 
			{
				if (v.control.GetDisplayName() == FieldForQuerying)
					{
						columnId = v.control.GetInputName();
						QueryString.SetProperty(columnId,SearchSpec);
					}
			});
			
			QueryString.SetProperty(SiebelConstant.get("SWE_CMD_ARG"), SiebelConstant.get("SWE_CMD_INVOKE_METHOD_STR"));
			QueryString.SetProperty(SiebelConstant.get("SWE_METHOD_STR"), "ExecuteFrameQuery");
			QueryString.SetProperty(SiebelConstant.get("SWE_APPLET_STR"), appletName);
			QueryString.SetProperty(SiebelConstant.get("SWE_VIEW_ARG"), SiebelApp.S_App.GetActiveView().GetName());
			//SiebelJS.Log(QueryString);
			SiebelApp.S_App.CallServer(QueryString, oProp, true, {
				async: true,
				cb: function() {},
				scope: this
			});	
			$('span#doQuery').text('N');
	}
	


    FuzzySearchTopAppletPR.prototype.BindEvents = function () {
		SiebelAppFacade.FuzzySearchTopAppletPR.superclass.BindEvents.apply(this, arguments);
		
		
		$("input[name='fuzzy_search_text_box']").keyup(function (e) {
			
			if (e.keyCode == 13) {
				
				qS = $("input[name='fuzzy_search_text_box']").val();
				ConvertNLStoSiebelQuery(qS,doSpellCheckFlg);
			}
									
		});
		$(".trigger_search").click(function() {
			
				qS = $("input[name='fuzzy_search_text_box']").val();
				ConvertNLStoSiebelQuery(qS,doSpellCheckFlg);
			
		});
		
		if($('.resultHolder').length)
			{
				if($('span#doQuery').text() == 'Y')
				{
					var SiebelEntity,searchSpec,exAppletName,exField;
					$('.resultHolder').children('span.SSpec').each(function (){
						SiebelEntity = appletField[$(this).attr("id")]; 
						if (SiebelEntity.viewName == aI.GetViewSummary())
						{
							searchSpec= $(this).text();
							exAppletName = SiebelEntity.appletName;
							exField = SiebelEntity.field;
							
						}
					})
					
					ExecuteQueryOnListApplet(exAppletName,exField,searchSpec,SiebelConstant);
					
				}
			}
		
		//		onmouse over show the did you mean as underline
		$("#do-search-after-sc").mouseenter(function() {
			$(this).css("text-decoration", "underline").css("color", "blue");
		}).mouseleave(function() {
			$(this).css("text-decoration", "none").css("color", "blue");
		});
		
		//when did you mean corrected strin is clicked
		
		$('#do-search-after-sc').click(function () {
			qS = $(this).text().trim();
			ConvertNLStoSiebelQuery(qS,noSpellCheckFlg);
		})
		
		
		// processing after cliking the paging link
		$('.pgrEntity').click(function () {
			var clickedCtrl = $(this).attr('id');
			var currentPage = $(this).attr('data-name');
			currentPage = Number(currentPage);
			var gotoPage;
			if(clickedCtrl == 'next') 
			{
				gotoPage = currentPage + 1;
			} 
			if(clickedCtrl == 'prev') 
			{
				gotoPage = currentPage - 1;
			}
			console.log("go to which page ? -----" + gotoPage);
			var gotoEntity;
			$('.SSpec').each(function (i, obj){
				//console.log('The attribute is'  + obj.attr('id'));
				if(parseInt($(obj).data('index')) == gotoPage)
				{
					gotoEntity = $(obj).data('name');
				}
				
			})
			gotoEntity = appletField[gotoEntity];
			$('span#doQuery').text('Y');
			SiebelApp.S_App.GotoView(gotoEntity.viewName);
		})
		
		/*$('.problematicnext').click(function () {
			alert('');
		})*/
	 	
    }
	
	

    FuzzySearchTopAppletPR.prototype.EndLife = function () {
     SiebelAppFacade.FuzzySearchTopAppletPR.superclass.EndLife.apply(this, arguments);
    }


    return FuzzySearchTopAppletPR;
   }()
  );
  return "SiebelAppFacade.FuzzySearchTopAppletPR";
 })
}
