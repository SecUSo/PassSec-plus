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
