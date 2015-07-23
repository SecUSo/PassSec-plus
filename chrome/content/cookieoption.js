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


ffpwwe.cookieOption.showWindow = function ()
{
	if (document.hasFocus)
	{
		const windowWidth = 605;
		const windowHeight = 710;

		var dimension = ffpwwe.calcWindowPosition(windowWidth,windowHeight);

		cookieOptionWindow = window.openDialog("chrome://firefoxpasswordwarningextension/content/cookieoption.xul", "bmarks", "chrome, dialog, modal,width="+windowWidth+",height="+windowHeight+",top="+dimension.top+",left="+dimension.left+"");
		cookieOptionWindow.focus();
	}
};

ffpwwe.cookieOption.closeCookieWindow = function ()
{
	window.close();
};

ffpwwe.cookieOption.setCookiesOptionThirdParty = function (buttonStatus)
{
	if (buttonStatus == 1){
		ffpwwe.cookieOption.changeColorOfButton("ThirdParty", buttonStatus);
		ffpwwe.prefsNetworkCookie.setIntPref("cookieBehavior", 1);
	}
	else if (buttonStatus == 2){
		ffpwwe.cookieOption.changeColorOfButton("ThirdParty", 2)
		ffpwwe.prefsNetworkCookie.setIntPref("cookieBehavior", 0);
	}
};

ffpwwe.cookieOption.changeColorOfButton = function (buttonID, status)
{
	if (status == 1){
		document.getElementById(buttonID + "On").disabled = true;
		document.getElementById(buttonID + "On").style.backgroundColor = "rgb(37,226,103)";
		document.getElementById(buttonID + "Off").disabled = false;
		document.getElementById(buttonID + "Off").style.backgroundColor = "white";
	}
	else if (status == 2){
		document.getElementById(buttonID + "On").disabled = false;
		document.getElementById(buttonID + "On").style.backgroundColor = "white";
		document.getElementById(buttonID + "Off").disabled = true;
		document.getElementById(buttonID + "Off").style.backgroundColor = "red";
	}
}

ffpwwe.cookieOption.setCookiesOptionAfterClosing = function (buttonStatus)
{
	if (buttonStatus == 1){
		ffpwwe.prefsNetworkCookie.setIntPref("lifetimePolicy", 2);
		ffpwwe.cookieOption.changeColorOfButton("CookieClose", 1);
	}
	else if (buttonStatus == 2){
		ffpwwe.cookieOption.changeColorOfButton("CookieClose", 2);
		ffpwwe.prefsNetworkCookie.setIntPref("lifetimePolicy", 0);
	}

};

// called by window onLoad
ffpwwe.cookieOption.init = function ()
{
	if (ffpwwe.prefsNetworkCookie.getIntPref("cookieBehavior") == 0){
		document.getElementById("ThirdPartyOff").disabled = true;
		document.getElementById("ThirdPartyOn").disabled = false;
		document.getElementById("ThirdPartyOn").style.backgroundColor = "white";
		document.getElementById("ThirdPartyOff").style.backgroundColor = "red";
	}
	else {
		document.getElementById("ThirdPartyOff").disabled = false;
		document.getElementById("ThirdPartyOn").disabled = true;
		document.getElementById("ThirdPartyOff").style.backgroundColor = "white";
		document.getElementById("ThirdPartyOn").style.backgroundColor = "rgb(37,226,103)";
	}
	if (ffpwwe.prefsNetworkCookie.getIntPref("lifetimePolicy") == 0){
		document.getElementById("CookieCloseOff").disabled = true;
		document.getElementById("CookieCloseOn").disabled = false;
		document.getElementById("CookieCloseOn").style.backgroundColor = "white";
		document.getElementById("CookieCloseOff").style.backgroundColor = "red";
	}
	else {
		document.getElementById("CookieCloseOff").disabled = false;
		document.getElementById("CookieCloseOn").disabled = true;
		document.getElementById("CookieCloseOff").style.backgroundColor = "white";
		document.getElementById("CookieCloseOn").style.backgroundColor = "rgb(37,226,103)";
	}
};
