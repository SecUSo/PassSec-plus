var ffpwwe = ffpwwe || {};

ffpwwe.prefs = function () {
    const prefManager =
        Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefService)
            .getBranch("extensions.firefoxpasswordwarning.");
    return {
        getBoolPref: prefManager.getBoolPref,
        getIntPref: prefManager.getIntPref,
        getStringPref: prefManager.getCharPref,
        getComplexValue: prefManager.getComplexValue,
        setBoolPref: prefManager.setBoolPref,
        setIntPref: prefManager.setIntPref,
        setStringPref: prefManager.setCharPref,
        setComplexValue: prefManager.setComplexValue,
        /**
         * Resets the preferences of this addon
         */
        resetPrefs: function () {
            // TODO this is not yet implemented by firefox raises "NS_ERROR_NOT_IMPLEMENTED"
            //prefManager.resetBranch("");

            // TODO hence we reset all prefs manually
            prefManager.clearUserPref("usephishingwotdetection");
            prefManager.clearUserPref("usephishingsearchdetection");
            prefManager.clearUserPref("phishingsearchengine");
            prefManager.clearUserPref("firstrun");
            prefManager.clearUserPref("personalfields");
            prefManager.clearUserPref("searchfields");
            prefManager.clearUserPref("paymentfields");
            prefManager.clearUserPref("passwordfields");
            prefManager.clearUserPref("isbrokensecure");
			prefManager.clearUserPref("isbrokensecure");
        }
    };
}();

ffpwwe.prefsNetworkCookie = function () {
    const prefNetworkCookieManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("network.cookie.");

    return {
        getBoolPref: prefNetworkCookieManager.getBoolPref,
        getIntPref: prefNetworkCookieManager.getIntPref,
        getStringPref: prefNetworkCookieManager.getCharPref,
        getComplexValue: prefNetworkCookieManager.getComplexValue,
        setBoolPref: prefNetworkCookieManager.setBoolPref,
        setIntPref: prefNetworkCookieManager.setIntPref,
        setStringPref: prefNetworkCookieManager.setCharPref,
        setComplexValue: prefNetworkCookieManager.setComplexValue
    };
}();

ffpwwe.prefsCookieManager = function () {
    const prefNetworkCookieManager = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager);

    return prefNetworkCookieManager;
}();

ffpwwe.prefsLoginManager = function () {
    const prefLoginManager  = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);

    return prefLoginManager ;
}();
