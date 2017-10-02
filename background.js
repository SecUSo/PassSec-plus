// do some stuff on first run
browser.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        // init storage
        browser.storage.local.set(PassSec);
        // change the secure-image to a random one
        let image = Math.floor(Math.random() * 10) + 1;
        browser.storage.local.set({secureImage: image});
        // open options page
        browser.runtime.openOptionsPage();
    }
});

// count browser starts and do exceptions checking if corresponding option is set
// browser.storage.local.get("checkExceptionsAfter20Starts").then(function (item) {
//     let check = item.checkExceptionsAfter20Starts;
//     if (check.doCheck) {
//         let starts = check.count + 1;
//         if (starts === 20) {
//             // reset counter
//             browser.storage.local.set({checkExceptionsAfter20Starts: {doCheck: true, count: 0}});
//             // check exceptions
//             // TODO
//         } else {
//             // increase counter
//             browser.storage.local.set({checkExceptionsAfter20Starts: {doCheck: true, count: starts}});
//         }
//     }
// });

// listen for messages from content script
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.type) {
        case "doRedirect":
            registerRedirectHandler();
            // this is only to directly execute a redirect when the user clicked the 'Secure Mode' button
            browser.tabs.update({url: message.httpsURL});
            break;
        case "registerRedirectHandler":
            registerRedirectHandler();
            break;
    }
});

// initial setup of the redirect handler
registerRedirectHandler();

/**
 * Registers or removes a webRequest listener to handle redirects
 * This function has to be executed each time the list of redirects changed
 */
function registerRedirectHandler() {
    browser.storage.local.get("redirects").then(function (item) {
        browser.webRequest.onBeforeRequest.removeListener(handleRedirect);
        if (item.redirects.length > 0)
            browser.webRequest.onBeforeRequest.addListener(handleRedirect, {urls: item.redirects}, ["blocking"]);
    });
}

/**
 * Callback for webRequest listener
 *
 * @param requestDetails The details of the request
 * @returns {{redirectUrl: string}}
 */
function handleRedirect(requestDetails) {
    let httpsURL = requestDetails.url.replace("http://", "https://");
    return {redirectUrl: httpsURL};
}