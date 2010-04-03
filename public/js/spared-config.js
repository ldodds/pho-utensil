
function populatePrefixes(id, url) {
   
   populate(id, 
   	url, 
	function(entry) {
		var listItem = document.createElement("li");
		$(listItem).html("<a href='" + entry.uri + 
				   "' title='" + entry.prefix + "'>" +
				   entry.description +
				   "</a>");
		return listItem;				   
	},
	function() {
		var query = $("#query").val();
		var prefix = $(this).attr("title");
		var uri = $(this).attr("href");
		if ( !new RegExp( "PREFIX " + prefix + ":").test(query) ) {
		   $("#query").val( "PREFIX " + prefix + 
			  	    ": <" + uri + ">\n" + query );
		}			
		return false;
	}
   );	
      
}

function populateTemplates(id, url) {
	populate(id,
		url,
		function(entry) {
			var listItem = document.createElement("li");
			$(listItem).html("<a href='" + entry.uri + "'>" +
					entry.description +
					"</a>");
			return listItem;				   		
		}
		,
		function() {
			//var query = $("#query").val();
			var uri = $(this).attr("href");
			$.ajax({
					   type: "GET",
					   async: false,
					   url: uri,
					   dataType: "text",	
					   success: function(data, textStatus) {
					     $("#query").val(data);
					   },
					   error: function(XMLHttpRequest, textStatus, errorThrown) {
				   		 alert("Unable to load query");
					   }
					
					});				
			return false;
		}
	);
}

function populateExamples(id, url) {
	populate(id,
		url,
		function(entry) {
			var listItem = document.createElement("li");
			$(listItem).html("<a href='" + entry.uri + "'>" +
					entry.description +
					"</a>");
			return listItem;				   		
		}
		,
		function() {
			//var query = $("#query").val();
			var uri = $(this).attr("href");
			$.ajax({
					   type: "GET",
					   async: false,
					   url: uri,
					   dataType: "text",	
					   success: function(data, textStatus) {
					     $("#query").val(data);
					   },
					   error: function(XMLHttpRequest, textStatus, errorThrown) {
				   		 alert("Unable to load query");
					   }
					
					});				
			return false;
		}
	);
}


/*
 * id - identifier of container div. Will have ul added.
 * url - url of config
 * createItem - function to create list item, accepts entry param
 * clickHandler - click handler to add to the created item
 */
function populate(id, url, createItem, clickHandler) {
      
   var container = "#" + id;
   
   $.ajax({
	type: "GET",
	url: url,
	async: false,
	dataType: "json",	
	success: function(config, textStatus) {
	
	   $(container).html("");
	   	   
	   var list = document.createElement("ul");   
	   //console.log("Populating: " + config.title);
	   
	   jQuery.each( config.entries, function() {	   	
	   	$(list).append( createItem(this) );				   
	   });

	   $(container).append(list);  
	   
	   $(container).find("a").click( clickHandler );
	
	}
   });
   
}