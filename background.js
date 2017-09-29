// init storage
$.each(PassSec, function (i, v) {
    if (!window.localStorage.getItem(v.label)) {
        window.localStorage.setItem(v.label, v.value);
    }
});


// message passing with content script
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // get local storage
    if (request.name === "getStorage") {
        let r = {
            firstRun: (window.localStorage.getItem(PassSec.firstRun.label)),
            secureImage: parseInt(window.localStorage.getItem(PassSec.secureImage.label)),
            secureEVImage: parseInt(window.localStorage.getItem(PassSec.secureEVImage.label)),
            checkExceptionsAfter20Starts: (window.localStorage.getItem(PassSec.checkExceptionsAfter20Starts.label))
        };
        sendResponse(r);
    }
    // set local storage
    else if (request.name === "setStorage") {
        window.localStorage.setItem(request.item, request.value);
    }
    // get top level domains (for domain extraction in urls)
    else if (request.name === "TLD") {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                sendResponse(xhttp.response);
            }
        };
        xhttp.open('GET', "https://publicsuffix.org/list/public_suffix_list.dat", true);
        xhttp.send(null);
        return true;
    }
});
