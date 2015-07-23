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

// A page ist build by page>frame>form>field

ffpwwe.processDOM = function () {

    if (content == null) return;

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


//If the tab changes run our script again to prevent the tooltip from showing in other open tabs
var container = gBrowser.tabContainer;
container.addEventListener("TabShow", ffpwwe.processDOM, false);
