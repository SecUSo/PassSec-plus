let passSec = {};
let inputElementClicked = false;

// listen for messages from background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === "addException")
        addException(false);
});

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
    chrome.storage.local.get(null, function (items) {
        getSecurityStatus(items);
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

/**
 * Creates a tooltip for a specific input element
 * The tooltip is immediately displayed after creation
 *
 * @param element The element the tooltips should be displayed for
 * @param event The event that triggered the call of this function
 */
function applyTooltip(element, event) {
    // only show tooltip on security status "http" or "https", "httpsEV" does not show any tooltips
    if ($(element).hasClass("passSec-http") || $(element).hasClass("passSec-https") || $(element).attr("data-passSec-security") === "passSec-http" || $(element).attr("data-passSec-security") === "passSec-https") {
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
                    method: 'shift flip',
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
                    processTooltip();
                }
            }
        }, event);
    }
}

/**
 * Extracts the domain out of a given URL
 *
 * @param url The URL of which the domain should be extracted
 * @param tld A list of known top level domains
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
