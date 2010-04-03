

function displayError(container, XMLHttpRequest, textStatus, errorThrown) {
   container.find(".results-table").remove();	   
   
   container.append( "<div class='error'>Error Executing Query: " + XMLHttpRequest.responseText + "</div>");
   
}

function dumpToTextArea(container, data, elapsed) {   
   container.append( "<textarea class='span-24'>" + data + "</textarea>");
}

function sparqlResultsToTable(container, json, elapsed) {
   container.find(".results-table").remove();
   container.find(".error").remove();
   
   //console.log(json);      
   var table = document.createElement("table");
   var tbody = document.createElement("tbody");
   var thead = document.createElement("thead");
   table.appendChild(thead);
   table.appendChild(tbody);
   
   var row = document.createElement("tr");
      
   jQuery.each( json.head.vars, function(i, val) {
	var col = document.createElement("th");
	row.appendChild(col);
	$(col).text( val );   	
   });
   
   thead.appendChild(row);
   
   var cols = json.head.vars.length;   
   var rows = json.results.bindings.length;
   
   jQuery.each( json.results.bindings, function(i, binding) {
	var row = document.createElement("tr");
	jQuery.each( json.head.vars, function() {
	   var td = document.createElement("td");
	   var text = ""
	   if ( binding[this] ) {
	   	text = binding[this].value;
	   }

	   if ( binding[this] && binding[this].type == 'uri' ) {
	   	var anchor = document.createElement("a");
	   	$(anchor).attr("href", text);
	   	$(anchor).text( text );
	   	td.appendChild( anchor );	   
	   } else {
	   	$(td).text( text  );	   
	   }
	   row.appendChild(td);
	});
	tbody.appendChild(row);
   });
 
   var footerRow = document.createElement("tr"); 
   var footer = document.createElement("td");
   footerRow.appendChild(footer);
   $(footer).text( json.results.bindings.length + " Results in " + elapsed + " msecs");
   $(footer).attr("colspan", json.head.vars.length);    
   $(footer).addClass("tfoot");
   tbody.appendChild(footerRow);
   
   $(container).append(table);
   $(table).attr("border", 1);
   $(table).addClass("results-table");
   
}

/**
 * Click handler for the load button. Uses the impromptu jquery plugin to 
 * display a dialog
 */
function loadQueryClickHandler() {
   var txt = 'Please enter query URL:<br /><input type="text" id="query-url" name="query-url" value="" />';
   
   $.prompt(txt,{
      prefix: "blueprint",   
      buttons: { Ok: true, Cancel: false },
      callback: function (value,m){
		if (value) {
			$.get( m.children("#query-url").val(), 
			   function(data, textStatus) {   	   	
				$("#query").val( data );
			   },
			   "text"
			);            
		}   
	}

   });
   return false;
}

function doQuery() {
	$("#results").find(".error").remove();
	$("#results").find(".results-table").remove();
	$("#results").find("textarea").remove();

    if ( !$("#inline").is(":checked") ) {
    
    	return true;
    }
    
   	var form = $(".spared");
   	   	
   	var q = $(form).find("#query").val();
   	//console.log( "Query: " + q );
	   	
	var startTime = new Date().getTime();
	 
			
	if ( q.match(/SELECT /i) ) {
		$.ajax({
		   type: "GET",
		   url: $(form).attr("action"),
		   data: {
		   	query: q,
		   	output: "json"
		   },
		   dataType: "json",	
		   success: function(data, textStatus) {
	   	   	var elapsed = new Date().getTime() - startTime;
	   	   	sparqlResultsToTable( $("#results"), data, elapsed );   	   	   	   	
		   
		   },
		   error: function(XMLHttpRequest, textStatus, errorThrown) {
	   		displayError( $("#results"), XMLHttpRequest, textStatus, errorThrown );
		   }
		
		});
	} else {
		$.ajax({
		   type: "GET",
		   url: $(form).attr("action"),
		   data: {
		   	query: q
		   },
		   dataType: "text",	
		   success: function(data, textStatus) {
	   	   	var elapsed = new Date().getTime() - startTime;
	   	   	dumpToTextArea($("#results"), data, elapsed);		   
		   },
		   error: function(XMLHttpRequest, textStatus, errorThrown) {
	   		displayError( $("#results"), XMLHttpRequest, textStatus, errorThrown );
		   }
		
		});	
	}
	
	
   	return false;
}
   
/**
 * Setup the event handlers for the form
 */
$(document).ready(function(){
   populatePrefixes("prefixes", "js/spared-prefixes.js");
   populateTemplates("templates", "js/spared-templates.js");   
   populateTemplates("examples", "js/spared-examples.js");   
   
   $("#query").resizable({
   	autoHide: true
   });
   
   $("#clear-query").click( function() {
   	var form = $(".spared");
   	$(form).find("#query").val("");
   	return false;
   });
   
   $("#load-query").click( loadQueryClickHandler );

   $("#run-query").click( doQuery );
   
   $(".box h3").toggle(
   	function() {
   	  $(this).parent().find(".contents").show();
   	},
   	function() {
   	  $(this).parent().find(".contents").hide();
   	}
   );
   
});