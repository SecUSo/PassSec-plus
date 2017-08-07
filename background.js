/*$.each(DefaultOptions,function(i,v){if(!window.localStorage.getItem(v.label))window.localStorage.setItem(v.label,v.value)});
chrome.extension.onRequest.addListener(function(request,sender,sendResponse){
	var r = {
		istooltip:(window.localStorage.getItem(DefaultOptions.istooltip.label)==='true'),
		time:parseInt(window.localStorage.getItem(DefaultOptions.timeout.label)),
		position:window.localStorage.getItem(DefaultOptions.position.label),
		domaincolor:window.localStorage.getItem(DefaultOptions.domaincolor.label)
	};
	sendResponse(r);
});

chrome.tabs.onUpdated.addListener(function(tabId,status,info){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		console.log(tabs[0]);
  });
});
*/

// message passing with content script
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
	if(request.name == "sslcheck"){
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			if (xhttp.readyState == 4){
				sendResponse(xhttp.responseText);
			}
		};
		xhttp.open('GET', "https://api.ssllabs.com/api/v2/analyze?host="+request.url, true);
		xhttp.send(null);
		return true;
	}
});
