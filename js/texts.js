/**
 * fill tooltip with text
 */
function getTexts() {
    return '<span id="passSecWarning" class="http-warning"></span>' +
        '<hr class="http-warning">' +
        '<span id="passSecURL">' + chrome.i18n.getMessage("domainInfo") + '<span id="passSecDomain">' + passSec.domain + '</span>.</span>' +
        '<span id="passSecVerify">' + chrome.i18n.getMessage("verifyDomain") + '</span>' +
        '<div id="passSecPhishing" class="phish-warning">' +
        '<img id="passSecPhishingImage" src=' + chrome.extension.getURL("skin/red_triangle.png") + '>' +
        '<p id="passSecPhishingText">' + chrome.i18n.getMessage("phishWarning") + '</p>' +
        '</div>' +
        '<div id="passSecConsequence" class="http-warning">' +
        '<img id="passSecConsequenceImage" src=' + chrome.extension.getURL("skin/consequence.png") + '>' +
        '<p id="passSecConsequenceText"></p>' +
        '</div>' +
        '<div id="passSecRecommendation" class="http-warning littleText">' +
        '<img id="passSecRecommendationImage" src=' + chrome.extension.getURL("skin/recommendation.png") + '>' +
        '<p id="passSecRecommendationText">' + chrome.i18n.getMessage("recommendationHttps") + '</p>' +
        '</div>' +
        '<div id="passSecInfo" class="http-warning littleText">' +
        '<img id="passSecInfoImage" src=' + chrome.extension.getURL("skin/more_info.png") + '>' +
        '<p id="passSecInfoText">' + chrome.i18n.getMessage("moreInfo") + '</p>' +
        '</div>' +
        '<div id="passSecButtons>">' +
        '<button id="passSecButtonException" type="button"></button>' +
        '<button id="passSecButtonClose" type="button">' + chrome.i18n.getMessage("OK") + ' </button>' +
        '</div>';
}

/**
 * fill tooltip items with functionality
 */
function processTooltip() {
    let tooltip = passSec.tooltip;
    $(tooltip.find("#passSecButtonClose")[0]).on("mousedown", function (event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        passSec.api.destroy(true);
    });
    $(tooltip.find("#passSecRecommendationText")[0]).removeClass("passSecClickable");
    $(tooltip.find("#passSecButtonException")[0]).css("background-color", "white !important");
    $(tooltip.find("#passSecRecommendationText")[0]).unbind();
    switch (passSec.security) {
        case "https":
            $(tooltip.find("#passSecPhishing")).hide();
            $(tooltip.find("#passSecButtonException")[0]).html(chrome.i18n.getMessage("exceptionHTTP"));
            $(tooltip.find("#passSecButtonException")[0]).css("background-color", "red !important");
            $(tooltip.find("#passSecButtonException")[0]).click(function (event) {
                // TODO: add method that returns all possible targets
                $('input[type=password]').removeClass("passSec-https").addClass("passSec-httpsEV");
                $('input[type=search]').removeClass("passSec-https").addClass("passSec-httpsEV");
                passSec.security = "httpsEV";
                processTooltip();
            });
            $(tooltip.find("#passSecRecommendationText")[0]).addClass("passSecClickable");
            $(tooltip.find("#passSecRecommendationText")[0]).click(function (e) {
                if ($(this).html() === chrome.i18n.getMessage("recommendationHttps")) {
                    $(this).html(chrome.i18n.getMessage("MoreRecommendationsHttps"));
                }
                else {
                    $(this).html(chrome.i18n.getMessage("recommendationHttps"));
                }
            });
            getFieldText("Https");
            break;

        case "http":
            $(tooltip.find("#passSecPhishing")).hide();
            $(tooltip.find(".http-warning")).show();
            $(tooltip.find("#passSecButtonException")[0]).html(chrome.i18n.getMessage("exceptionHTTP"));
            $(tooltip.find("#passSecButtonException")[0]).css("background-color", "red !important");
            $(tooltip.find("#passSecButtonException")[0]).click(function (event) {
                $('input[type=password]').removeClass("passSec-http").addClass("passSec-httpsEV");
                $('input[type=search]').removeClass("passSec-http").addClass("passSec-httpsEV");
                passSec.security = "httpsEV";
                processTooltip();
            });
            getFieldText("Http");
            break;

        case "phish":
            $(tooltip.find(".http-warning")).show();
            $(tooltip.find("#passSecPhishing")).show();
            break;

        case "httpsEV":
            $(tooltip.find("#passSecButtonException")[0]).html(chrome.i18n.getMessage("exceptionHTTPS"));
            $(tooltip.find("#passSecPhishing")).hide();
            $(tooltip.find(".http-warning")).hide();
            $(tooltip.find("#passSecButtonException")[0]).click(function (event) {
                // TODO: for all input fields on the page
                $(passSec.target).addClass("passSecNoTooltip");
                $('.qtip').each(function () {
                    $(this).data('qtip').destroy();
                });
            });
            break;
    }
}

/**
 * fill the tooltip with texts corresponding to a certain fieldType
 * @param protocol: "Http" or "Https" // TODO: phish, httpsEV for later version
 */
function getFieldText(protocol) {
    let fieldType = passSec.target.type; // fieldType: "login", "payment", "personal", "search"
    console.log(fieldType + "is field type");
    console.log(protocol + "is protocol");
    // TODO: missing: payment, personal
    let t = passSec.tooltip;
    $(t.find("#passSecWarning")[0]).html(chrome.i18n.getMessage(fieldType + "Warning"));
    $(t.find("#passSecConsequenceText")[0]).html(chrome.i18n.getMessage(fieldType + "Consequence" + protocol));

    if (protocol === "Http") {
        $(t.find("#passSecRecommendationText")[0]).html(chrome.i18n.getMessage(fieldType + "Recommendation" + protocol));
    }
    else {
        $(t.find("#passSecRecommendationText")[0]).html(chrome.i18n.getMessage("recommendationHttps"));
    }

    $(t.find("#passSecInfoText")[0]).click(function (e) {
        if ($(this).html() === chrome.i18n.getMessage("moreInfo")) {
            $(this).html(chrome.i18n.getMessage(fieldType + "Info" + protocol));
        }
        else {
            $(this).html(chrome.i18n.getMessage("moreInfo"));
        }
    });
}

/**
 * extract the domain out of a given hostname
 */
function extractDomain(url, tld) {
    let split = url.split(".");
    if (split.length > 2) url = split[split.length - 2] + "." + split[split.length - 1];

    let arr = tld.split("\n").filter(function (value) {
        return value !== "" && !value.startsWith("//") && value.split(".").length >= 3
    });
    if (arr.toString().indexOf(url) > -1) {
        let arr2 = tld.split("\n").filter(function (value) {
            return value !== "" && !value.startsWith("//") && value.indexOf(url) > -1
        });
        let temp = "bla";
        if (split.length >= 3) temp = split[split.length - 3] + "." + split[split.length - 2] + "." + split[split.length - 1];
        if (arr2.indexOf(temp) > -1 || (arr2.indexOf("*." + url) > -1 && arr2.indexOf("!" + temp) === -1)) return temp;
    }
    return url;
}
