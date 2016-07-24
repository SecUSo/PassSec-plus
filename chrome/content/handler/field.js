var ffpwwe = ffpwwe || {};
var userVerified = false;

ffpwwe.getuserVerified = function () { return userVerified;};
ffpwwe.setuserVerified = function (buttonClicked) {
    userVerified = buttonClicked;
};

/**
 * Handles the behavior of a field, i.e.
 * processes the information and adds the style and popup behaviour
 *
 * @param page the surrounding pagehandler
 * @param frame the surrounding pagehandler
 * @param form information about the surrounding form
 * @param element the field
 * @param fieldType type of the field, e.g. "password"
 * @returns {{}}
 */
ffpwwe.fieldHandler = function (page, frame, form, element, fieldType) {

    var openPopupClosed1 = function(event) {
        page.popupClosedBefore = false;
        openOnClickPopup();
    };

    var  openPopupClosed2 = function(event) {
        if (!page.popupClosedBefore)
            openOnClickPopup();
    };

    ffpwwe.debug("Found password field " + element, true);
    // private functions

    function insertNewlines(text) {
        var numOfChars = 40;
        var words = text.split(" ");
        var output = "";
        var charCounter = 0;

        for (var i = 0; i < words.length; i++) {
            if (i !== 0)
                output += " ";
            if (words[i].indexOf("") != -1) {
                charCounter = 0;
            } else {
                if (charCounter > numOfChars) {
                    output += ""; // TODO
                    charCounter = 0;
                }
                charCounter += words[i].length;
            }
            output += words[i];
        }

        return output;
    }

    /**
     * adds the class to the element, if it is not already present
     */
    function addClass(element, className, shallAdd) {
        if (typeof(shallAdd) === 'undefined') shallAdd = true;
        if (shallAdd && !element.className.match(className)) {
            element.className += (!element.className ? "" : " ") + className;
        }
    }

    /**
     * adds the class to the element, if it is not already present
     */
    function removeClass(element, className) {
        if (element.className.match(className)) {
            // just replace the classname with nothing
            element.className = element.className.replace(className, "");
        }
    }

    /**
     * adds the warning style to the element
     */
    function addWarningStyle() {
        //Set the warnings which the user selected in the options
        addClass(element, "firefox-password-warning-border", ffpwwe.prefs.getBoolPref("border"));
        addClass(element, "firefox-password-warning-triangle", ffpwwe.prefs.getBoolPref("triangle"));
        addClass(element, "firefox-password-warning-background", ffpwwe.prefs.getBoolPref("background"));
    }

    /**
     * remove the secure style from the element
     */
    function removeSecureStyle() {
        removeClass(element, "firefox-password-ok-check");
        removeClass(element, "firefox-password-ok-border");
		    removeClass(element, "firefox-password-EV-check");
        removeClass(element, "firefox-password-secure-border");
    }

    /**
     * add the secure style to the element
     */
    function addSecureStyle() {
        addClass(element, "firefox-password-ok-check");
        addClass(element, "firefox-password-ok-border");
    }

    /**
     * add the secure style with extended validation to the element
     */
    function addEVSecureStyle() {
        addClass(element, "firefox-password-EV-check");
        addClass(element, "firefox-password-secure-border");
    }

	/**
     * adds the popup behaviour to the element
     */
    function addPopup() {
        // Add listener to the input field to show popup if it is set by the user
        if (ffpwwe.prefs.getBoolPref("popuponclick")) {
            element.addEventListener("click", openPopupClosed1, false);
            element.addEventListener("focus", openPopupClosed2, false);

			if (element.form && ffpwwe.loginManagerHandler.isLoginDataAvailable(page.href, element.form.action)) {
				// POLLING There is at least one way, but it's not a very good one.

				var showPopupAutomaticInterval = setInterval(function showPopupAutomatic() {
					if($(element).is(":visible") && element.value.length !== 0) {
						clearInterval(showPopupAutomaticInterval);
						if(ffpwwe.loginManagerHandler.isLoginDataAvailable(page.href,element.form.action)) {
							openOnClickPopup();
						}
					}
				}, 300);
			}
        }
    }

    /**
     * removes the popup behaviour from the element
     */
    function removePopup() {
        // Add listener to the input field to show popup if it is set by the user
        if (ffpwwe.prefs.getBoolPref("popuponclick")) {
            var old_element = element;
            var new_element = old_element.cloneNode(true);
            old_element.parentNode.replaceChild(new_element, old_element);
            addEVSecureStyle();
        }
    }

    function updateText(sslAvailable) {
        var strbundle = document.getElementById("firefoxpasswordwarning-strings");
        var numOfPWFields = form.numOfPwFields;
        var numOfOtherFields = form.numOfOtherFields;
        var currentCase;
        // var pageType;
        // var httpsState;

        if (fieldType == "password") {
            if (numOfPWFields == 1 && numOfOtherFields < 2) {
                currentCase = "login";
                // pageType = 0;
            } else if (numOfPWFields == 1 || (numOfPWFields == 2 && numOfOtherFields >= 2)) {
                currentCase = "register";
                // pageType = 1;
            } else if (numOfPWFields == 3 || (numOfPWFields == 2 && numOfOtherFields < 2)) {
                currentCase = "change";
                // pageType = 2;
            } else {
                currentCase = "reset";
                // pageType = 3;
            }
        } else if (fieldType == "payment" || fieldType == "personal" || fieldType == "search" || fieldType == "default") {
            currentCase = fieldType;
        }
        currentCase += "_";

        if (sslAvailable) {
            currentCase += "sslAvail";
            // httpsState = 1;
        } else {
            currentCase += "nossl";
            // httpsState = 0;
        }


        for (let i = 1; i <= 3; i++) {
            let warntext = $("#warntext" + i);

            if (strbundle.getString(currentCase + "_" + i + "_long") == "<no-text>") {
                warntext.attr("data-toggle", "<no-text>");
            } else {
                warntext.attr("data-toggle", insertNewlines(strbundle.getString(currentCase + "_" + i + "_long")));
            }
            warntext.text(insertNewlines(strbundle.getString(currentCase + "_" + i)));
        }
    }

    /**
     * Inserts the http warning into the popup panel
     */
    function showHttpWarning() {
        var $httpWarning = $(".http-warning");
        $httpWarning.show();
        let gotoHttpsLink = document.getElementById('popuplink');
        let disableLink = document.getElementById('disableLink');
        let updateView = function (sslAvailable) {
            // set the buttons visibility
            gotoHttpsLink.hidden = !sslAvailable;
            disableLink.hidden = sslAvailable;
            // update the text
            updateText(sslAvailable);
        };

        if (page.sslAvailableCheck.done) {
            gotoHttpsLink.url = page.sslAvailableCheck.sslUrl;
            updateView(page.sslAvailableCheck.sslAvailable);
        } else {
            updateView(false);
            page.sslAvailableCheck.promise.then(function (sslAvailable) {
                if (sslAvailable) {
                    gotoHttpsLink.url = page.sslAvailableCheck.sslUrl;
                    updateView(true);
                }
            });
        }
    }

    var phishingPageHandler = {
        isPhishingPage: false,
        showPhishingBox: function () {
        }
    };

    /**
     * Processes the phishing detection over the web of trust
     *
     * @param detection an object to handle the different detection types
     * @param showPhishingBox a function to show a phishing box if phishing happens
     */
    function processPhishingWotDetection(detection, showPhishingBox) {
        page.phishingDetectionPromise.wot.then(function (response) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(response, "text/html");
            var warningElements = doc.getElementsByClassName("group-negative");

            for (var i = 0; i < warningElements.length; i++) {
                if (warningElements[i]) {
                    let linkElements = warningElements[i].getElementsByTagName("a");
                    if (linkElements.length > 0 &&
                        linkElements[0].childNodes[0].nodeValue !== null &&
                        linkElements[0].childNodes[0].nodeValue.search("Phishing") != -1) {
                        detection.wot = true;
                        showPhishingBox("phishing_text_2", undefined);
                    }
                }
            }
        });
    }

    /**
     * Processes the Phishing detection by performing a search query and looking for suggested corrections
     * Adds the appropriate phishing-warning to the panel
     */
    function processPhishingDetection() {
        var strbundle = document.getElementById("firefoxpasswordwarning-strings");

        var detection = {
            search: false,
            wot: false
        };

        function showPhishingBox(text, suggestion) {
            removeSecureStyle();
            addWarningStyle();

            phishingPageHandler.isPhishingPage = true;
            phishingPageHandler.showPhishingBox = function () {
                $(".http-warning").hide();
                $(".urlprun-allow").hide();
                if (suggestion !== undefined) {
                    $("#phishingtext").html(strbundle.getString(text).replace("<insert-url>", suggestion));
                    let switchSite = document.getElementById('switchToSite');
                    switchSite.url = "http://" + suggestion;
                    switchSite.hidden = false;
                } else {
                    $("#phishingtext").text(strbundle.getString(text));
                }
                // Update the visibility of the other buttons
                document.getElementById('popuplink').hidden = true;
                document.getElementById("disableLink").hidden = false;

                // Show the warning
                $(".phishing-warning").show();
								$(".phishing-warning-switch").show();
            };
        }

        processPhishingWotDetection(detection, showPhishingBox);
    }


    function openOnClickPopup() {

        var panel = document.getElementById('warnpanel2');
        var strbundle = document.getElementById("firefoxpasswordwarning-strings");

        //Hide all Panels/Boxes
        var $httpWarning = $(".http-warning");
        var $phishingWarning = $(".phishing-warning");
		    var $phishingWarningSwitch = $(".phishing-warning-switch");
        var $urlprunButtons = $(".urlprun-allow");
        $httpWarning.hide();
        $phishingWarning.hide();
        $urlprunButtons.hide();
		    $phishingWarningSwitch.hide();

        // prune the url
        var domain = page.domain || "???";

        // insert whitespaces
        var domainDisplay = domain.split("").join(" ");


        url_prun_1 = strbundle.getString("url_pruning_text_1");
        url_prun_2 = strbundle.getString("url_pruning_text_2").replace(/<insert-url>/g, domainDisplay);
        url_prun_3 = strbundle.getString("url_pruning_text_3");
        url_prun = url_prun_1 + " <html:b>" + ffpwwe.escapeHTML(url_prun_2) + "</html\:b>.<html\:br />" + url_prun_3;

        $("#urlpruningtext").html(url_prun);

        // Update the Standard-Warning to the appropriate fieldType
        $("#standardwarning").html(strbundle.getString(fieldType + "_warning"));

        // highlight http warnings
        if (!page.usingSSL || !form.linkedSSL) {
            showHttpWarning();
        } else {
            $urlprunButtons.show();
        }

        //processPhishingDetection();
        phishingPageHandler.showPhishingBox();

        // open the popup
		ffpwwe.fieldHandler.element = element;
        panel.openPopup(element, 'after_start', 0, 0, false, false);
    }


    var showHttp = !ffpwwe.db.isInside("pageExceptions", content.document.location.host);
    var isURLPrun = ffpwwe.db.isInside("userVerifiedDomains", content.document.location.host);

    // insecure: no secure connection
    var insecure = !page.usingSSL || !form.linkedSSL;
    // validated: extended validation SSL or the user has checked the page
    var validated = page.verifiedSSL || isURLPrun;

    if (ffpwwe.getuserVerified()) {
        addEVSecureStyle();
        removePopup();
    }

    if (insecure)
        addWarningStyle();
    else if (!validated)
        addSecureStyle();
    else
        addEVSecureStyle();

    if ((insecure && showHttp) || !validated)
        addPopup();

    if (!validated)
        processPhishingDetection();

    return {};
};
