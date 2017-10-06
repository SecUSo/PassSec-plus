/**
 * Determine the security status of the current website
 *
 * @param storage Object containing the set options at the time of calling this function
 * @returns {Promise} Returns when check is finished
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
            // check for exception set by user
            if (storage.exceptions.includes(passSec.domain)) {
                passSec.security = "httpsEV";
            } else {
                passSec.security = "http";
            }
            // check if site offers https
            let httpsUrl = passSec.url.replace("http://", "https://");
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