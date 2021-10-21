/**
 * Returns the HTML skeleton for a tooltip
 */
 function getTooltipHTML() {
    return '<span id="passSecWarning" class="http-warning passSecTooltipText"></span>' +
        '<hr class="http-warning">' +
        '<span id="passSecURL" class="passSecTooltipText">' + chrome.i18n.getMessage("domainInfo") + '<span id="passSecDomain" class="passSecTooltipText">' + passSec.domain + '</span>.</span>' +
        '<span id="passSecVerify" class="passSecTooltipText">' + chrome.i18n.getMessage("verifyDomain") + '</span>' +
        '<div id="passSecConsequence" class="http-warning">' +
        '<img id="passSecConsequenceImage" src=' + chrome.extension.getURL("skin/consequence.png") + '>' +
        '<p id="passSecConsequenceText" class="passSecTooltipText"></p>' +
        '</div>' +
        '<div id="passSecRecommendation" class="http-warning littleText">' +
        '<img id="passSecRecommendationImage" src=' + chrome.extension.getURL("skin/recommendation.png") + '>' +
        '<p id="passSecRecommendationText" class="passSecTooltipText"></p>' +
        '</div>' +
        '<div id="passSecInfo" class="http-warning littleText">' +
        '<img id="passSecInfoImage" src=' + chrome.extension.getURL("skin/more_info.png") + '>' +
        '<p id="passSecInfoText" class="passSecClickable passSecTooltipText">' + chrome.i18n.getMessage("moreInfo") + '</p>' +
        '</div>' +
        '<p id="passSecTimer"></p>' +
        '<div id="passSecButtons>">' +
        '<button id="passSecButtonException" type="button" class="passSecTooltipText"></button>' +
        '<button id="passSecButtonClose" type="button" class="passSecTooltipText">' + chrome.i18n.getMessage("OK") + ' </button>' +
        '</div>';
}

function creatUserException(websiteProtocol, websiteDomain, formProtocol, formDomain) {
    return {"siteProtocol":websiteProtocol,"siteDom":websiteDomain,"formProtocol":formProtocol,"formDom":formDomain};
}
/**
 * Adds functionality for the tooltip elements
 */
function processTooltip(securityStatus, element, creatUserException) {
    let tooltip = passSec.tooltip;

    $(tooltip.find("#passSecButtonClose")[0]).on("mousedown", function (event) {
        // prevent input element losing focus
        event.stopImmediatePropagation();
        event.preventDefault();
    }).on("mouseup", function (event) {
        passSec.api.destroy(true);
    });

    switch (securityStatus) {
        case "passSec-https":
            passSecTimer.countdown(tooltip, element);

            $(tooltip.find(".http-warning")).hide();
            $(tooltip.find("#passSecButtonException")[0]).html(chrome.i18n.getMessage("exceptionHTTPS"));
            $(tooltip.find("#passSecButtonException")[0]).on("mousedown", function (event) {
                // prevent input element losing focus
                event.stopImmediatePropagation();
                event.preventDefault();
            }).on("mouseup", function (event) {
                addUserException(true, securityStatus, passSec.domain, "userTrustedDomains");
            });
            break;

        case "passSec-http":
            passSecTimer.countdown(tooltip, element);
            $(tooltip.find(".http-warning")).show();
            if (passSec.httpsAvailable) {
                $(tooltip.find("#passSecButtonException")[0]).addClass("greenButton");
                $(tooltip.find("#passSecButtonException")[0]).html(chrome.i18n.getMessage("secureMode"));
            } else {
                $(tooltip.find("#passSecButtonException")[0]).addClass("redButton");
                $(tooltip.find("#passSecButtonException")[0]).html(chrome.i18n.getMessage("exceptionHTTP"));
            }
            $(tooltip.find("#passSecButtonException")[0]).on("mousedown", function (event) {
                // prevent input element losing focus
                event.stopImmediatePropagation();
                event.preventDefault();
            }).on("mouseup", function (event) {
                if (passSec.httpsAvailable) {
                    chrome.storage.local.get("redirects", function (item) {
                        let redirectPattern = "http://*." + passSec.domain + "/*";
                        if (!item.redirects.includes(redirectPattern)) {
                            let updatedRedirects = item.redirects.slice(0);
                            updatedRedirects.push(redirectPattern);
                            chrome.storage.local.set({ redirects: updatedRedirects }, function () {
                                let httpsUrl = passSec.url.replace("http://", "https://");
                                chrome.runtime.sendMessage({ type: "doRedirect", httpsURL: httpsUrl });
                                passSec.api.destroy(true);
                            });
                        } else {
                            let httpsUrl = passSec.url.replace("http://", "https://");
                            chrome.runtime.sendMessage({ type: "doRedirect", httpsURL: httpsUrl });
                            passSec.api.destroy(true);
                        }
                    });
                } else {
                    var form = element.form;
                    var formURLObj = getProtocolAndDomainFromURL(form.action);
                    let exception = creatUserException(passSec.websiteProtocol, passSec.domain, formURLObj.protocol, formURLObj.domain);
                    openConfirmAddingHttpExceptionDialog("confirmAddingHttpException", tooltip, securityStatus, exception, "exceptions");
                }
            });
            getHttpFieldTexts("http");
            break;
    }
}


function updateSecurityClass(prevSecurityClass) {
    updateElem = $('.' + prevSecurityClass);
    updateElem.removeClass(prevSecurityClass);

    if (prevSecurityClass == "passSec-https") {
        updateElem.addClass("passSec-userTrusted");
        $('[data-passSec-security=' + prevSecurityClass + ']').attr("data-passSec-security", "passSec-userTrusted");
    } else {
        $('[data-passSec-security=' + prevSecurityClass + ']').attr("data-passSec-security", "passSec-none");
    }
}

function addUserException(tooltip, securityStatus, exception, storageListName) {
    chrome.storage.local.get(storageListName, function (item) {
        let updatedExceptions = item[storageListName].slice(0);
        updatedExceptions.push(exception);
        chrome.storage.local.set({ [storageListName]: updatedExceptions }, function () {
            updateSecurityClass(securityStatus);

            if (tooltip) {
                passSec.api.destroy(true);
            }
        });
    });
}


function openConfirmAddingHttpExceptionDialog(message, tooltip, securityStatus, exception, storageListName) {
    $.confirm({
        title: "PassSec+",
        titleClass: "passSecConfirmTitle",
        buttons: {
            ok: function () {
                addUserException(tooltip, securityStatus, exception, storageListName);
            },
            cancel: {
                text: chrome.i18n.getMessage("cancelButton")
            }
        },
        onOpenBefore: function () {
            this.setContent($(chrome.i18n.getMessage(message, passSec.domain)));
        },
        backgroundDismissAnimation: "none",
        animateFromElement: false,
        animation: "opacity",
        closeAnimation: "opacity",
        useBootstrap: false,
        boxWidth: "40%"
    });
}

/**
 * Fills the tooltip with texts corresponding to a certain input field type
 * The field type is one of "password", "payment", "personal", "search" or "default"
 */
function getHttpFieldTexts() {
    let fieldType = $(passSec.target).attr("data-passSec-input-type");
    let tooltip = passSec.tooltip;

    if (passSec.url.startsWith("https")) {
        $(tooltip.find("#passSecWarning")[0]).html(chrome.i18n.getMessage(fieldType + "Warning"));
        $(tooltip.find("#passSecConsequenceText")[0]).html(chrome.i18n.getMessage(fieldType + "ConsequenceHttp"));
        $(tooltip.find("#passSecRecommendationText")[0]).html(chrome.i18n.getMessage(fieldType + "RecommendationHttpMixed"));
        $(tooltip.find("#passSecInfoText")[0]).click(function (e) {
            if ($(this).html() === chrome.i18n.getMessage("moreInfo")) {
                $(this).html(chrome.i18n.getMessage(fieldType + "InfoHttpMixed"));
            } else {
                $(this).html(chrome.i18n.getMessage("moreInfo"));
            }
        });

    } else {
        $(tooltip.find("#passSecWarning")[0]).html(chrome.i18n.getMessage(fieldType + "Warning"));
        $(tooltip.find("#passSecConsequenceText")[0]).html(chrome.i18n.getMessage(fieldType + "ConsequenceHttp"));
        if (passSec.httpsAvailable) {
            $(tooltip.find("#passSecRecommendationText")[0]).click(function (e) {
                if ($(this).html() === chrome.i18n.getMessage("moreRecommendationHttpsAvailable")) {
                    $(this).html(chrome.i18n.getMessage("recommendationHttpsAvailable"));
                } else {
                    $(this).html(chrome.i18n.getMessage("moreRecommendationHttpsAvailable"));
                }
            }).addClass("passSecClickable").html(chrome.i18n.getMessage("recommendationHttpsAvailable"));
            $(tooltip.find("#passSecInfoText")[0]).click(function (e) {
                if ($(this).html() === chrome.i18n.getMessage("moreInfo")) {
                    $(this).html(chrome.i18n.getMessage(fieldType + "InfoHttpsAvailable"));
                } else {
                    $(this).html(chrome.i18n.getMessage("moreInfo"));
                }
            });
        } else {
            $(tooltip.find("#passSecRecommendationText")[0]).html(chrome.i18n.getMessage(fieldType + "RecommendationHttp"));
            $(tooltip.find("#passSecInfoText")[0]).click(function (e) {
                if ($(this).html() === chrome.i18n.getMessage("moreInfo")) {
                    $(this).html(chrome.i18n.getMessage(fieldType + "InfoHttp"));
                } else {
                    $(this).html(chrome.i18n.getMessage("moreInfo"));
                }
            });
        }
    }
}


function getProtocolAndDomainFromURL(urlStr) {
    let url = new URL(urlStr);
    let domain = extractDomain(url.host);
    let protocol = url.protocol;
    return {
        protocol: protocol,
        domain: domain
    };
}