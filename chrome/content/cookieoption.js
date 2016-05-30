/*=========================================================================
 * PassSec+ is a Firefox extension which should prevent the user from
 * entering sensitive data on insecure websites. Additionally it should
 * help the user to choose privacy friendly cookie settings.
 * Copyright (C) 2016 SECUSO
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

ffpwwe.cookieOption.showWindow = function () {
	if (document.hasFocus) {
		const windowWidth = 950;
		const windowHeight = 695;

		var dimension = ffpwwe.calcWindowPosition(windowWidth,windowHeight);
		cookieOptionWindow = window.openDialog("chrome://firefoxpasswordwarningextension/content/cookieoption.xul", "bmarks", "chrome, dialog, modal,width="+windowWidth+",height="+windowHeight+",top="+dimension.top+",left="+dimension.left+"");
		cookieOptionWindow.focus();
	}
};

// On initialization, set the images according to the preferences
ffpwwe.cookieOption.init = function() {
    if (ffpwwe.prefsNetworkCookie.getIntPref("cookieBehavior") === 0) {
        document.getElementById("SaveThirdParty").src = "chrome://firefoxpasswordwarningextension/skin/not_checked.png";
    } else {
        document.getElementById("SaveThirdParty").src = "chrome://firefoxpasswordwarningextension/skin/checked.png";
    }
    if (ffpwwe.prefsNetworkCookie.getIntPref("lifetimePolicy") === 0) {
        document.getElementById("CloseThirdParty").src = "chrome://firefoxpasswordwarningextension/skin/not_checked.png";
    } else {
        document.getElementById("CloseThirdParty").src = "chrome://firefoxpasswordwarningextension/skin/checked.png";
    }
};

// Switches the images between checked and unchecked
ffpwwe.cookieOption.switchCheckbox = function(id) {
    if (document.getElementById(id).src == "chrome://firefoxpasswordwarningextension/skin/not_checked.png") {
        document.getElementById(id).src = "chrome://firefoxpasswordwarningextension/skin/checked.png";
    } else if (document.getElementById(id).src == "chrome://firefoxpasswordwarningextension/skin/checked.png") {
        document.getElementById(id).src = "chrome://firefoxpasswordwarningextension/skin/not_checked.png";
    }
};

// Checks the status of the images and sets the cookie preferences accordingly
ffpwwe.cookieOption.saveCookieSettings = function() {
    if (document.getElementById("CloseThirdParty").src == "chrome://firefoxpasswordwarningextension/skin/not_checked.png") {
        ffpwwe.prefsNetworkCookie.setIntPref("lifetimePolicy", 0);
    } else if (document.getElementById("CloseThirdParty").src == "chrome://firefoxpasswordwarningextension/skin/checked.png") {
        ffpwwe.prefsNetworkCookie.setIntPref("lifetimePolicy", 2);
    }

    if (document.getElementById("DeleteCookies").src == "chrome://firefoxpasswordwarningextension/skin/checked.png") {
        ffpwwe.prefsCookieManager.removeAll();
    }

    if (document.getElementById("SaveThirdParty").src == "chrome://firefoxpasswordwarningextension/skin/not_checked.png") {
        ffpwwe.prefsNetworkCookie.setIntPref("cookieBehavior", 0);
    } else if (document.getElementById("SaveThirdParty").src == "chrome://firefoxpasswordwarningextension/skin/checked.png") {
        ffpwwe.prefsNetworkCookie.setIntPref("cookieBehavior", 1);
    }
    ffpwwe.cookieOption.closeCookieWindow()
};

// Closes the cookie window
ffpwwe.cookieOption.closeCookieWindow = function() {
    window.close();
};
