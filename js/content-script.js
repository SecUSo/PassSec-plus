let passSec = {};
let inputElementClicked = false;

// get top level domains (for domain extraction in urls)
let getTLDs = new Promise(function (resolve, reject) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4)
            resolve(xhttp.response);
    };
    xhttp.open('GET', "https://publicsuffix.org/list/public_suffix_list.dat", true);
    xhttp.send(null);
});

getTLDs.then(function (tld) {
    passSec.url = document.location.href;
    passSec.domain = extractDomain(document.location.host, tld);
    browser.storage.local.get().then(function (items) {
        getSecurityStatus(items).then(function () {
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
    });
});

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
