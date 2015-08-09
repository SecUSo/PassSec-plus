/*=========================================================================
 * PassSec+ is a Firefox extension which should prevent the user from
 * entering sensitive data on insecure websites. Additionally it should
 * help the user to choose privacy friendly cookie settings.
 * Copyright (C) 2015 SecUSo
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *=========================================================================*/

var ffpwwe = ffpwwe || {};

ffpwwe.cookieOption = ffpwwe.cookieOption || {};

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

            ffpwwe.prefsNetworkCookie.setIntPref("cookieBehavior", prefManager.getIntPref("cookieBehavior_reset"));
            ffpwwe.prefsNetworkCookie.setIntPref("lifetimePolicy", prefManager.getIntPref("lifetimePolicy_reset"));
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
