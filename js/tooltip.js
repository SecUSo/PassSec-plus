/**
 * Returns the HTML skeleton for a tooltip
 */
function getTooltipHTML() {
    return '<span id="passSecWarning" class="http-warning"></span>' +
        '<hr class="http-warning">' +
        '<span id="passSecURL">' + browser.i18n.getMessage("domainInfo") + '<span id="passSecDomain">' + passSec.domain + '</span>.</span>' +
        '<span id="passSecVerify">' + browser.i18n.getMessage("verifyDomain") + '</span>' +
        '<div id="passSecConsequence" class="http-warning">' +
        '<img id="passSecConsequenceImage" src=' + browser.extension.getURL("skin/consequence.png") + '>' +
        '<p id="passSecConsequenceText"></p>' +
        '</div>' +
        '<div id="passSecRecommendation" class="http-warning littleText">' +
        '<img id="passSecRecommendationImage" src=' + browser.extension.getURL("skin/recommendation.png") + '>' +
        '<p id="passSecRecommendationText"></p>' +
        '</div>' +
        '<div id="passSecInfo" class="http-warning littleText">' +
        '<img id="passSecInfoImage" src=' + browser.extension.getURL("skin/more_info.png") + '>' +
        '<p id="passSecInfoText" class="passSecClickable">' + browser.i18n.getMessage("moreInfo") + '</p>' +
        '</div>' +
        '<div id="passSecButtons>">' +
        '<button id="passSecButtonException" type="button"></button>' +
        '<button id="passSecButtonClose" type="button">' + browser.i18n.getMessage("OK") + ' </button>' +
        '</div>';
}

/**
 * Adds functionality for the tooltip elements
 */
function processTooltip() {
    let tooltip = passSec.tooltip;
    $(tooltip.find("#passSecButtonClose")[0]).on("mousedown", function (event) {
        // prevent input element losing focus
        event.stopImmediatePropagation();
        event.preventDefault();
    }).on("mouseup", function (event) {
        passSec.api.destroy(true);
    });

    switch (passSec.security) {
        case "https":
            $(tooltip.find(".http-warning")).hide();
            $(tooltip.find("#passSecButtonException")[0]).html(browser.i18n.getMessage("exceptionHTTPS"));
            $(tooltip.find("#passSecButtonException")[0]).on("mousedown", function (event) {
                // prevent input element losing focus
                event.stopImmediatePropagation();
                event.preventDefault();
            }).on("mouseup", function (event) {
                browser.storage.local.get("exceptions").then(function (item) {
                    if (!item.exceptions.includes(passSec.domain)) {
                        let updatedExceptions = item.exceptions.slice(0);
                        updatedExceptions.push(passSec.domain);
                        browser.storage.local.set({exceptions: updatedExceptions});
                    }
                    $('.passSec-https').removeClass("passSec-https").addClass("passSec-httpsEV");
                    passSec.security = "httpsEV";
                    passSec.api.destroy(true);
                });
            });
            break;

        case "http":
            $(tooltip.find(".http-warning")).show();
            if (passSec.httpsAvailable) {
                $(tooltip.find("#passSecButtonException")[0]).addClass("greenButton");
                $(tooltip.find("#passSecButtonException")[0]).html(browser.i18n.getMessage("secureMode"));
            } else {
                $(tooltip.find("#passSecButtonException")[0]).addClass("redButton");
                $(tooltip.find("#passSecButtonException")[0]).html(browser.i18n.getMessage("exceptionHTTP"));
            }
            $(tooltip.find("#passSecButtonException")[0]).on("mousedown", function (event) {
                // prevent input element losing focus
                event.stopImmediatePropagation();
                event.preventDefault();
            }).on("mouseup", function (event) {
                if (passSec.httpsAvailable) {
                    browser.storage.local.get("redirects").then(function (item) {
                        let redirectPattern = "http://*." + passSec.domain + "/*";
                        if (!item.redirects.includes(redirectPattern)) {
                            let updatedRedirects = item.redirects.slice(0);
                            updatedRedirects.push(redirectPattern);
                            browser.storage.local.set({redirects: updatedRedirects}).then(function () {
                                let httpsUrl = passSec.url.replace("http://", "https://");
                                browser.runtime.sendMessage({type: "doRedirect", httpsURL: httpsUrl});
                                passSec.api.destroy(true);
                            });
                        } else {
                            let httpsUrl = passSec.url.replace("http://", "https://");
                            browser.runtime.sendMessage({type: "doRedirect", httpsURL: httpsUrl});
                            passSec.api.destroy(true);
                        }
                    });
                } else {
                    browser.storage.local.get("exceptions").then(function (item) {
                        if (!item.exceptions.includes(passSec.domain)) {
                            let updatedExceptions = item.exceptions.slice(0);
                            updatedExceptions.push(passSec.domain);
                            browser.storage.local.set({exceptions: updatedExceptions}).then(function () {
                                $('.passSec-http').removeClass("passSec-http").addClass("passSec-httpsEV");
                                passSec.security = "httpsEV";
                                passSec.api.destroy(true);
                            });
                        } else {
                            $('.passSec-http').removeClass("passSec-http").addClass("passSec-httpsEV");
                            passSec.security = "httpsEV";
                            passSec.api.destroy(true);
                        }
                    });
                }
            });
            getHttpFieldTexts("http");
            break;
    }
}

/**
 * Fills the tooltip with texts corresponding to a certain input field type
 * The field type is one of "password", "payment", "personal", "search" or "default"
 */
function getHttpFieldTexts() {
    let fieldType = $(passSec.target).attr("data-passSec-input-type");
    let tooltip = passSec.tooltip;
    $(tooltip.find("#passSecWarning")[0]).html(browser.i18n.getMessage(fieldType + "Warning"));
    $(tooltip.find("#passSecConsequenceText")[0]).html(browser.i18n.getMessage(fieldType + "ConsequenceHttp"));
    if (passSec.httpsAvailable) {
        $(tooltip.find("#passSecRecommendationText")[0]).click(function (e) {
            if ($(this).html() === browser.i18n.getMessage("moreRecommendationHttpsAvailable")) {
                $(this).html(browser.i18n.getMessage("recommendationHttpsAvailable"));
            } else {
                $(this).html(browser.i18n.getMessage("moreRecommendationHttpsAvailable"));
            }
        }).addClass("passSecClickable").html(browser.i18n.getMessage("recommendationHttpsAvailable"));
        $(tooltip.find("#passSecInfoText")[0]).click(function (e) {
            if ($(this).html() === browser.i18n.getMessage("moreInfo")) {
                $(this).html(browser.i18n.getMessage(fieldType + "InfoHttpsAvailable"));
            } else {
                $(this).html(browser.i18n.getMessage("moreInfo"));
            }
        });
    } else {
        $(tooltip.find("#passSecRecommendationText")[0]).html(browser.i18n.getMessage(fieldType + "RecommendationHttp"));
        $(tooltip.find("#passSecInfoText")[0]).click(function (e) {
            if ($(this).html() === browser.i18n.getMessage("moreInfo")) {
                $(this).html(browser.i18n.getMessage(fieldType + "InfoHttp"));
            } else {
                $(this).html(browser.i18n.getMessage("moreInfo"));
            }
        });
    }
}
