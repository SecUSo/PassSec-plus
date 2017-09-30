let passSec = {};
let inputElementClicked = false;

// get top level domains (for domain extraction in urls)
let xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function () {
    if (xhttp.readyState === 4) {
        passSec.url = document.location.href;
        passSec.domain = extractDomain(document.location.host, xhttp.response);
        browser.storage.local.get().then(function (items) {
            getSecurityStatus();
            processInputs(items);
            // normally the focus event handler would be enough here, but we need the mousedown down handler
            // and the 'inputElementClicked' flag to accomplish the following: When the user closes the tooltip
            // by clicking 'Ok, got it.', the tooltip should open up again when clicking on the still focused
            // input element (so the tooltip should open, even though no focus event is fired, but it should not
            // open up twice if focus of an element is caused by a click)
            $('body').on('mousedown', 'input', function (event) {
                if (!$(event.target).is($(document.activeElement)))
                    inputElementClicked = true;
                applyTooltip(event.target, event);
            }).on('focus', 'input', function (event) {
                if (!inputElementClicked)
                    applyTooltip(event.target, event);
                inputElementClicked = false;
            });
        });
    }
};
xhttp.open('GET', "https://publicsuffix.org/list/public_suffix_list.dat", true);
xhttp.send(null);

function applyTooltip(element, event) {
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
                    passSec.api = api;
                    passSec.tooltip = api.elements.content;
                    processTooltip();
                }
            }
        }, event);
    }
}
