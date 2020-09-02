let passSec = {};
let inputElementClicked = false;

// processing starts here and is continued when the background script sends the extracted domain
passSec.url = document.location.href;
chrome.runtime.sendMessage({type: "extractDomain", host: document.location.host});

// listen for messages from background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.type) {
        case "addException":
            addException(false, "none");
            break;
        case "extractedDomain":
            passSec.domain = message.domain;
            chrome.storage.local.get(null, function (items) {
                processInputs(items);
                // normally the focus event handler would be enough here, but we need the mousedown down handler
                // and the 'inputElementClicked' flag to accomplish the following: When the user closes the tooltip
                // by clicking 'Ok, got it.', the tooltip should open up again when clicking on the still focused
                // input element (so the tooltip should open, even though no focus event is fired, but it should not
                // open up twice if focus of an element is caused by a click)
                $('body').on('mousedown', 'input,textarea', function (event) {
                    if (!$(event.target).is($(document.activeElement)))
                        inputElementClicked = true;
                    applyTooltip(event.target, event);
                }).on('focus', 'input,textarea', function (event) {
                    if (!inputElementClicked)
                        applyTooltip(event.target, event);
                    inputElementClicked = false;
                });
            });
            break;
    }        
});    

/**
 * Creates a tooltip for a specific input element
 * The tooltip is immediately displayed after creation
 *
 * @param element The element the tooltips should be displayed for
 * @param event The event that triggered the call of this function
 */
function applyTooltip(element, event) {
    // only show tooltip on security status "http" or "https", "httpsEV" does not show any tooltips
	securityStatus = $(element).attr("data-passSec-security");
    if ($(element).hasClass("passSec-http") || $(element).hasClass("passSec-https") || securityStatus === "passSec-http" || securityStatus === "passSec-https") {
        passSec.target = element;
		
        $(element).qtip({
            overwrite: true,
            suppress: true,
            content: {
                text: getTooltipHTML()
            },
            show: {
                event: event.type,
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
                    processTooltip(securityStatus);
                }
            }
        }, event);
    }
}