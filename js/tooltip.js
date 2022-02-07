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
        '<img id="passSecConsequenceImage" src=' + chrome.runtime.getURL("skin/consequence.png") + '>' +
        '<p id="passSecConsequenceText" class="passSecTooltipText"></p>' +
        '</div>' +*/
        '<div id="passSecRecommendation" littleText">' +
        '<img id="passSecRecommendationImage" src=' + chrome.runtime.getURL("skin/recommendation.png") + '>' +
        '<p id="passSecRecommendationText" class="passSecTooltipText">' + textObj.recommendation + '</p>' +
        '</div>' +
        '<div id="passSecInfo" class="littleText">' +
        '<img id="passSecInfoImage" src=' + chrome.runtime.getURL("skin/more_info.png") + '>' +
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
        return securityStatus[1] + securityStatus[2] + securityStatus[3];
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

function assignText(tooltip, url, securityStatus, fieldType, formURLObj, qtipID) {
    let passSecURLElem = $(tooltip.find("#passSecURL")[0]);
    let passSecFormURLTextElem = $(tooltip.find("#passSecFormURLText")[0]);
    let passSecFormURLElem = $(tooltip.find("#passSecFormURL")[0]);
    let inputDelayTextElem = $(tooltip.find("#passSecInputDelayText")[0]);
    let exceptionButton = $(tooltip.find("#passSecButtonException")[0]);

    passSecURLElem.html(url.replace(passSec.domain, '<span id="passSecDomain">' + passSec.domain + "</span>"));
    let fieldTypeForText = getFieldTypeForText(fieldType);

    let siteUseHttps = securityStatus[1];
    let formUseHttps = securityStatus[2];
    let sameDomain = securityStatus[3];
    switch (siteUseHttps + formUseHttps + sameDomain) {
        // site protocol is https
        case "111":
            $(tooltip.find(".http-warning")).hide();
            $(tooltip.find(".highRisk")).hide();
            $(tooltip.find(".unknownRisk")).show();
            exceptionButton.html(chrome.i18n.getMessage("exceptionHTTPS"));
            inputDelayTextElem.html(chrome.i18n.getMessage("inputDelayText111" + fieldTypeForText));
            break;
        // site protocol is https
        case "100": case "110": case "101":
            $("#" + qtipID).addClass("passSecHighRisk");
            exceptionButton.addClass("redButton");
            exceptionButton.html(chrome.i18n.getMessage("exceptionHTTP"));
            inputDelayTextElem.html(chrome.i18n.getMessage("inputDelayText" + fieldTypeForText));

            $(tooltip.find(".http-warning")).hide();
            $(tooltip.find(".https")).show();

            // Data is transferred to another server 
            if (securityStatus[3] == 0) {
                passSecFormURLTextElem.html(chrome.i18n.getMessage("formURLInfoText" + fieldTypeForText));
                let formURLStr = formURLObj.url;
                let formDomain = formURLObj.domain
                formURLHTML = formURLStr.replace(formDomain, '<span id="passSecDomain">' + formURLObj.domain + "</span>");
                passSecFormURLElem.html(formURLHTML);
                $(tooltip.find(".otherServer")).show();
            }
            break;
        // site protocol is http
        case "000": case "001": case "010": case "011":
            $("#" + qtipID).addClass("passSecHighRisk");
            exceptionButton.addClass("redButton");
            exceptionButton.html(chrome.i18n.getMessage("exceptionHTTP"));
            inputDelayTextElem.html(chrome.i18n.getMessage("inputDelayText" + fieldTypeForText));

            $(tooltip.find(".http-warning")).show();
            $(tooltip.find(".https")).hide();

            if (passSec.httpsAvailable) {
                let changeToHttpsButton = $(tooltip.find("#passSecButtonSecureMode")[0]);
                changeToHttpsButton.show();
                changeToHttpsButton.addClass("greenButton");
            }
            break;
    }
}

function addFunctionalityForTooltipElements(tooltip, securityStatus, timerName, fieldType, element, formURLObj, creatUserException) {
    let passSecInfoTextElem = $(tooltip.find("#passSecInfoText")[0]);
    let passSecRecommendationTextElem = $(tooltip.find("#passSecRecommendationText")[0]);
    let exceptionButton = $(tooltip.find("#passSecButtonException")[0]);
    let closeButton = $(tooltip.find("#passSecButtonClose")[0]);

    [exceptionButton, closeButton].forEach(function (element) {
        element.on("mousedown", function (event) {
            // prevent input element losing focus
            event.stopImmediatePropagation();
            event.preventDefault();
        });
    });
    // Close Button Event
    closeButton.on("mouseup", function (event) {
        $(element).qtip("hide");
    });

    let fieldTypeForText = getFieldTypeForText(fieldType);
    let statusCodeForText = getStatusCodeForText(securityStatus, passSec.httpsAvailable);

    // Click Event Recommendation Element
    passSecRecommendationTextElem.click(function (e) {
        if ($(this).html() === chrome.i18n.getMessage("moreRecommendation" + statusCodeForText + fieldTypeForText)) {
            $(this).html(chrome.i18n.getMessage("riskRecommendation" + statusCodeForText + fieldTypeForText));
        } else {
            $(this).html(chrome.i18n.getMessage("moreRecommendation" + statusCodeForText + fieldTypeForText));
        }
    }).addClass("passSecClickable");

    // Click Event Info Element
    passSecInfoTextElem.click(function (e) {
        if ($(this).html() === chrome.i18n.getMessage("moreInfo")) {
            $(this).html(chrome.i18n.getMessage("moreInfo" + statusCodeForText + fieldTypeForText));
        } else {
            $(this).html(chrome.i18n.getMessage("moreInfo"));
        }
    });

    let siteUseHttps = securityStatus[1];
    let formUseHttps = securityStatus[2];
    let sameDomain = securityStatus[3];
    switch (siteUseHttps + formUseHttps + sameDomain) {
        // site protocol is https
        case "111":
            exceptionButton.on("mouseup", function () {
                addUserException(true, securityStatus, passSec.domain, "userTrustedDomains");
            });

            break;
        // site protocol is https
        case "100": case "110": case "101":
            exceptionButton.on("mouseup", function () {
                let exception = creatUserException(passSec.websiteProtocol, passSec.domain, formURLObj.protocol, formURLObj.domain);
                openConfirmAddingHttpExceptionDialog("confirmAddingHttpException", tooltip, securityStatus, exception, "userExceptions");
            });

            break;
        // site protocol is http
        case "000": case "001": case "010": case "011":
            exceptionButton.on("mouseup", function () {
                let exception = creatUserException(passSec.websiteProtocol, passSec.domain, formURLObj.protocol, formURLObj.domain);
                openConfirmAddingHttpExceptionDialog("confirmAddingHttpException", tooltip, securityStatus, exception, "userExceptions");
            });

            if (passSec.httpsAvailable) {
                // "Switch to HTTPS" Event
                let changeToHttpsButton = $(tooltip.find("#passSecButtonSecureMode")[0]);
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
};

function getElementsToUpdateAfterAddingException(prevSecurityStatus, exception) {
    let elementsWithSameSecStatObj = $('[data-passSec-security=' + prevSecurityStatus + ']');
    let elementsToUpdateAfterAddingExceptionArr = [];
    for (let i= 0; i < elementsWithSameSecStatObj.length; i++) {
        let formElem = elementsWithSameSecStatObj[i].form;
        let formDomain = getDomainFromFormActionAttr(formElem);
        if(formDomain && exception.formDom == formDomain) {
            elementsToUpdateAfterAddingExceptionArr.push(elementsWithSameSecStatObj[i]);
        }
    }
    return elementsToUpdateAfterAddingExceptionArr;
}

function updateSecurityClass(prevSecurityStatus, exception) {
    let updateElementsArr = getElementsToUpdateAfterAddingException(prevSecurityStatus, exception);
    let classToRemove = "";
    let classToAdd = "";

    if (prevSecurityStatus == "4111") {
        classToRemove = "passSec-grey";
        classToAdd = "passSec-blue";
    } else {
        classToRemove = "passSec-red";
        classToAdd = "passSec-redException";
    }
    for (let updateElem of updateElementsArr) {
        $(updateElem).removeClass(classToRemove);
        $(updateElem).addClass(classToAdd);
        $(updateElem).attr("data-passSec-security-class", classToAdd);
        if(elementHasTooltip(updateElem)) {
            $(updateElem).qtip('api').destroy(true);    
        }
    }
};

function addUserException(tooltip, securityStatus, exception, storageListName) {
    chrome.storage.local.get(null, function (item) {
        let updatedExceptions = item[storageListName].slice(0);
        updatedExceptions.push(exception);
        chrome.storage.local.set({ [storageListName]: updatedExceptions }, function () {
            updateSecurityClass(securityStatus, exception);
        });
    });
};


function openConfirmAddingHttpExceptionDialog(message, tooltip, securityStatus, exception, storageListName) {
    var confirmDialog = $.confirm({
        title: chrome.i18n.getMessage("confirmAddingHttpExceptionTitle"),
        titleClass: "passSecConfirmTitle",
        type: 'red',
        buttons: {
            addingException: {
                text: chrome.i18n.getMessage("confirmExceptionButton"),
                btnClass: 'btn-red',
                isHidden: false,
                isDisabled: false,
                action: function () {
                    addUserException(true, securityStatus, exception, storageListName);
                }
            },
            cancel: {
                text: chrome.i18n.getMessage("cancelButton")
            }
        },
        onOpenBefore: function () {
            let exceptionSiteProtocolStr = '"' + exception.siteProtocol.replace(":", "").toUpperCase() + '"';
            let exceptionFormProtocolStr = '"' + exception.formProtocol.replace(":", "").toUpperCase() + '"';
            let confirmHttpExceptionDialogContent = '<div id="passSecConfirmDialog">';
            confirmHttpExceptionDialogContent += chrome.i18n.getMessage(message, [exception.siteDom, exceptionSiteProtocolStr, exceptionFormProtocolStr, exception.formDom]);
            confirmHttpExceptionDialogContent += "<br>";
            confirmHttpExceptionDialogContent += chrome.i18n.getMessage("buttonDeactivationAddingHttpException");
            confirmHttpExceptionDialogContent += '<p id="passSecTimer" class="passSecConfirm"></p>'
            confirmHttpExceptionDialogContent += '</div>';
            this.setContent(confirmHttpExceptionDialogContent);
        },
        onContentReady: function () {
            chrome.storage.local.get("timer", function (storageObj) {
                var dialogTimer = timer = new PassSecTimer("dialogTimer", storageObj.timer, null, ["passSecConfirmDialog"]);
                var elementToDisplayTimer = $("#passSecTimer")[0];
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