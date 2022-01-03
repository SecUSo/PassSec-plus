/**
 * Possible security states (four digits):
 * First digit (known domain?):
 * 1 = trusted by developers, 2 = trusted by user, 3 = exception set by user, 4 = unknown domain
 * Second digit:
 * 0 = site protocol is http, 1 = site protocol is https
 * Third digit:
 * 0 = form protocol is http, 1 = form protocol is https
 * Fourth digit:
 * 0 = site domain is not the same as form target domain, 1 = domains are the same
 */


 function isKnownDomain(trustedList, userTrustedList, userExceptions, siteProtocol, siteDomain, formProtocol, formDomain, trustedListIsActivated) {
    if (trustedListIsActivated && trustedList.includes(siteDomain)) {
        return 1;
    } else if (userTrustedList.includes(siteDomain)) {
        return 2;
    } else if (userExceptionArrIncludesObj(userExceptions, { "formDom": formDomain, "formProtocol": formProtocol, "siteDom": siteDomain, "siteProtocol": siteProtocol })) {
        return 3;
    } else {
        return 4;
    }
}

function getProtocolStatus(url) {
    return url.startsWith("https") ? 1 : 0;
}


function getSameDomainStatus(firstDomain, secondDomain) {
    return firstDomain == secondDomain ? 1 : 0;
}

/**
 * Determine the security status of the current website
 *
 * @param storage Object containing the set options at the time of calling this function
 */
function getSecurityStatus(storage, formElem) {
    let securityStatus = "0000"

    if (formElem != null) {
        var formAction = formElem.action;
        var formActionURL = new URL(formAction);
        var formActionDomain = extractDomain(formActionURL.host);

        let getDomainStatus = isKnownDomain(storage.trustedDomains, storage.userTrustedDomains, storage.userExceptions, passSec.websiteProtocol, passSec.domain, formActionURL.protocol, formActionDomain, storage.trustedListActivated);
        let siteProtocolStatus = getProtocolStatus(passSec.url);
        let sameDomainStatus = getSameDomainStatus(passSec.domain, formActionDomain);
        let formProtocolStatus = getProtocolStatus(formAction);

        securityStatus = `${getDomainStatus}${siteProtocolStatus}${formProtocolStatus}${sameDomainStatus}`;

        if (passSec.url.startsWith("http://")) {
            passSec.httpsAvailable = false;
            chrome.runtime.sendMessage({ type: "checkHttpsAvailable", httpsURL: passSec.url }, function (httpsAvailable) {
                passSec.httpsAvailable = httpsAvailable;
            });
        }
    }

    return securityStatus;
}

function userExceptionArrIncludesObj(exceptions, obj) {
    var objToFind = JSON.stringify(obj);
    let check = exceptions.map(s => JSON.stringify(s).replace(" ", "")).some(s => s == objToFind);
    return check;
}