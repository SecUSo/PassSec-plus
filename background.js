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
chrome.browserAction.setIcon({path: "skin/redirectActive.png"});

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
        case "extractDomain":
            if (tldList === null) {
                // tldList is not yet present -> add request to queue
                domainExtractionQueue.push([message.host, sender.tab.id, sender.frameId]);
            } else {
                let domain = extractDomain(message.host, tldList);
                chrome.tabs.sendMessage(sender.tab.id, {type: "extractedDomain", domain: domain}, {frameId: sender.frameId});
            }
            break;
    }
});

// get top level domains (for domain extraction in urls)
let getTLDs = new Promise(function (resolve, reject) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4)
            resolve(xhttp.response);
    };
    xhttp.open('GET', "https://publicsuffix.org/list/public_suffix_list.dat", true);
    xhttp.send(null);
});
getTLDs.then(function (tld) {
    tldList = tld;
    // if there are any content scripts waiting for domain extraction, process them now
    for (let i = 0; i < domainExtractionQueue.length; i++) {
        let domain = extractDomain(domainExtractionQueue[i][0], tldList);
        chrome.tabs.sendMessage(domainExtractionQueue[i][1], {type: "extractedDomain", domain: domain}, {frameId: domainExtractionQueue[i][2]});
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

/**
 * Extracts the domain out of a given URL
 *
 * @param url The URL of which the domain should be extracted
 * @param tld A list of known top level domains
 */
function extractDomain(url, tld) {
    let split = url.split(".");
    if (split.length > 2) url = split[split.length - 2] + "." + split[split.length - 1];

    let arr = tld.split("\n").filter(function (value) {
        return value !== "" && !value.startsWith("//") && value.split(".").length >= 3
    });
    if (arr.toString().indexOf(url) > -1) {
        let arr2 = tld.split("\n").filter(function (value) {
            return value !== "" && !value.startsWith("//") && value.indexOf(url) > -1
        });
        let temp = "bla";
        if (split.length >= 3) temp = split[split.length - 3] + "." + split[split.length - 2] + "." + split[split.length - 1];
        if (arr2.indexOf(temp) > -1 || (arr2.indexOf("*." + url) > -1 && arr2.indexOf("!" + temp) === -1)) return temp;
    }
    return url;
}