/*=========================================================================
 * PassSec+ is a Firefox extension which should prevent the user from
 * entering sensitive data on insecure websites. Additionally it should
 * help the user to choose privacy friendly cookie settings.
 * Copyright (C) 2015 SECUSO
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
            window.openDialog('chrome://firefoxpasswordwarningextension/content/options.xul');
            break;
    }
};

ffpwwe.getHttpsRidirectState = function () {
    return httpsRedirectEnabled;
};

ffpwwe.onTabChange = function () {
    var statusButton = document.getElementById('toolbarButton');

    if (statusButton != null) {
        if(ffpwwe.getHttpsRidirectState()) {
            statusButton.setAttribute('value', 'redirectOn');
            statusButton.setAttribute('tooltiptext', document.getElementById("firefoxpasswordwarning-strings").getString("forward_active"));
        }
        else {
            statusButton.setAttribute('value', 'redirectOff');
            statusButton.setAttribute('tooltiptext', document.getElementById("firefoxpasswordwarning-strings").getString("forward_inactive"));
        }
    }
};

// A page ist build by page>frame>form>field

ffpwwe.processDOM = function () {
    if (content === null) return;

    //ffpwwe.prefs.setIntPref("starts", 0);
    //Hide the popup initially
    document.getElementById('warnpanel2').hidePopup();
    var location = content.document.location;

    if (location == "about:home" || location == "about:newtab")
        return;

    ffpwwe.page = ffpwwe.page || ffpwwe.pageHandler();
    ffpwwe.page = (ffpwwe.page.href == location.href) ? ffpwwe.page : ffpwwe.pageHandler();
    ffpwwe.page.parseDocument();

    if (ffpwwe.prefs.getBoolPref("checkExceptionAuto")){
        var starts = ffpwwe.prefs.getIntPref("starts");
        var interval = ffpwwe.prefs.getIntPref("exception_interval");
        
        if(starts > interval - 1) {
            ffpwwe.prefs.setIntPref("starts", 0);
            const windowWidth = 300;
            const windowHeight = 140;
            var dimension = ffpwwe.calcWindowPosition(windowWidth,windowHeight);

            var params = {inn:{question: document.getElementById("firefoxpasswordwarning-strings").getString("check_Exceptions")}, out:{accept:false}};
            window.openDialog("chrome://firefoxpasswordwarningextension/content/dialog/checkExceptions.xul", "bmarks", "chrome, centerscreen, resizable=no, dialog, modal,width="+windowWidth+",height="+windowHeight+",top="+dimension.top+",left="+dimension.left+"",params);

            if(params.out.accept) {
                ffpwwe.checkForHttps();
            }
        }
    }
};

ffpwwe.checkForHttps = function () {
    var pageExceptions = ffpwwe.db.getAll("pageExceptions");

    for (var i = 0; i < pageExceptions.length; i++) {
        ffpwwe.sslAvailableCheck(pageExceptions[i]);
    }

    const windowWidth = 300;
    const windowHeight = 100;
    var dimension = ffpwwe.calcWindowPosition(windowWidth,windowHeight);
    var checkDone = {inn:{message: document.getElementById("firefoxpasswordwarning-strings").getString("exception_check_done")}};
    window.openDialog("chrome://firefoxpasswordwarningextension/content/dialog/messageInformation.xul", "bmarks", "chrome, centerscreen, dialog,resizable=no, modal,width="+windowWidth+",height="+windowHeight+",top="+dimension.top+",left="+dimension.left+"",checkDone);
};

ffpwwe.sslAvailableCheck = function (checkUrl) {
    var url = checkUrl;

    if(!url.startsWith("http://")) {
        url = "http://" + url;
    }

    var sslUrl = url.replace("http://", "https://");
    var sslAvailableCheckPromise = new Promise(function (resolve, reject) {
        
        if (url.match(/http:/)) {
            ffpwwe.debug("starting ssl availability check for '" + sslUrl + "'");
            var httpsRequest = new XMLHttpRequest();
            httpsRequest.open("HEAD", sslUrl);
            httpsRequest.onreadystatechange = function () {
                
                if (this.readyState == this.DONE) {
                    let sslAvail = this.status >= 200 && this.status <= 299 && !!this.responseURL.match(/https:/);
                    // test async
                    //window.setTimeout(function () { resolve(sslAvail, sslUrl); }, 5000);
                    ffpwwe.debug("ssl availability check done with result: " + sslAvail);
                    resolve(sslAvail);
                }
            };
            httpsRequest.send();
        } else {
            // if the page was not a http page, https cannot be available
            resolve(false);
        }
    });
    var sslAvailableCheck = {
        promise: sslAvailableCheckPromise,
        done: false,
        sslAvailable: undefined,
        sslUrl: undefined
    };
    sslAvailableCheckPromise.then(function (sslAvailable) {
        sslAvailableCheck.done = true;
        sslAvailableCheck.sslAvailable = sslAvailable;
        sslAvailableCheck.sslUrl = sslUrl;
        
        if(sslAvailable) {
            ffpwwe.db.insert("httpToHttpsRedirects", url);
            ffpwwe.db.insert("userVerifiedDomains", url);
            ffpwwe.db.deleteItem("pageExceptions", "url", checkUrl);
        }
    });

    return sslAvailableCheck;
};


ffpwwe.debug("STARTING...");

//Everytime the DOMContent is loaded the .init method starts
window.addEventListener("DOMContentLoaded", ffpwwe.processDOM, false);

//If the tab changes run our script again to prevent the tooltip from showing in other open tabs
var container = gBrowser.tabContainer;
container.addEventListener("TabShow", ffpwwe.processDOM, false);
container.addEventListener("TabClose", ffpwwe.processDOM, false);
container.addEventListener("TabSelect", ffpwwe.onTabChange, false);
