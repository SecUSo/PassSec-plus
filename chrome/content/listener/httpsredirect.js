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

ffpwwe.httpsRedirectObserver = {
    observe: function (subject, topic, data) {
        var statusButton = document.getElementById('toolbarButton');

        //var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);

        if (topic == "http-on-modify-request") {
            var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);

            /*if (ffpwwe.prefs.getBoolPref("forwardAutomatically") && httpChannel.URI.schemeIs("http")){
                Components.utils.import("resource://gre/modules/Services.jsm");
                let newUrl = httpChannel.URI.asciiSpec.replace("http:", "https:");
                ffpwwe.debug("redirect from '" + httpChannel.URI.asciiSpec + "' to '" + newUrl + "'");

                httpChannel.redirectTo(Services.io.newURI(newUrl, null, null));
            }
            else*/ if (ffpwwe.db.isInside("httpToHttpsRedirects", httpChannel.URI.host) && httpChannel.URI.schemeIs("http") && ffpwwe.getHttpsRidirectState()) {
                Components.utils.import("resource://gre/modules/Services.jsm");
                let newUrl = httpChannel.URI.asciiSpec.replace("http:", "https:");
                ffpwwe.debug("redirect from '" + httpChannel.URI.asciiSpec + "' to '" + newUrl + "'");

                statusButton.setAttribute('value', 'redirected');
                statusButton.setAttribute('tooltiptext', 'Sie wurden automatisch weitergeleitet!');

                httpChannel.redirectTo(Services.io.newURI(newUrl, null, null));
            }
        }
    },

    get observerService() {
        return Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
    },

    register: function () {
        this.observerService.addObserver(this, "http-on-modify-request", false);
    },

    unregister: function () {
        this.observerService.removeObserver(this, "http-on-modify-request");
    }
};

window.addEventListener("load", function () {
    ffpwwe.httpsRedirectObserver.register();
}, false);
window.addEventListener("unload", function () {
    ffpwwe.httpsRedirectObserver.unregister();
}, false);
