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

var httpsRedirectEnabled = true;

ffpwwe.toolbarButtonClick = function(event) {
    var statusButton = document.getElementById('toolbarButton');

    switch(event.button) {
        case 0: // Left click
            httpsRedirectEnabled = !httpsRedirectEnabled;
            if(httpsRedirectEnabled) {
                statusButton.setAttribute('value', 'redirectOn');
                statusButton.setAttribute('tooltiptext', document.getElementById("firefoxpasswordwarning-strings").getString("forward_active"));
            }
            else {
                statusButton.setAttribute('value', 'redirectOff');
                statusButton.setAttribute('tooltiptext', document.getElementById("firefoxpasswordwarning-strings").getString("forward_inactive"));
            }
            break;
        case 1: // Middle click
            //alert("Mittel Klick");
            break;
        case 2: // Right click
            //alert("Rechts Klick");
            break;
    }
};

ffpwwe.getHttpsRidirectState = function () {
    return httpsRedirectEnabled;
};

ffpwwe.onTabChange = function () {

    var statusButton = document.getElementById('toolbarButton');
    if(ffpwwe.getHttpsRidirectState()) {
        statusButton.setAttribute('value', 'redirectOn');
        statusButton.setAttribute('tooltiptext', document.getElementById("firefoxpasswordwarning-strings").getString("forward_active"));
    }
    else {
        statusButton.setAttribute('value', 'redirectOff');
        statusButton.setAttribute('tooltiptext', document.getElementById("firefoxpasswordwarning-strings").getString("forward_inactive"));
    }
};

// A page ist build by page>frame>form>field

ffpwwe.processDOM = function () {

    if (content === null) return;

    //Hide the popup initially
    document.getElementById('warnpanel2').hidePopup();
    var location = content.document.location;

    ffpwwe.page = ffpwwe.page || ffpwwe.pageHandler();
    ffpwwe.page = (ffpwwe.page.href == location.href) ? ffpwwe.page : ffpwwe.pageHandler();
    ffpwwe.page.parseDocument();
};

ffpwwe.debug("STARTING...");

//Everytime the DOMContent is loaded the .init method starts
window.addEventListener("DOMContentLoaded", ffpwwe.processDOM, false);

/*Debugging the exception checker*/
ffpwwe.db.insert("pageExceptions","web.de");
ffpwwe.db.insert("pageExceptions","http://www.gmx.net");
ffpwwe.db.insert("pageExceptions","http://www.google.de");
ffpwwe.db.insert("pageExceptions","http://www.kicker.de");
/**/

//If the tab changes run our script again to prevent the tooltip from showing in other open tabs
var container = gBrowser.tabContainer;
container.addEventListener("TabShow", ffpwwe.processDOM, false);
container.addEventListener("TabSelect", ffpwwe.onTabChange, false);
