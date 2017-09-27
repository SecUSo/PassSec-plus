let passSec = passSec || {};
let inputElementClicked = false;

chrome.runtime.sendMessage({"name": 'TLD'}, function (tld) {
    passSec.url = document.location.href;
    passSec.domain = extractDomain(document.location.host, tld);

    chrome.runtime.sendMessage({name: "getStorage"}, function (r) {
        getSecurityStatus(r);
        processInputs(r);

        // normally the focus event handler would be enough here, but we need the mousedown down handler
        // and the 'inputElementClicked' flag to accomplish the following: When the user closes the tooltip
        // by clicking 'Ok, got it.', the tooltip should open up again when clicking on the still focused
        // input element (so the tooltip should open, even though no focus event is fired)
        $('body').on('mousedown', 'input', function (event) {
            if (!$(event.target).is($(document.activeElement)))
                inputElementClicked = true;
            applyTooltip(event.target, event);
        }).on('focus', 'input', function (event) {
            if (!inputElementClicked)
                applyTooltip(event.target, event);
            inputElementClicked = false;
        })
    });
});

function applyTooltip(element, event) {
    console.log("applying tooltip");
    console.log(element.type);
    console.log(element.classList.contains("passSecNoTooltip"));
    if ((element.type === "password" || element.type === "search") && !element.classList.contains("passSecNoTooltip")) {
        passSec.target = element;
        // Show the qtip
        $(element).qtip({
            overwrite: true,
            suppress: true,
            content: {
                text: getTexts()
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
                    method: 'shift none',
                    scroll: false
                }
            },
            style: {
                tip: false,
                classes: 'passSecTooltip',
                widget: true,
                def: false
            },
            events: {
                render: function (event, api) {
                    console.log("now rendering qTip");
                    passSec.api = api;
                    passSec.tooltip = api.elements.content;
                    processTooltip();
                }
            }
        }, event);
    }
}
