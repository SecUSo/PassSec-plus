// used as a switch activating/disabling saved redirects
let redirectsActive = true;
// list of top level domains for domain extraction
let tldList = null;
// queue of content scripts (as [host, tabId, frameId]) waiting for domain extraction
let domainExtractionQueue = [];

// initialize storage
chrome.storage.local.get(null, function (items) {
    let storageKeys = Object.keys(items);
    // init storage with all options that are not present
    let newOptions = {};
    Object.keys(PassSec).forEach(function (key) {
        if (!storageKeys.includes(key)) {
            if (key === "secureImage") {
                // set a random secure-image instead of the default one
                newOptions[key] = Math.floor(Math.random() * 10) + 1;
            } else {
                newOptions[key] = PassSec[key];
            }
        }
    });
    if (Object.keys(newOptions).length > 0)
        chrome.storage.local.set(newOptions, function () {
            if (storageKeys.length === 0)
                // storage was empty -> first run of this WebExtensions version (install or update)
                chrome.runtime.openOptionsPage();
        });
});

// set correct browser action icon on startup, because Chrome sometimes switches the set default_icon
// to the last used one, which can produce undesired behaviour: browser action icon was red when
// closing the browser -> active redirecting, but red icon on next startup
chrome.browserAction.setIcon({ path: "skin/redirectActive.png" });

// handle left-click on browser action icon
/* chrome.browserAction.onClicked.addListener(function (tab) {
    redirectsActive = !redirectsActive;
    if (redirectsActive) {
        chrome.browserAction.setIcon({ path: "skin/redirectActive.png" });
        chrome.browserAction.setTitle({ title: chrome.i18n.getMessage("browserActionRedirectActive") });
    } else {
        chrome.browserAction.setIcon({ path: "skin/redirectInactive.png" });
        chrome.browserAction.setTitle({ title: chrome.i18n.getMessage("browserActionRedirectInactive") });
    }
    manageRedirectHandler();
});*/

/*
Compares versionToCompare with version
returns true if version is higher/newer than versionToCompare
*/
function isNewerVersion(versionToCompare, version) {
    let versionToCompareParts = versionToCompare.split('.');
    let versionParts = version.split('.');

    while (versionToCompareParts.length < versionParts.length) versionToCompareParts.push("0");
    while (versionParts.length < versionToCompareParts.length) versionParts.push("0");

    for (var i = 0; i < versionParts.length; i++) {
        const a = parseInt(versionParts[i]);
        const b = parseInt(versionToCompareParts[i]);
        if (a > b) return true
        if (a < b) return false
    }
    return false
}

function transferOfTrustworthyDomainsSetByUser() {
    chrome.storage.local.get(null, function (storageObj) {
        let prevExceptionsSetByUserArr = storageObj["exceptions"];
        let newExceptionSetByUserArr = storageObj["userTrustedDomains"];
        let httpsExceptionsArr = prevExceptionsSetByUserArr.filter(exception => (exception.split("passSec-")[1]) == "https" || (exception.split("passSec-")[1]) == "all");
        let exceptionHttpsDomainsArr = httpsExceptionsArr.map(exception => exception.split("passSec-")[0]);
        let userTrustedDomainsArr = Array.from(new Set(newExceptionSetByUserArr.concat(exceptionHttpsDomainsArr)));
        chrome.storage.local.set({ userTrustedDomains: userTrustedDomainsArr });
    });
}

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "update") {
        let prevVersion = details.previousVersion;
        if (!isNewerVersion("3.3", prevVersion)) {
            transferOfTrustworthyDomainsSetByUser();
        }
        // update list of trusted domains set by developer
        let updatedTrustedDomains = PassSec.trustedDomains;
        chrome.storage.local.set({trustedDomains: updatedTrustedDomains});
    }
});

chrome.contextMenus.create({
    contexts: ["browser_action"],
    onclick: function () {
        chrome.runtime.openOptionsPage();
    },
    title: chrome.i18n.getMessage("options") + " (PassSec+)"
});

// listen for messages from content script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.type) {
        case "doRedirect":
            manageRedirectHandler();
            // this is only to directly execute a redirect when the user clicked the 'Secure Mode' button
            chrome.tabs.update({ url: message.httpsURL });
            break;
        case "checkHttpsAvailable":
            let httpsUrl = message.httpsURL.replace("http://", "https://");
            let httpsRequest = new XMLHttpRequest();
            httpsRequest.open("HEAD", httpsUrl);
            httpsRequest.onreadystatechange = function () {
                if (this.readyState === this.DONE) {
                    var httpsAvailable = this.status >= 200 && this.status <= 299 && this.responseURL.startsWith("https");
                    // if there is an open tooltip while httpsAvailable switches to true, trigger focus event to reopen tooltip with correct content
                    if (httpsAvailable === true)
                        sendResponse(true);
                    //$(':focus').focus();
                }
            };
            httpsRequest.send();
            return true;
        case "manageRedirectHandler":
            manageRedirectHandler();
            break;
        case "domain":
            let domain = extractDomain(message.host);
            sendResponse({ domain: domain });
            return true;
        case "TLD":
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (xhttp.readyState == 4) {
                    sendResponse(xhttp.response);
                }
            };
            xhttp.open(
                "GET",
                "https://publicsuffix.org/list/public_suffix_list.dat",
                true
            );
            xhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhttp.send(null);
            return true;
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
                chrome.webRequest.onBeforeRequest.addListener(handleRedirect, { urls: item.redirects }, ["blocking"]);
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
    return { redirectUrl: httpsURL };
}
