var ffpwwe = ffpwwe || {};

ffpwwe.httpsRedirectObserver = {
    observe: function (subject, topic, data) {
        var statusButton = document.getElementById('toolbarButton');

        //var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);

        if (topic == "http-on-modify-request") {
            var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);

            if (ffpwwe.db.isInside("httpToHttpsRedirects", httpChannel.URI.host) && httpChannel.URI.schemeIs("http") && ffpwwe.getHttpsRedirectState()) {
                Components.utils.import("resource://gre/modules/Services.jsm");
                let newUrl = httpChannel.URI.spec.replace("http:", "https:");
                ffpwwe.debug("redirect from '" + httpChannel.URI.asciiSpec + "' to '" + newUrl + "'");

                if (statusButton != null) {
                    statusButton.setAttribute('value', 'redirected');
                    statusButton.setAttribute('tooltiptext', document.getElementById("firefoxpasswordwarning-strings").getString("forward_done"));
                }
                
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
