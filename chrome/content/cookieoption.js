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
