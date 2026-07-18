/**
 *
 * @type {{}}
 */
const Tooltip = {
    _open: null,

    /**
     *
     * @param fileName
     * @returns {Promise<Element|null>}
     * @private
     */
    async _createTooltipSkeleton(fileName) {
        const tooltipHTML = await browser.runtime.sendMessage({ type: "loadResource", path: fileName });

        if (!tooltipHTML) {
            console.error("Failed to load tooltip HTML from background script.");
            return;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(tooltipHTML, "text/html");

        const firstEl = doc.body.firstElementChild;
        if (!firstEl) return null;

        return document.importNode(firstEl, true);
    },

    /**
     *
     * @param tooltipElement
     */
    setURL(tooltipElement) {
        let url = PassSec.location;
        const urlObject = new URL(url);
        const pathSuffix = urlObject.pathname + urlObject.search + urlObject.hash;

        if (pathSuffix.length > 100) {
            url = url.replace(pathSuffix, pathSuffix.substring(0, 100) + "...");
        }

        const urlSplit = url.split(PassSec.domain);

        const textContentMap = {
            "passSec-URL-prefix": urlSplit[0],
            "passSec-URL-domain": PassSec.domain,
            "passSec-URL-suffix": urlSplit[1] || ""
        };

        for (const [id, value] of Object.entries(textContentMap)) {
            const el = tooltipElement.querySelector(`#${id}`);
            if (el) el.textContent = value;
        }
    },

    /**
     *
     * @param tooltipElement
     * @param securityState
     * @returns {Promise<void>}
     */
    async fillTooltip(tooltipElement, securityState) {
        const setTextContent = async (id, messageId) => {
            const el = tooltipElement.querySelector(`#${id}`);
            if (el) el.textContent = await browser.i18n.getMessage(messageId);
        };

        securityState.isSiteHttps = false;
        // securityState.isSameDomain = false;
        // securityState.isFormHttps = false;
        PassSec.httpsAvailable = true;

        // todo next: exceptionButton (red button)

        await setTextContent("passSec-info-span-short", "tooltipInfoText");
        tooltipElement.querySelector("#passSec-info-text").classList.add("passSec-clickable");
        await setTextContent("passSec-button-exception", "tooltipExceptionButton");
        await setTextContent("passSec-button-https", "tooltipHTTPSButton");
        await setTextContent("passSec-button-close", "tooltipCloseButton");



        if (securityState.isFullySecure) {
            await setTextContent("passSec-header", "tooltipHeaderSafe");
            await setTextContent("passSec-risk-state", "tooltipRiskStateUnknown");
            await setTextContent("passSec-risk-text", "tooltipRiskTextSafe");
            await setTextContent("passSec-recommendation-span-short", "tooltipRecommendationSafe");
            await setTextContent("passSec-info-span-long", "tooltipMoreInfoSafe");
            await setTextContent("passSec-link-delay", "tooltipLinkDelaySafe");


        } else {
            tooltipElement.querySelector("#passSec-header").classList.add("passSec-bold");
            tooltipElement.querySelector("#passSec-recommendation-text").classList.add("passSec-clickable");
            tooltipElement.querySelector("#passSec-button-exception").classList.add("passSec-red-button");
            tooltipElement.classList.add("passSec-high-risk");
            await setTextContent("passSec-risk-state", "tooltipRiskStateHighRisk");
            await setTextContent("passSec-recommendation-span-short", "tooltipRecommendationUnsafe");
            await setTextContent("passSec-link-delay", "tooltipLinkDelayUnsafe");

            if (!securityState.isSiteHttps) {
                await setTextContent("passSec-header", "tooltipHeaderHTTPWebsite");
                await setTextContent("passSec-risk-text", "tooltipRiskTextHTTPWebsite");
                await setTextContent("passSec-recommendation-span-long", "tooltipMoreRecommendationAskForHTTPS");
                await setTextContent("passSec-info-span-long", "tooltipMoreInfoHTTPWebsite");

                if (PassSec.httpsAvailable) {
                    tooltipElement.querySelector("#passSec-button-https").classList.remove("passSec-not-active");
                    await setTextContent("passSec-recommendation-span-short", "tooltipRecommendationHTTPSAvailable");
                    await setTextContent("passSec-recommendation-span-long", "tooltipMoreRecommendationHTTPSAvailable");
                    await setTextContent("passSec-info-span-long", "tooltipMoreInfoHTTPWebsiteHTTPSAvailable");
                }

            } else if (!securityState.isFormHttps && !securityState.isSameDomain) {
                await setTextContent("passSec-header", "tooltipHeaderHTTPFormDifferentDomain");
                await setTextContent("passSec-risk-text", "tooltipRiskTextHTTPFormDifferentDomain");
                await setTextContent("passSec-recommendation-span-long", "tooltipMoreRecommendationCheckSettings");
                await setTextContent("passSec-info-span-long", "tooltipMoreInfoHTTPFormDifferentDomain");

            } else if (!securityState.isFormHttps) {
                await setTextContent("passSec-header", "tooltipHeaderHTTPForm");
                await setTextContent("passSec-risk-text", "tooltipRiskTextHTTPForm");
                await setTextContent("passSec-recommendation-span-long", "tooltipMoreRecommendationAskForHTTPS");
                await setTextContent("passSec-info-span-long", "tooltipMoreInfoHTTPForm");

            } else if (!securityState.isSameDomain) {
                await setTextContent("passSec-header", "tooltipHeaderDifferentDomain");
                await setTextContent("passSec-risk-text", "tooltipRiskTextDifferentDomain");
                await setTextContent("passSec-recommendation-span-long", "tooltipMoreRecommendationCheckSettings");
                await setTextContent("passSec-info-span-long", "tooltipMoreInfoDifferentDomain");
            }
        }
    },

    /**
     *
     * @param tooltipElement
     * @returns {Promise<void>}
     */
    async addImages(tooltipElement) {
        const textContentMap = {
            "passSec-recommendation-img": "skin/recommendation.png",
            "passSec-info-img": "skin/more_info.png"
        };

        for (const [id, path] of Object.entries(textContentMap)) {
            const el = tooltipElement.querySelector(`#${id}`);
            if (el) el.src = await browser.runtime.sendMessage({ type: "getImageData", path: path });
        }
    },

    /**
     *
     * @param tooltipElement
     * @returns {Promise<void>}
     */
    async wireUpButtons(tooltipElement) {
        const recommendationTextEl = tooltipElement.querySelector("#passSec-recommendation-text");
        if (recommendationTextEl.classList.contains("passSec-clickable")) {
            recommendationTextEl.addEventListener("click", () => {
                recommendationTextEl.classList.toggle("show-long");
            });
        }

        const infoTextEl = tooltipElement.querySelector("#passSec-info-text");
        if (infoTextEl.classList.contains("passSec-clickable")) {
            infoTextEl.addEventListener("click", () => {
               infoTextEl.classList.toggle("show-long");
            });
        }
    },

    /**
     *
     */
    close() {
        if (!this._open) return;
        const { element, tooltipEl, stopAutoUpdate, hideOnBlur } = this._open;
        stopAutoUpdate();
        tooltipEl.remove();
        element.removeEventListener("focusout", hideOnBlur);
        this._open = null;
    },

    /**
     *
     * @param element
     * @returns {Promise<void>}
     */
    async open(element) {
        const securityStatusClass = element.getAttribute("data-passsec-security-class");
        if (securityStatusClass !== "passSec-red" && securityStatusClass !== "passSec-grey") return;
        if (this._open) return;

        const tooltipEl = await this._createTooltipSkeleton("tooltip.html");
        document.body.appendChild(tooltipEl);

        const securityState = PassSec.elementSecurityStates.get(element);

        this.setURL(tooltipEl);
        await this.fillTooltip(tooltipEl, securityState);
        await this.addImages(tooltipEl);
        await this.wireUpButtons(tooltipEl);

        console.log(tooltipEl);

        const { autoUpdate, computePosition, flip, shift, hide } = globalThis.FloatingUIDOM;
        const updatePosition = async () => {
            if (!this._open) return;

            const { x, y, middlewareData } = await computePosition(element, tooltipEl, {
                placement: "bottom-start",
                middleware: [flip(), shift({ padding: 5 }), hide()]
            });

            // instant close to prevent repositioning to the top left when element out of view
            if (middlewareData.hide && middlewareData.hide.referenceHidden) {
                this.close();
                return;
            }

            Object.assign(tooltipEl.style, { left: `${x}px`, top: `${y}px` });
        };
        const stopAutoUpdate = autoUpdate(element, tooltipEl, updatePosition);

        tooltipEl.addEventListener("mousedown", (event) => {
            event.preventDefault();
        });

        const hideOnBlur = (event) => {
            if (tooltipEl.contains(event.relatedTarget)) return;
            this.close();
        };
        element.addEventListener("focusout", hideOnBlur);

        PassSec.target = element;
        PassSec.tooltip = tooltipEl;

        this._open = { element, tooltipEl, stopAutoUpdate, hideOnBlur };
    }
}


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

var passSecTooltip = {
    changeHTMLTextWhenElemIsClicked(elem, firstText, secondText) {
        if ($(elem).html() === secondText) {
            $(elem).html(firstText);
        } else {
            $(elem).html(secondText);
        }
    },
    addUserException(securityStatus, exception, storageListName, inputHasAnomaly) {
        chrome.storage.local.get(null, function (item) {
            let updatedExceptions = item[storageListName].slice(0);
            updatedExceptions.push(exception);
            chrome.storage.local.set({ [storageListName]: updatedExceptions }, function () {
                updateSecurityClass(securityStatus, exception, inputHasAnomaly);
            });
        });
    },
    createUserException(websiteProtocol, websiteDomain, formProtocol, formDomain) {
        return { "siteProtocol": websiteProtocol, "siteDom": websiteDomain, "formProtocol": formProtocol, "formDom": formDomain };
    }
}

function addFunctionalityForTooltipElements(tooltip, securityStatus, fieldType, element, formURLObj) {
    let passSecInfoTextElem = $(tooltip.find("#passSecInfoText")[0]);
    let passSecRecommendationTextElem = $(tooltip.find("#passSecRecommendationText")[0]);
    let exceptionButton = $(tooltip.find("#passSecButtonException")[0]);
    let closeButton = $(tooltip.find("#passSecButtonClose")[0]);

    [exceptionButton, closeButton].forEach(function (element) {
        element.on("mousedown", function (event) {
            if (e.originalEvent && !e.originalEvent.isTrusted) { return; } // Deny trigger using JavaScript (not by actual the mouse)
            // prevent input element losing focus
            event.stopImmediatePropagation();
            event.preventDefault();
        });
    });
    // Close Button Event
    closeButton.on("mouseup", function (event) {
        if (e.originalEvent && !e.originalEvent.isTrusted) { return; } // Deny trigger using JavaScript (not by actual the mouse)
        $(element).qtip("hide");
    });

    let fieldTypeForText = getFieldTypeForText(fieldType);
    let statusCodeForText = getStatusCodeForText(securityStatus, passSec.httpsAvailable);

    let moreRecommendationText = chrome.i18n.getMessage("moreRecommendation" + statusCodeForText + fieldTypeForText);
    let riskRecommendationText = chrome.i18n.getMessage("riskRecommendation" + statusCodeForText + fieldTypeForText);
    passSecRecommendationTextElem.click(function (e) {
        passSecTooltip.changeHTMLTextWhenElemIsClicked(this, riskRecommendationText, moreRecommendationText);
    });

    if (moreRecommendationText != riskRecommendationText) {
        passSecRecommendationTextElem.addClass("passSecClickable");
    }

    let infoText = chrome.i18n.getMessage("moreInfo");
    let moreInfoText = chrome.i18n.getMessage("moreInfo" + statusCodeForText + fieldTypeForText);
    passSecInfoTextElem.click(function (e) {
        passSecTooltip.changeHTMLTextWhenElemIsClicked(this, infoText, moreInfoText);
    });

    let siteUseHttps = securityStatus[1];
    let formUseHttps = securityStatus[2];
    let sameDomain = securityStatus[3];
    switch (siteUseHttps + formUseHttps + sameDomain) {
        // site protocol is https
        case "111":
            exceptionButton.on("mouseup", function (e) {
              if (e.originalEvent && !e.originalEvent.isTrusted) { return; } // Deny trigger using JavaScript (not by actual the mouse)
              passSecTooltip.addUserException(securityStatus, passSec.domain, "userTrustedDomains", false);
            });

            break;
        // site protocol is https
        case "100": case "110": case "101":
            exceptionButton.on("mouseup", function (e) {
                if (e.originalEvent && !e.originalEvent.isTrusted) { return; } // Deny trigger using JavaScript (not by actual the mouse)
                let exception = passSecTooltip.createUserException(passSec.websiteProtocol, passSec.domain, formURLObj.protocol, formURLObj.domain);
                $(element).qtip("hide");
                openConfirmAddingExceptionWithAnomalyDialog("confirmAddingHttpException", securityStatus, exception, "userExceptions");
            });

            break;
        // site protocol is http
        case "000": case "001": case "010": case "011":
            exceptionButton.on("mouseup", function (e) {
                if (e.originalEvent && !e.originalEvent.isTrusted) { return; } // Deny trigger using JavaScript (not by actual the mouse)
                let exception = passSecTooltip.createUserException(passSec.websiteProtocol, passSec.domain, formURLObj.protocol, formURLObj.domain);
                $(element).qtip("hide");
                openConfirmAddingExceptionWithAnomalyDialog("confirmAddingHttpException", securityStatus, exception, "userExceptions");
            });

            if (passSec.httpsAvailable) {
                // "Switch to HTTPS" Event
                let changeToHttpsButton = $(tooltip.find("#passSecButtonSecureMode")[0]);
                changeToHttpsButton.on("mousedown", function (e) {
                    if (e.originalEvent && !e.originalEvent.isTrusted) { return; } // Deny trigger using JavaScript (not by actual the mouse)
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

function getElementsWithSameSecurityStatus(securityStatus) {
    return $('[data-passSec-security=' + securityStatus + ']');
}

function getElementsToUpdateAfterAddingException(prevSecurityStatus, exception, inputHasAnomaly) {
    let elementsWithSameSecStatObj = getElementsWithSameSecurityStatus(prevSecurityStatus);
    let elementsToUpdateAfterAddingExceptionArr = [];
    for (let i = 0; i < elementsWithSameSecStatObj.length; i++) {
        if (inputHasAnomaly) {
            let formElem = elementsWithSameSecStatObj[i].form;
            let formDomain = getDomainFromFormActionAttr(formElem);
            if (formDomain && exception.formDom == formDomain) {
                elementsToUpdateAfterAddingExceptionArr.push(elementsWithSameSecStatObj[i]);
            }
        } else if (exception != "") {
            elementsToUpdateAfterAddingExceptionArr.push(elementsWithSameSecStatObj[i]);
        }
    }
    return elementsToUpdateAfterAddingExceptionArr;
}

function updateSecurityClass(prevSecurityStatus, exception, inputHasAnomaly) {
    let updateElementsArr = getElementsToUpdateAfterAddingException(prevSecurityStatus, exception, inputHasAnomaly);
    let classToRemove = "";
    let classToAdd = "";

    if (!inputHasAnomaly) {
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
        if (elementHasTooltip(updateElem)) {
            $(updateElem).qtip('api').destroy(true);
        }
    }
};

function openConfirmAddingExceptionWithAnomalyDialog(message, securityStatus, exception, storageListName) {
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
                    passSecTooltip.addUserException(securityStatus, exception, storageListName, true);
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
