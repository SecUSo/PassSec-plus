$.each(DefaultOptions,function(i,v){if(!window.localStorage.getItem(v.label))window.localStorage.setItem(v.label,v.value)});
chrome.extension.onRequest.addListener(function(request,sender,sendResponse){
	var r = {
		istooltip:(window.localStorage.getItem(DefaultOptions.istooltip.label)==='true'),
		time:parseInt(window.localStorage.getItem(DefaultOptions.timeout.label)),
		position:window.localStorage.getItem(DefaultOptions.position.label),
		domaincolor:window.localStorage.getItem(DefaultOptions.domaincolor.label)
	};
	sendResponse(r);
});

var callback = function(details) {
  for (var i = 0; i < details.responseHeaders.length; i++) {
    if ('content-security-policy' === details.responseHeaders[i].name.toLowerCase()) {
      details.responseHeaders[i].value = '';
    }
  }
  return {
    responseHeaders: details.responseHeaders
  };
};

var filter = {
  urls: ["*://*/*"],
  types: ["main_frame", "sub_frame"]
};

chrome.webRequest.onHeadersReceived.addListener(callback, filter, ["blocking", "responseHeaders"]);
chrome.browserAction.onClicked.addListener(function(tab) {
    var state = isActive ? 'off' : 'on';
    isActive = !isActive;
    console.log(isActive);
});
