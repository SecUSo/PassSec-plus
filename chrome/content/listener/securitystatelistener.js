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


ffpwwe.securityStateListener = {

    // nsIWebProgressListener
    QueryInterface: XPCOMUtils.generateQI(["nsIWebProgressListener", "nsISupportsWeakReference"]),

    init: function () {
        gBrowser.addProgressListener(this);
    },

    uninit: function () {
        gBrowser.removeProgressListener(this);
    },

    /**
     * indicated the security state of the current page,
     */
    securityState: {
        href: "",
        verifiedSSL: false,
        usingSSL: false
    },

    onSecurityChange: function (aWebProgress, aRequest, aState) {
        var wb = Ci.nsIWebProgressListener;

        var isbrokensecure = ffpwwe.prefs.getBoolPref("isbrokensecure");
        var usingSSL = false;
        if (isbrokensecure) {
            usingSSL = !(aState & wb.STATE_IS_INSECURE);
        } else {
            usingSSL = !!(aState & wb.STATE_IS_SECURE);
        }

        // change the security state according to the input
        this.securityState = {
            href: aWebProgress.document.location.href,
            verifiedSSL: !!(aState & wb.STATE_IDENTITY_EV_TOPLEVEL),
            usingSSL: usingSSL,
            brokenSSL: !!(aState & wb.STATE_IS_BROKEN),
            insecure: !!(aState & wb.STATE_IS_INSECURE)
        };
    }
};

window.addEventListener("load", function () {
    ffpwwe.securityStateListener.init();
}, false);

window.addEventListener("unload", function () {
    ffpwwe.securityStateListener.uninit();
}, false);
