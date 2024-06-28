var passSec = passSec || {};
let inputElementClicked = false;
var activeElement = null;

// listen for messages from background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.type) {
        case "addException":
            addException(false, "none");
            break;
    }
});

const showTooltipEvent = jQuery.Event('showTooltip');
const timerIsZeroEvent = jQuery.Event('timerIsZero');


// processing starts here and is continued when the background script sends the extracted domain
passSec.url = document.location.href;
$(document).ready(function () {
    chrome.runtime.sendMessage({ type: "TLD" }, function (r) {
        passSec.publicSuffixList.parse(r, punycode.toASCII);
    });

    passSec.domain = passSec.publicSuffixList.getDomain(document.location.host);
    passSec.websiteProtocol = document.location.protocol;

    chrome.storage.local.get(null, function (items) {
        processInputs(items);

        // normally the focus event handler would be enough here, but we need the mousedown down handler
        // and the 'inputElementClicked' flag to accomplish the following: When the user closes the tooltip
        // by clicking 'Ok, got it.', the tooltip should open up again when clicking on the still focused
        // input element (so the tooltip should open, even though no focus event is fired, but it should not
        // open up twice if focus of an element is caused by a click)
        $('body').on('mousedown', 'input,textarea', function (event) {
            if (!elementHasAlreadyOpenTooltip(event.target)) {
                $(event.target).trigger(showTooltipEvent);
                if (!elementHasTooltip(event.target)) {
                    applyTooltip(event.target, event);
                }
            }
        }).on('focus', 'input,textarea', function (event) {
            if (!elementHasAlreadyOpenTooltip(event.target)) {
                $(event.target).trigger(showTooltipEvent);
                if (!elementHasTooltip(event.target)) {
                    applyTooltip(event.target, event);
                }
            }
        }).on('timerIsZero', function (event) {
            $(activeElement).prop("disabled", false);
            $(passSec.tooltip.find("#passSecButtonException")[0]).prop("disabled", false);
            $(activeElement).focus();
        });
    });
});

function elementHasTooltip(element) {
    let qtipID = $(element).attr("data-hasqtip");
    return (qtipID != undefined);
}

function elementHasAlreadyOpenTooltip(element) {
    let qtipID = $(element).attr("data-hasqtip");
    if (qtipID != undefined) {
        let qtipElem = $("[data-qtip-id=" + qtipID + "]");
        let qtipIsHiddenAttrStr = qtipElem.attr("aria-hidden").toLowerCase().trim();
        let qtipIsHidden = (qtipIsHiddenAttrStr === 'true');
        return !qtipIsHidden;
    }
    return false;
}

function isIP(address) {
    const ipWithProtocol = new RegExp(
        "^http[s]?://((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])"
    );
    const ipWithoutProtocol = new RegExp(
        "^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])"
    );
    return ipWithProtocol.test(address) || ipWithoutProtocol.test(address);
}

/**
 * get domain out of hostname
 */
function extractDomain(hostname) {
    if (isIP(hostname)) {
        return hostname;
    } else {
        var psl = passSec.publicSuffixList.getDomain(hostname);
        // psl empty -> url is already a valid domain
        return psl != "" ? psl : hostname;
    }
}

function getDomainFromFormActionAttr(formElem) {
    try {
        var formAction = formElem.action;
        var formActionURL = new URL(formAction);
        var formActionDomain = extractDomain(formActionURL.host);
        return formActionDomain;
    } catch (e) {
        console.log(e);
    }
}

function constructURL(urlStr) {
    try {
        const url = new URL(urlStr);
    } catch (e) {
        return null;
    }
}

function getURLInfos(urlStr) {
    let url = new URL(urlStr);
    let domain = extractDomain(url.host);
    let protocol = url.protocol;
    return {
        url: urlStr,
        protocol: protocol,
        domain: domain
    };
}


/**
 * Creates a tooltip for a specific input element
 * The tooltip is immediately displayed after creation
 *
 * @param element The element the tooltips should be displayed for
 * @param event The event that triggered the call of this function
 */
function applyTooltip(element, event) {
    let securityStatus = $(element).attr("data-passSec-security");
    let securityStatusClass = $(element).attr("data-passSec-security-class");
    var fieldType = $(element).attr("data-passsec-input-type");

    // only show tooltip on security status "http" or "https", "httpsEV" does not show any tooltips
    if ($(element).hasClass("passSec-red") || $(element).hasClass("passSec-grey") || securityStatusClass === "passSec-red" || securityStatusClass === "passSec-grey") {
        passSec.target = element;
        var form = element.form;
        var formURLObj = getURLInfos(form.action);
        var timerName = passSecTimer.determineNameOfTimer(fieldType, passSec.websiteProtocol, passSec.domain, formURLObj.protocol, formURLObj.domain);
        // $(element).attr("data-passSec-timer", timerName);
        $(element).qtip({
            overwrite: true,
            suppress: true,
            content: {
                text: getTooltipHTML(securityStatus, passSec.httpsAvailable, fieldType)
            },
            show: {
                event: 'showTooltip',
                ready: true,
                solo: true,
                delay: 0
            },
            hide: {
                fixed: true,
                event: 'unfocus'
            },
            position: {
                at: 'left bottom',
                my: 'top left',
                viewport: true,
                adjust: {
                    // We don't do a vertical flip here, because if we do a flip, it can happen that the tooltip is
                    // displayed outside of the viewport, but if we don't do the flip, the height is extended and the
                    // user can scroll down to see the tooltip contents
                    method: 'shift none',
                    scroll: false
                }
            },
            style: {
                tip: false,
                classes: 'passSecTooltip',
                def: false
            },
            events: {
                render: function (event, api) {
                    passSec.api = api;
                    passSec.tooltip = api.elements.content;
                    let qtipID = $(this).attr('id');

                    assignText(passSec.tooltip, passSec.url, securityStatus, fieldType, formURLObj, qtipID);
                    addFunctionalityForTooltipElements(passSec.tooltip, securityStatus, fieldType, element, formURLObj);

                    var exceptionButton = $(passSec.tooltip.find("#passSecButtonException")[0]);
                    var elementsToDisableWhenTimerIsActivated = [$(element), exceptionButton];
                    var elementToDisplayTimer = passSec.tooltip.find("#passSecTimer")[0];
                    let timer = passSecTimer.getTimer(timerName);
                    if (timer != null) {
                        timer.dialogIDs.push(qtipID);
                    }
                    passSecTimer.startCountdown(timerName, elementToDisplayTimer, element, elementsToDisableWhenTimerIsActivated, false, qtipID);
                },
                hide: function () {
                    if (passSecTimer.timerArr != null) {
                        let timer = passSecTimer.getTimer(timerName);
                        if (timer != null) {
                            if (timer.timerIntervall.id() != null) {
                                timer.timerIntervall.pause();
                                $(element).prop("disabled", false);
                            }
                        }
                    }
                },
                show: function () {
                    activeElement = element;
                    if (passSecTimer.timerArr != null) {
                        let timer = passSecTimer.getTimer(timerName);
                        if (timer != null) {
                            if (timer.timerIntervall.id() != null) {
                                timer.timerIntervall.resume();
                                $(element).prop("disabled", true);
                            }
                        }
                    }
                }
            }
        }, event);
    }

}