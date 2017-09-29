// do some stuff on first run
browser.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        // init storage
        for (let option in PassSec) {
            if (PassSec.hasOwnProperty(option))
                window.localStorage.setItem(option.label, option.value);
        }
        // change the secure-image to a random one
        let image = Math.floor(Math.random() * 10) + 1;
        window.localStorage.setItem("secureImage", image);
        window.localStorage.setItem("secureEVImage", image);
        // open options page
        browser.runtime.openOptionsPage();
    }
});

// count browser starts and do exceptions checking if corresponding option is set
let check = window.localStorage.getItem("checkExceptionsAfter20Starts");
if (check !== null && check.doCheck) {
    let starts = check.count + 1;
    if (starts === 20) {
        // reset counter
        window.localStorage.setItem("checkExceptionsAfter20Starts", {doCheck: true, count: 0});
        // check exceptions
        // TODO
    } else {
        // increase counter
        window.localStorage.setItem("checkExceptionsAfter20Starts", {doCheck: true, count: starts});
    }
}

// message passing with content script
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // get local storage
    if (request.name === "getStorage") {
        let r = {
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
