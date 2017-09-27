/**
 *   get security status of website
 */
function getSecurityStatus(r) {
    if (passSec.url.startsWith("https")) {
        passSec.security = "https";
        if (r.sslCheckEnabled === "true")
            getSSLStatus();
    } else {
        passSec.security = "http";
    }
}

/**
 *   TODO: get answer for request to ssllabs api (not ready yet)
 */
function getSSLStatus() {
    // chrome.runtime.sendMessage({name: "sslCheck", url: passSec.url}, function (r) {
    //     //console.log(r);
    //     var result = JSON.parse(r);
    //     //console.log(result.status);
    //     var repeatSSLCheck = setInterval(sendRequest(), 2000);
    //     passSec.sslCheckResult = result.status;
    //     if (passSec.sslCheckResult == "READY") {
    //         clearInterval(repeatSSLCheck);
    //         //console.log(result.endpoints[0]);
    //     }
    // });
    // chrome.runtime.sendMessage({name: "sslcheck", url: passSec.url}, function (r) {
    //     var result = JSON.parse(r);
    //     //console.log(result.endpoints[0].statusMessage);
    //     passSec.sslCheckResult = result.status;
    // });
}
