/**
 *   get security status of website
 */
function getSecurityStatus() {
    if (passSec.url.startsWith("https")) {
        passSec.security = "https";
    } else {
        passSec.security = "http";
    }
}
