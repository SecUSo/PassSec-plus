// init storage
$.each(PassSec,function(i,v){
	if(!window.localStorage.getItem(v.label)){
		window.localStorage.setItem(v.label,v.value);
	}
});


// message passing with content script
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
	if(request.name == "getStorage"){
		var r = {
			firstRun:(window.localStorage.getItem(PassSec.firstRun.label)),
			secureImage:parseInt(window.localStorage.getItem(PassSec.secureImage.label)),
			secureEVImage:parseInt(window.localStorage.getItem(PassSec.secureEVImage.label)),
			checkExceptionAuto:(window.localStorage.getItem(PassSec.checkExceptionAuto.label))
		};
		sendResponse(r);
	}
	else if(request.name == "setStorage"){
		window.localStorage.setItem(request.item,request.value);
	}
	else if(request.name == "sslCheck"){
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

/*
chrome.tabs.onUpdated.addListener(function(tabId,status,info){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		console.log(tabs[0]);
  });
});
*/
