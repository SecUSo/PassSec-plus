/**
 * Determine the security status of the current website
 *
 * @param storage Object containing the set options at the time of calling this function
 */
function getSecurityStatus(storage, actform) {
    if (passSec.url.startsWith("https")) {
        // TODO do EV cert check
        // check for exception set by user
		if(actform.action.includes("http") && !(actform.action.includes("https"))){
			if(storage.exceptions.includes(passSec.domain +  "passSec-http") || storage.exceptions.includes(passSec.domain + "passSec-all") ){
				passSec.security = "none";
			}else{
				passSec.security = "http";
			}
		}
		else{
			if(storage.exceptions.includes(passSec.domain + "passSec-https") || storage.exceptions.includes(passSec.domain + "passSec-all")){
				passSec.security = "httpsEV";
			}else{
				passSec.security = "https";
			}
		}
		
    } else if (passSec.url.startsWith("http:")) {
        // check for exception set by user
        passSec.security = storage.exceptions.includes(passSec.domain + "passSec-http")? "none" : "http";
		// check if site offers https
        passSec.httpsAvailable = false;
        let httpsUrl = passSec.url.replace("http://", "https://");
        let httpsRequest = new XMLHttpRequest();
        httpsRequest.open("HEAD", httpsUrl);
        httpsRequest.onreadystatechange = function () {
            if (this.readyState === this.DONE) {
                passSec.httpsAvailable = this.status >= 200 && this.status <= 299 && this.responseURL.startsWith("https");
                // if there is an open tooltip while httpsAvailable switches to true, trigger focus event to reopen tooltip with correct content
                if (passSec.httpsAvailable === true)
                    $(':focus').focus();
            }
        };
        httpsRequest.send();
    }
}