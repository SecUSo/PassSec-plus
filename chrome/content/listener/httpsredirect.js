var ffpwwe = ffpwwe || {};

ffpwwe.httpsRedirectObserver = {
    observe: function (subject, topic, data) {
        if (topic == "http-on-modify-request") {
            var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);

            if (ffpwwe.db.isInside("httpToHttpsRedirects", httpChannel.URI.host) && httpChannel.URI.schemeIs("http")) {
                Components.utils.import("resource://gre/modules/Services.jsm");
                let newUrl = httpChannel.URI.asciiSpec.replace("http:", "https:");
                ffpwwe.debug("redirect from '" + httpChannel.URI.asciiSpec + "' to '" + newUrl + "'");
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
