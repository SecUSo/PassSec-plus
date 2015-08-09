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

ffpwwe.loginManagerHandler = function () {

	function createLoginInfoObject() {
		return new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",Components.interfaces.nsILoginInfo,"init");
	}

	function getFormSubmitURL(originalFormSubmitURL) {
		// original = https://web.de/ right = https://web.de
		var tempFormSubmitURL = originalFormSubmitURL.replace(/\/\//g,'aa');
		return originalFormSubmitURL.substr(0,tempFormSubmitURL.indexOf('/'));
	}

	function getPageHref(originalPageURL) {
		// original = https://login.web.de/intern/login?hal=true   right = https://login.web.de

		var pageHref = originalPageURL;
		if (pageHref.charAt(pageHref.length-1) == '/') {
			pageHref = pageHref.substr(0,pageHref.length-1);
		}
		return pageHref;
	}

	function getLoginData(pageURL,formSubmitURl) {
		var hostname = getPageHref(pageURL);
		var formURL = getFormSubmitURL(formSubmitURl);
		var httprealm = null;

		try	{
			// Find users for the given parameters
			return ffpwwe.prefsLoginManager.findLogins({}, hostname, formURL, httprealm);
		}

		catch(ex) {
			return null;
		}
	}

    return {
        isLoginDataAvailable: function (pageURL,formSubmitURl) {
			var logins = getLoginData(pageURL,formSubmitURl);

			if (logins.length > 0) {
				return true;
			}
			return false;
        },

        changeLoginDataToHttps: function (oldURL,newURL,formSubmitURL) {
			var nsLoginInfo = createLoginInfoObject();
			var logins = getLoginData(oldURL,formSubmitURL);

			if(logins.length > 0) {
				for (var i = 0; i < logins.length; i++)	{
					var formLoginInfo = new nsLoginInfo (
						getPageHref(newURL),
						logins[i].formSubmitURL,
						null,
						logins[i].username,
						logins[i].password,
						logins[i].usernameField,
						logins[i].passwordField
					);
					ffpwwe.prefsLoginManager.addLogin(formLoginInfo);
				}
				return true;
			}
			return false;
        },
    };
}();
