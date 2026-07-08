/**
 *
 */
class SecurityState {
    static DomainTrustLevel = Object.freeze({
        DEVELOPER_TRUSTED: 'DEVELOPER_TRUSTED',
        USER_TRUSTED: 'USER_TRUSTED',
        USER_EXCEPTION: 'USER_EXCEPTION',
        UNKNOWN: 'UNKNOWN',
    });

    constructor({ domainTrustLevel = null, isSiteHttps = null, isFormHttps = null, isSameDomain = null } = {}) {
        this.domainTrustLevel = domainTrustLevel;
        this.isSiteHttps = isSiteHttps;
        this.isFormHttps = isFormHttps;
        this.isSameDomain = isSameDomain;
    }

    get isFullySecure() {
        return this.isSiteHttps === true && this.isFormHttps === true && this.isSameDomain === true;
    }
}


/**
 *
 * @type {{_determineDomainTrustLevel(*, *, *, *): string, getSecurityStatus(*, *): Promise<SecurityState>}}
 */
const SecurityStatus = {

    /**
     *
     * @param trustedList
     * @param userTrustedList
     * @param siteDomain
     * @param trustedListIsActivated
     * @returns {string}
     * @private
     */
    _determineDomainTrustLevel(trustedList, userTrustedList, siteDomain, trustedListIsActivated) {
        const { DomainTrustLevel } = SecurityState;

        if (trustedListIsActivated && trustedList.includes(siteDomain)) {
            return DomainTrustLevel.DEVELOPER_TRUSTED;
        }

        // todo: add userExceptions to the security calculation

        if (userTrustedList.includes(siteDomain)) {
            return DomainTrustLevel.USER_TRUSTED;
        }

        return DomainTrustLevel.UNKNOWN;
    },

    /**
     *
     * @param storage
     * @param formElement
     * @returns {Promise<SecurityState>}
     */
    async getSecurityStatus(storage, formElement) {
        if (!formElement) return new SecurityState();

        let formActionURL;
        try {
            formActionURL = new URL(formElement.action);
        } catch (e) {
            return new SecurityState();
        }

        const formActionDomain = PassSec.extractDomain(formActionURL.host);
        if (!formActionDomain) return new SecurityState();

        const domainTrustLevel = this._determineDomainTrustLevel(
            storage.trustedDomains,
            storage.userTrustedDomains,
            PassSec.domain,
            storage.trustedListActivated
        );

        const securityState = new SecurityState({
            domainTrustLevel,
            isSiteHttps: PassSec.location.startsWith("https"),
            isFormHttps: formElement.action.startsWith("https"),
            isSameDomain: PassSec.domain === formActionDomain
        });

        if (PassSec.location.startsWith("http://")) {
            PassSec.httpsAvailable = await browser.runtime.sendMessage({ type: "checkHttpsAvailable", httpURL: PassSec.location });
        }

        return securityState;
    },

    /**
     *
     * @param state
     * @returns {string}
     */
    getSecurityStateClass(state) {
        const { DomainTrustLevel } = SecurityState;

        if (state.domainTrustLevel === null) return "passSec-none";
        if (state.domainTrustLevel === DomainTrustLevel.USER_EXCEPTION) return "passSec-redException";
        if (state.isFullySecure) {
            switch (state.domainTrustlevel) {
                case DomainTrustLevel.DEVELOPER_TRUSTED: return "passSec-green";
                case DomainTrustLevel.USER_TRUSTED: return "passSec-blue";
                default: return "passSec-grey";
            }
        }

        return "passSec-red";
    }
}
