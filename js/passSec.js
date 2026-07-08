const PassSec = {
    //
    domain: null,
    //
    httpsAvailable: null,
    // the location href of the website on which the extension works atm
    location: null,
    //
    publicSuffixList: null,
    //
    websiteProtocol: null,

    /**
     *
     * @param address
     * @returns {boolean}
     */
    isIP(address) {
        const ipWithProtocol = /^http[s]?:\/\/((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])/;
        const ipWithoutProtocol = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])/;
        return ipWithProtocol.test(address) || ipWithoutProtocol.test(address);
    },

    /**
     *
     * @param hostname
     * @returns {string|*}
     */
    extractDomain(hostname) {
        if (this.isIP(hostname)) return hostname;
        const psl = this.publicSuffixList.getDomain(hostname);
        return psl !== "" ? psl : hostname;
    },

    info() {
        console.log(`current PassSec variables: domian: ${this.domain}, location: ${this.location}, protocoll: ${this.websiteProtocol}, httpsAvailable: ${this.httpsAvailable}`);
    }
}
