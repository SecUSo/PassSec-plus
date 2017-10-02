// used as a switch activating/disabling saved redirects
let redirectsActive = true;

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

// handle left-click on browser action icon
browser.browserAction.onClicked.addListener(function (tab) {
    redirectsActive = !redirectsActive;
    if (redirectsActive) {
        browser.browserAction.setIcon({path: "skin/redirectActive.png"});
        browser.browserAction.setTitle({title: browser.i18n.getMessage("browserActionRedirectActive")});
    } else {
        browser.browserAction.setIcon({path: "skin/redirectInactive.png"});
        browser.browserAction.setTitle({title: browser.i18n.getMessage("browserActionRedirectInactive")});
    }
    manageRedirectHandler();
});

// create context menu for browser action
browser.contextMenus.create({
    contexts: ["browser_action"],
    onclick: function () {
        browser.tabs.query({currentWindow: true, active: true}).then(function (tabs) {
            browser.tabs.sendMessage(tabs[0].id, {type: "addException"}, {frameId: 0});
        });
    },
    title: browser.i18n.getMessage("exceptionHTTP") + " (PassSec+)"
});
browser.contextMenus.create({
    contexts: ["browser_action"],
    onclick: function () {
        browser.runtime.openOptionsPage();
    },
    title: browser.i18n.getMessage("options") + " (PassSec+)"
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
            manageRedirectHandler();
            // this is only to directly execute a redirect when the user clicked the 'Secure Mode' button
            browser.tabs.update({url: message.httpsURL});
            break;
        case "manageRedirectHandler":
            manageRedirectHandler();
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
    browser.storage.local.get("redirects").then(function (item) {
        browser.webRequest.onBeforeRequest.removeListener(handleRedirect);
        if (redirectsActive && item.redirects.length > 0)
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