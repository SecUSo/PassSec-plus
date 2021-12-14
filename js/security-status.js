/**
 * Determine the security status of the current website
 *
 * @param storage Object containing the set options at the time of calling this function
 */
 function getSecurityStatus(storage, actform) {
    let securityStatus = ""
    let userTrustedDomains = storage.userTrustedDomains;
    let actformActionURL = new URL(actform.action);
    let actformActionDomain = extractDomain(actformActionURL.host);


    if (passSec.url.startsWith("https://") && actform.action.startsWith("https://") && actformActionDomain == passSec.domain) {
        // check if the domain of the website is in the list of trusted domains
        if (storage.trustedListActivated && storage.trustedDomains.includes(passSec.domain)) {
            securityStatus = "httpsEV"; //TODO: rename, as EV is not accurate here and it is a misleading name
        }
        // check for exceptions set by user
        else if (userTrustedDomains.includes(passSec.domain)) {
            securityStatus = "userTrusted";
        }
        else {
            securityStatus = "https"; 
        }
    } else {
        if (userExceptionArrIncludesObj(storage.userExceptions, {"formDom": actformActionDomain,"formProtocol": actformActionURL.protocol,"siteDom": passSec.domain,"siteProtocol": passSec.websiteProtocol})) {
            securityStatus = "none";
        } else {
            securityStatus = "http";
        }

        if (passSec.url.startsWith("http://")) {
            passSec.httpsAvailable = false;
            chrome.runtime.sendMessage({ type: "checkHttpsAvailable", httpsURL: passSec.url }, function (httpsAvailable) {
                passSec.httpsAvailable = httpsAvailable;
            });
        }
    }

    return securityStatus;
}

function checkForm(form) {
    formActionDom = extractDomain(form.action);
    return (actform.action.startsWith("https://") && formActionDom == passSec.domain);
}

function userExceptionArrIncludesObj(exceptions, obj) {
    var objToFind = JSON.stringify(obj);
    let check = exceptions.map(s => JSON.stringify(s).replace(" ","")).some(s => s == objToFind);
    return check;
}