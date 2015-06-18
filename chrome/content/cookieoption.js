var ffpwwe = ffpwwe || {};

ffpwwe.cookieOption = ffpwwe.cookieOption || {};


ffpwwe.cookieOption.showWindow = function ()
{
	function calcWindowPosition(windowWidth,windowHeight)
	{
		var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
		var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

		width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
		height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

		if(width < screen.width && height < screen.height)
		{
			width = screen.width;
			height = screen.height;
		}

		var left = ((width / 2) - (windowWidth / 2)) + dualScreenLeft;
		var top = ((height / 2) - (windowHeight / 2)) + dualScreenTop;

		return{
			top: top,
			left: left
		};
	}

	if (document.hasFocus)
	{
		const windowWidth = 605;
		const windowHeight = 710;

		var dimension = calcWindowPosition(windowWidth,windowHeight);

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
