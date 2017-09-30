/**
 *   get security status of website
 */
function getSecurityStatus(storage) {
    return new Promise(function (resolve, reject) {
        if (passSec.url.startsWith("https")) {
            // TODO do EV cert check
            // check for exception set by user
            if (storage.exceptions.includes(passSec.domain)) {
                passSec.security = "httpsEV";
            } else {
                passSec.security = "https";
            }
            resolve();
        } else if (passSec.url.startsWith("http:")) {
            passSec.security = "http";
            let httpsUrl = passSec.url.replace("http://", "https://");
            // check for redirect set by user and execute it, if one is found
            if (storage.redirects.includes(passSec.domain)) {
                browser.runtime.sendMessage({type: "doRedirect", httpsURL: httpsUrl});
                reject();
            }
            // check if site offers https
            let httpsRequest = new XMLHttpRequest();
            httpsRequest.open("HEAD", httpsUrl);
            httpsRequest.onreadystatechange = function () {
                if (this.readyState === this.DONE) {
                    passSec.httpsAvailable = this.status >= 200 && this.status <= 299 && this.responseURL.startsWith("https");
                    resolve();
                }
            };
            httpsRequest.send();
        }
    });
}