// used as a switch activating/disabling saved redirects
let redirectsActive = true;

// do some stuff on first run
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        // init storage
        chrome.storage.local.set(PassSec);
        // change the secure-image to a random one
        let image = Math.floor(Math.random() * 10) + 1;
        chrome.storage.local.set({secureImage: image});
        // open options page
        chrome.runtime.openOptionsPage();
    }
});

// handle left-click on browser action icon
chrome.browserAction.onClicked.addListener(function (tab) {
    redirectsActive = !redirectsActive;
    if (redirectsActive) {
        chrome.browserAction.setIcon({path: "skin/redirectActive.png"});
        chrome.browserAction.setTitle({title: chrome.i18n.getMessage("browserActionRedirectActive")});
    } else {
        chrome.browserAction.setIcon({path: "skin/redirectInactive.png"});
        chrome.browserAction.setTitle({title: chrome.i18n.getMessage("browserActionRedirectInactive")});
    }
    manageRedirectHandler();
});

// create context menu for browser action
chrome.contextMenus.create({
    contexts: ["browser_action"],
    onclick: function () {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {type: "addException"}, {frameId: 0});
        });
    },
    title: chrome.i18n.getMessage("exceptionHTTP") + " (PassSec+)"
});
chrome.contextMenus.create({
    contexts: ["browser_action"],
    onclick: function () {
        chrome.runtime.openOptionsPage();
    },
    title: chrome.i18n.getMessage("options") + " (PassSec+)"
});

// execute options if set
chrome.storage.local.get(["deleteCookiesOnStart", "checkExceptionsAfter20Starts"], function (item) {
    // delete cookies
    if (item.deleteCookiesOnStart) {
        chrome.browsingData.removeCookies({originTypes: {unprotectedWeb: true}}, function (details) {
            let messageToDisplay = chrome.i18n.getMessage("cookieOptionDeleteOnceSuccess");
            if (chrome.runtime.lastError)
                messageToDisplay = chrome.i18n.getMessage("cookieOptionDeleteOnceFailure");
            chrome.notifications.create({
                type: "basic",
                title: "PassSec+",
                message: messageToDisplay,
                iconUrl: chrome.extension.getURL("skin/logo.png")
            });
        });
    }
    // count browser starts and do exceptions checking
    // let check = item.checkExceptionsAfter20Starts;
    // if (check && check.doCheck) {
    //     let starts = check.count + 1;
    //     if (starts === 20) {
    //         // reset counter
    //         chrome.storage.local.set({checkExceptionsAfter20Starts: {doCheck: true, count: 0}});
    //         // check exceptions
    //         // TODO
    //     } else {
    //         // increase counter
    //         chrome.storage.local.set({checkExceptionsAfter20Starts: {doCheck: true, count: starts}});
    //     }
    // }
});

// listen for messages from content script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.type) {
        case "doRedirect":
            manageRedirectHandler();
            // this is only to directly execute a redirect when the user clicked the 'Secure Mode' button
            chrome.tabs.update({url: message.httpsURL});
            break;
        case "manageRedirectHandler":
            manageRedirectHandler();
            break;
        case "deleteCookies":
            chrome.browsingData.removeCookies({originTypes: {unprotectedWeb: true}}, function (details) {
                if (chrome.runtime.lastError)
                    chrome.runtime.sendMessage({type: "deletedCookies", status: "failure"});
                else {
                    chrome.runtime.sendMessage({type: "deletedCookies", status: "success"});
                }
            });
            break;
    }
});

// initial setup of the redirect handler
manageRedirectHandler();

/**
 * Registers or removes a webRequest listener to handle redirects set by the user
 * This function has to be executed each time the list of redirects changed
 */
function manageRedirectHandler() {
    chrome.storage.local.get("redirects", function (item) {
        if (item.redirects) {
            chrome.webRequest.onBeforeRequest.removeListener(handleRedirect);
            if (redirectsActive && item.redirects.length > 0)
                chrome.webRequest.onBeforeRequest.addListener(handleRedirect, {urls: item.redirects}, ["blocking"]);
        }
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