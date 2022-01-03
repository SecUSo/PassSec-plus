var timerArr = [];

/**
 * Returns the HTML skeleton for a tooltip
 */
function getTooltipHTML(securityStatus, httpsAvailable, fieldType) {
    let textObj = getTooltipText(securityStatus, httpsAvailable, fieldType);

    return '<span id="passSecTooltipSummary" class="highRisk passSecTooltipText">' + textObj.tooltipSummary + '</span>' +
        '<hr class="http-warning">' +
        '<div class="otherServer" style="display: none"></div>' +
        '<div id="passSecURLText" class="unknownRisk otherServer passSecTooltipText" style="display: none">' + chrome.i18n.getMessage("urlInfoText") + '</div>' +
        '<div id="passSecURL" class="unknownRisk otherServer passSecTooltipText" style="display: none">' + passSec.url + '</div>' +
        '<div id="passSecFormURLText" class="otherServer passSecTooltipText" style="display: none"></div>' +
        '<div id="passSecFormURL" class="otherServer passSecTooltipText" style="display: none"></div>' +
        '<hr class="https">' +
        '<div id="passSecRiskText" class="passSecTooltipText littleText">' + textObj.riskText + '</div>' +
        /* '<div id="passSecConsequence" class="http-warning">' +
        '<img id="passSecConsequenceImage" src=' + chrome.extension.getURL("skin/consequence.png") + '>' +
        '<p id="passSecConsequenceText" class="passSecTooltipText"></p>' +
        '</div>' +*/
        '<div id="passSecRecommendation" littleText">' +
        '<img id="passSecRecommendationImage" src=' + chrome.extension.getURL("skin/recommendation.png") + '>' +
        '<p id="passSecRecommendationText" class="passSecTooltipText">' + textObj.recommendation + '</p>' +
        '</div>' +
        '<div id="passSecInfo" class="littleText">' +
        '<img id="passSecInfoImage" src=' + chrome.extension.getURL("skin/more_info.png") + '>' +
        '<p id="passSecInfoText" class="passSecClickable passSecTooltipText">' + chrome.i18n.getMessage("moreInfo") + '</p>' +
        '</div>' +
        '<div id="passSecInputDelayText" class="passSecTooltipText">' + textObj.inputDelay + '</div>' +
        '<p id="passSecTimer" class="passSecTooltipText"></p>' +
        '<div id="passSecButtons>">' +
        '<div id="dialog" title="Basic dialog"></div>' +
        '<button id="passSecButtonException" type="button" class="passSecTooltipText"></button>' +
        '<button id="passSecButtonSecureMode" type="button" class="passSecTooltipText" style="display: none">' + chrome.i18n.getMessage("secureMode") + '</button>' +
        '<button id="passSecButtonClose" type="button" class="passSecTooltipText">' + chrome.i18n.getMessage("CloseDialog") + ' </button>' +
        '</div>';
}

function creatUserException(websiteProtocol, websiteDomain, formProtocol, formDomain) {
    return { "siteProtocol": websiteProtocol, "siteDom": websiteDomain, "formProtocol": formProtocol, "formDom": formDomain };
}

function disableElements(elemArr) {
    for (let elem of elemArr) {
        elem.prop("disabled", true);
    }
}

function enableElements(elemArr) {
    for (let elem of elemArr) {
        elem.prop("disabled", false);
    }
}

function disableDialogButtons(dialogButtonsArr) {
    for (let button of dialogButtonsArr) {
        button.disable();
    }
}

function enableDialogButtons(dialogButtonsArr) {
    for (let button of dialogButtonsArr) {
        button.enable();
    }
}

function getStatusCodeForText(securityStatus, httpsAvailable) {
    let siteProtocolStatus = securityStatus[1];
    // check if the site uses https or http
    if (siteProtocolStatus == 0) {
        return (httpsAvailable ? "HttpsAvailable" : "HttpOnly");
    } else {
        return securityStatus;
    }
};

function getFieldTypeForText(fieldType) {
    // text currently distinguishes only between password and (sensitive) data
    return (fieldType == "password" ? "Password" : "Data");
};

function getTooltipText(securityStatus, httpsAvailable, fieldType) {
    let statusCodeForText = getStatusCodeForText(securityStatus, httpsAvailable);
    let fieldTypeForText = getFieldTypeForText(fieldType);

    return {
        "tooltipSummary": chrome.i18n.getMessage("riskTooltipSummary" + statusCodeForText + fieldTypeForText),
        "riskText": chrome.i18n.getMessage("riskText" + statusCodeForText + fieldTypeForText),
        "recommendation": chrome.i18n.getMessage("riskRecommendation" + statusCodeForText + fieldTypeForText),
        "moreRecommendation": chrome.i18n.getMessage("moreRecommendation" + statusCodeForText + fieldTypeForText)
    }
};

/**
 * Adds functionality for the tooltip elements
 */
function processTooltip(tooltip, securityStatus, timerType, fieldType, element, formURLObj, creatUserException) {
    let url = passSec.url;

    let passSecURLTextElem = $(tooltip.find("#passSecURLText")[0]);
    let passSecURLElem = $(tooltip.find("#passSecURL")[0]);
    let passSecFormURLTextElem = $(tooltip.find("#passSecFormURLText")[0]);
    let passSecFormURLElem = $(tooltip.find("#passSecFormURL")[0]);
    let passSecInfoTextElem = $(tooltip.find("#passSecInfoText")[0]);
    let passSecRecommendationTextElem = $(tooltip.find("#passSecRecommendationText")[0]);
    let inputDelayTextElem = $(tooltip.find("#passSecInputDelayText")[0]);
    let exceptionButton = $(tooltip.find("#passSecButtonException")[0]);
    let closeButton = $(tooltip.find("#passSecButtonClose")[0]);

    closeButton.on("mousedown", function (event) {
        // prevent input element losing focus
        event.stopImmediatePropagation();
        event.preventDefault();
    }).on("mouseup", function (event) {
        passSec.api.destroy(true);
    });

    passSecURLElem.html(url.replace(passSec.domain, '<span id="passSecDomain">' + passSec.domain + "</span>"));
    var elementsToDisableWhenTimerIsActivated = [$(element), exceptionButton];
    var elementToDisplayTimer = tooltip.find("#passSecTimer")[0];

    if (securityStatus == 4111) {
        $(tooltip.find(".http-warning")).hide();
        $(tooltip.find(".highRisk")).hide();
        $(tooltip.find(".unknownRisk")).show();
        exceptionButton.html(chrome.i18n.getMessage("exceptionHTTPS"));
        inputDelayTextElem.html(chrome.i18n.getMessage("inputDelayText4111"));

        exceptionButton.on("mousedown", function (event) {
            // prevent input element losing focus
            event.stopImmediatePropagation();
            event.preventDefault();
        }).on("mouseup", function () {
            addUserException(true, securityStatus, passSec.domain, "userTrustedDomains");
        });
    } else {
        $(".passSecTooltip").addClass("passSecHighRisk");

        exceptionButton.addClass("redButton");
        exceptionButton.html(chrome.i18n.getMessage("exceptionHTTP"));
        inputDelayTextElem.html(chrome.i18n.getMessage("inputDelayText"));

        exceptionButton.on("mousedown", function (event) {
            // prevent input element losing focus
            event.stopImmediatePropagation();
            event.preventDefault();
        }).on("mouseup", function (event) {
            let exception = creatUserException(passSec.websiteProtocol, passSec.domain, formURLObj.protocol, formURLObj.domain);
            openConfirmAddingHttpExceptionDialog("confirmAddingHttpException", tooltip, securityStatus, exception, "userExceptions");
        });
    }

    let statusCodeForText = getStatusCodeForText(securityStatus, passSec.httpsAvailable);
    let fieldTypeForText = getFieldTypeForText(fieldType);

    // Data is transferred to another server 
    if (securityStatus[3] == 0) {
        passSecFormURLTextElem.html(chrome.i18n.getMessage("formURLInfoText" + fieldTypeForText));
        let formURLStr = formURLObj.url;
        let formDomain = formURLObj.domain
        formURLHTML = formURLStr.replace(formDomain, '<span id="passSecDomain">' + formURLObj.domain + "</span>");
        passSecFormURLElem.html(formURLHTML);
        $(tooltip.find(".otherServer")).show();

    }


    passSecRecommendationTextElem.click(function (e) {
        if ($(this).html() === chrome.i18n.getMessage("moreRecommendation" + statusCodeForText + fieldTypeForText)) {
            $(this).html(chrome.i18n.getMessage("riskRecommendation" + statusCodeForText + fieldTypeForText));
        } else {
            $(this).html(chrome.i18n.getMessage("moreRecommendation" + statusCodeForText + fieldTypeForText));
        }
    }).addClass("passSecClickable");

    passSecInfoTextElem.click(function (e) {
        if ($(this).html() === chrome.i18n.getMessage("moreInfo")) {
            $(this).html(chrome.i18n.getMessage("moreInfo" + statusCodeForText + fieldTypeForText));
        } else {
            $(this).html(chrome.i18n.getMessage("moreInfo"));
        }
    });

    var siteProtocolStatus = securityStatus[1];
    switch (siteProtocolStatus) {
        // site protocol is https
        case "1":
            passSecTimer.startCountdown(timerType, elementToDisplayTimer, element, elementsToDisableWhenTimerIsActivated, false);

            $(tooltip.find(".http-warning")).hide();
            $(tooltip.find(".https")).show();

            break;
        // site protocol is http
        case "0":
            passSecTimer.startCountdown(timerType, elementToDisplayTimer, element, elementsToDisableWhenTimerIsActivated, false);
            $(tooltip.find(".http-warning")).show();
            $(tooltip.find(".https")).hide();

            if (passSec.httpsAvailable) {
                // Buttons 
                let changeToHttpsButton = $(tooltip.find("#passSecButtonSecureMode")[0]);
                changeToHttpsButton.show();

                changeToHttpsButton.addClass("greenButton");
                changeToHttpsButton.on("mousedown", function () {
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
                });
            }
            break;
    }
}


function updateSecurityClass(prevSecurityStatus) {
    updateElem = $('.' + prevSecurityStatus);
    updateElem.removeClass(prevSecurityStatus);

    if (prevSecurityStatus == "4111") {
        updateElem.addClass("passSec-blue");
        updateElem.attr("data-passSec-security", "2111");
        updateElem.attr("data-passSec-security-class", "passSec-blue");
    } else {
        $('[data-passSec-security=' + prevSecurityStatus + ']').attr("data-passSec-security-class", "passSec-redException");
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
    var confirmDialog = $.confirm({
        title: chrome.i18n.getMessage("confirmAddingHttpExceptionTitle"),
        titleClass: "passSecConfirmTitle",
        type: 'red',
        buttons: {
            addingException: {
                text: 'Ja, ich weiß, was ich tue!',
                btnClass: 'btn-red',
                isHidden: false, // initially not hidden
                isDisabled: false, // initially not disabled
                action: function () {
                    addUserException(tooltip, securityStatus, exception, storageListName);
                }
            },
            cancel: {
                text: chrome.i18n.getMessage("cancelButton")
            }
        },
        onOpenBefore: function () {
            let confirmHttpExceptionDialogContent = chrome.i18n.getMessage(message, [exception.siteDom, exception.siteProtocol.replace(":", ""), exception.formProtocol.replace(":", ""), exception.formDom]);
            confirmHttpExceptionDialogContent += "<br>";
            confirmHttpExceptionDialogContent += chrome.i18n.getMessage("buttonDeactivationAddingHttpException");
            confirmHttpExceptionDialogContent += '<p id="passSecExceptionDialogTimer" class="passSecConfirm"></p>'
            this.setContent(confirmHttpExceptionDialogContent);
        },
        onContentReady: function () {
            chrome.storage.local.get("timer", function (storageObj) {
                var dialogTimer = timer = new PassSecTimer("dialogTimer", storageObj.timer, null);
                var elementToDisplayTimer = $(passSecExceptionDialogTimer)[0];
                dialogTimer.countdown(elementToDisplayTimer, null, [confirmDialog.buttons.addingException], true);
            });
        },
        backgroundDismissAnimation: "none",
        animateFromElement: false,
        animation: "opacity",
        closeAnimation: "opacity",
        useBootstrap: false,
        boxWidth: "40%"
    });
}