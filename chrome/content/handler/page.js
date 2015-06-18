var ffpwwe = ffpwwe || {};

/**
 * Handles the page in the current tab/current content
 *
 * @returns {*}
 */
ffpwwe.pageHandler = function () {

    /*
     private functions
     */
    function findFrames(startFrame, allFrames) {
        allFrames.push(startFrame);
        if (startFrame.frames) {
            for (let i = 0; i < startFrame.frames.length; i++) {
                findFrames(startFrame.frames[i], allFrames);
            }
        }
        var iframes = (startFrame.document || startFrame.contentDocument).getElementsByTagName("IFRAME");
        for (let i = 0; i < iframes.length; i++) {
            findFrames(iframes[i], allFrames);
        }
    }

    function sslAvailableCheck() {
        var url = content.document.location.href;
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
                resolve(false)
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
            sslAvailableCheck.sslUrl = sslUrl
        });

        return sslAvailableCheck;
    }

    var domain = ffpwwe.pruneURL(content.document.location);
    // for testing the phishing detection change the domain to
    // a domain which gets corrected by google/startpage
    //domain = "wbe.de";
    // a domain with no search results on the first page
    //domain = "teno-xclpvvl.com";
    // a domain which is marked as a phishing page by the Web Of Trust
    //domain = "moy.su";


    function createPhishingDetectionSearchPromise() {
        var searchEngine = ffpwwe.prefs.getStringPref("phishingsearchengine");
        var executeSearch = ffpwwe.prefs.getBoolPref("usephishingsearchdetection");

        if (!executeSearch || !domain) {
            return new Promise(function (resolve, reject) {
                    if (executeSearch) ffpwwe.debug("no phishing detection search ist running, not a valid DOMAIN");
                    else ffpwwe.debug("no phishing detection search ist running, option is disabled");
                }
            );
        } else {

            let searchPromise = new Promise(function (resolve, reject) {
                ffpwwe.debug("starting phishing detection search using '" + searchEngine + "' on domain '" + domain + "'");

                var processResult = function (response) {
                    // it seems only one argument is passed through, therefore we use an array
                    resolve([searchEngine, domain, response]);
                };

                switch (searchEngine) {
                    case "startpage":
                        var postData = "cat=web&cmd=process_search&language=english&engine0=v1all&query=" + domain + "&abp=-1&x=0&y=0";
                        $.post("https://startpage.com/do/search", postData, processResult);
                        break;
                    case "google":
                        $.get("https://www.google.de/search?q=" + domain, processResult);
                        break;
                    default:
                        ffpwwe.debug("phishing detection search unkown search engine: '" + searchEngine + "'")
                }

            });

            searchPromise.then(function () {
                ffpwwe.debug("phishing detection search request done")
            });

            return searchPromise;
        }
    }

    function createPhishingDetectionWotPromise() {
        var executeWot = ffpwwe.prefs.getBoolPref("usephishingwotdetection");

        if (!executeWot) {
            return new Promise(function (resolve, reject) {
                    ffpwwe.debug("no phishing detection wot ist running, option is disabled");
                }
            );
        } else {
            let wotPromise = new Promise(function (resolve, reject) {
                ffpwwe.debug("starting phishing detection wot on domain '" + domain + "'");

                var processResult = function (response) {
                    // it seems only one argument is passed through, therefore we use an array
                    resolve([response]);
                };

                $.get("https://www.mywot.com/en/scorecard/" + domain, processResult);
            });

            wotPromise.then(function () {
                ffpwwe.debug("phishing detection wot request done")
            });

            return wotPromise;
        }
    }

    function createPhishingDetectionPromise() {
        return {
            search: createPhishingDetectionSearchPromise(),
            wot: createPhishingDetectionWotPromise()
        };
    }

    /*
     constructor
     */
    //Is the current page using SSL and is the linked page where the form leads to encrypted??
    var securityState = ffpwwe.securityStateListener.securityState;
    //var usingSSL = document.location.protocol == "https:";
    let firstHref = ffpwwe.pruneFirstPartURL(content.document.location.href);
    let firstSecHref = ffpwwe.pruneFirstPartURL(securityState.href);

    var correctPage = firstHref == firstSecHref;

    if (!correctPage)
        ffpwwe.debug("Security state is for wrong page, is: \n" + firstSecHref +
        ", but should be:\n" + firstHref);

    // if it is an http exception do nothing
    var isHttpException = function () {
        return ffpwwe.db.isInside("pageExceptions", content.document.location.host);
    };
    if (isHttpException()) {
        ffpwwe.debug("Page is an exception '" + content.document.location.host + "'");
        return {
            href: content.document.location.href,
            domain: domain,
            usingSSL: correctPage && securityState.usingSSL,
            verifiedSSL: correctPage && securityState.verifiedSSL,
            sslAvailableCheck: undefined,
            phishingDetectionPromise: undefined,
            popupClosedBefore: false,
            parseDocument: function () {
            }
        };
    }

    // create this page object
    var page = {
        href: content.document.location.href,
        domain: domain,
        brokenSSL: correctPage && securityState.brokenSSL,
        usingSSL: correctPage && securityState.usingSSL,
        verifiedSSL: correctPage && securityState.verifiedSSL,
        sslAvailableCheck: sslAvailableCheck(),
        phishingDetectionPromise: createPhishingDetectionPromise(),
        popupClosedBefore: false
    };


    ffpwwe.debug("verifiedSSL: " + page.verifiedSSL + ", usingSSL: " + page.usingSSL);

    page.parseDocument = function () {
        // if it is an http exception do nothing
        if (isHttpException()) return;


        ffpwwe.debug("----------------------------------------------------------------------------", true);
        ffpwwe.debug("Parsing Document: '" + page.href + "'", true);
        // get all Frames
        var allFrames = [];
        findFrames(content, allFrames);
        // use the framehandler to parse the frames

        ffpwwe.debug("Found " + allFrames.length + " frames", true);

        page.frames = allFrames.map(function (frame) {
            return ffpwwe.frameHandler(page, frame.document || frame.contentDocument);
        });
    };

    return page;
};
