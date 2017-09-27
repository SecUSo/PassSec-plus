let changes = [];
let defaultRedirects = ["google.de", "de-de.facebook.com", "youtube.com", "google.com", "de.wikipedia.org", "wikipedia.de", "de.yahoo.com", "login.yahoo.com", "tumblr.com"];

$(document).ready(function () {
    $('.tabs .tab-links a').on('click', function (e) {
        let currentAttrValue = $(this).attr('href');
        // Show/Hide Tabs
        $('.tabs ' + currentAttrValue).show().fadeIn(400).siblings().hide();

        // Change/remove current tab to active
        $(this).parent('li').addClass('active').siblings().removeClass('active');
        e.preventDefault();
    });
    $('li').on("click", function (e) {
        $("#redirectList").hide();
        $("#exceptionList").hide();
    });

    $("#redirectList").hide();
    $("#exceptionList").hide();

    // init changes for "revert changes" button
    changes = [];

    addTexts();
    init();
    addEvents();
});

/**
 * set texts of options page
 */
function addTexts() {
    // Title
    $("#options").html(chrome.i18n.getMessage("settingsTitle"));
    $("#title").html(chrome.i18n.getMessage("settingsTitle"));

    // Appearance tab
    $("#general").html(chrome.i18n.getMessage("tab1"));
    $("#appearance").html(chrome.i18n.getMessage("appearance"));
    $("#appearanceSecure").html(chrome.i18n.getMessage("appearanceSecure"));
    $("#appearanceNotSecure").html(chrome.i18n.getMessage("appearanceNotSecure"));
    $("#changeIconText").html(chrome.i18n.getMessage("changeIconText"));
    $("#changeIconButton").html(chrome.i18n.getMessage("changeIconButton"));

    // Redirections tab
    $("#tab2").html(chrome.i18n.getMessage("tab2"));
    $("#recommendedRedirections").html(chrome.i18n.getMessage("recommendedRedirections"));
    $("#recommendedRedirectionsInfo").html(chrome.i18n.getMessage("addRedirectionList"));
    $("#addRecommendedRedirections").html(chrome.i18n.getMessage("addRecommendedRedirections"));
    $("#httpsRedirects").html(chrome.i18n.getMessage("httpsRedirections"));
    $("#showRedirects").html(chrome.i18n.getMessage("showHttpsRedirections"));
    $("#clearRedirectionList").html(chrome.i18n.getMessage("emptyList"));

    // Exceptions tab
    $("#tab3").html(chrome.i18n.getMessage("tab3"));
    $("#websiteExceptions").html(chrome.i18n.getMessage("websiteExceptions"));
    $("#showWebsiteExceptions").html(chrome.i18n.getMessage("showWebsiteExceptions"));
    $("#clearExceptionList").html(chrome.i18n.getMessage("emptyList"));
    $("#checkExceptions").html(chrome.i18n.getMessage("checkExceptions"));
    $("#checkAfter20").html(chrome.i18n.getMessage("checkExceptions20Starts")).attr("title", chrome.i18n.getMessage("checkExceptions20StartsTooltip"));

    // Field tab
    $("#tab4").html(chrome.i18n.getMessage("tab4"));
    $("#fieldTypes").html(chrome.i18n.getMessage("fieldTypes"));
    $("#passwordField").html(chrome.i18n.getMessage("passwordField"));
    $("#paymentField").html(chrome.i18n.getMessage("paymentField"));
    $("#personalField").html(chrome.i18n.getMessage("personalField"));
    $("#searchField").html(chrome.i18n.getMessage("searchField"));
    $("#httpsSecurity").html(chrome.i18n.getMessage("httpsSecurity"));
    $("#classifySafe").html(chrome.i18n.getMessage("brokenHttps"));
    $("#brokenHTTPSDescription").html(chrome.i18n.getMessage("brokenHTTPSDescription"));

    // Additional buttons
    $("#saveChanges").html(chrome.i18n.getMessage("saveChanges"));
    $("#revertChanges").html(chrome.i18n.getMessage("revertChanges"));
    $("#defaultSettings").html(chrome.i18n.getMessage("defaultSettings"));

    // Lists
    $("#redirectListTitle").html(chrome.i18n.getMessage("httpsRedirections"));
    $("#exceptionListTitle").html(chrome.i18n.getMessage("websiteExceptions"));
}

/**
 * initialize the options page
 */
function init() {
    // Appearance tab
    setImage();

    // Redirections tab
    $("#addRecommendedRedirections").prop("disabled", containsDefaults());

    // Exceptions tab
    $("#checkAfter20Checkbox").prop("checked", window.localStorage.getItem("checkAfter20Starts") === "true");

    // Field tab
    $("#pwField").prop("checked", window.localStorage.getItem("passwordField") === "true");
    $("#pyField").prop("checked", window.localStorage.getItem("paymentField") === "true");
    $("#perField").prop("checked", window.localStorage.getItem("personalField") === "true");
    $("#sField").prop("checked", window.localStorage.getItem("searchField") === "true");
    $("#classifySafeCheckbox").prop("checked", window.localStorage.getItem("brokenHTTPSSafe") === "true");

    // Additional
    if ($("#redirectList")[0]) fillRedirectList();
    if ($("#exceptionList")[0]) fillExceptionList();
    $("#statusSettings").html("");
}

/**
 *   filling the options page elements with functionalities
 */
function addEvents() {
    // Appearance tab
    $("#changeIconButton").click(function (e) {
        let imgNum = window.localStorage.getItem("secureImage");
        save("secureImage", imgNum);
        save("secureEVImage", imgNum);
        imgNum = parseInt(imgNum);
        imgNum = imgNum < 10 ? imgNum + 1 : 1;
        window.localStorage.setItem("secureImage", "" + imgNum);
        window.localStorage.setItem("secureEVImage", "" + imgNum);
        setImage();
    });

    // Redirections tab
    $("#addRecommendedRedirections").on('click', function (e) {
        save("redirections", window.localStorage.getItem("redirections"));
        let arr = [];
        try {
            arr = JSON.parse(window.localStorage.getItem("redirections"));
        } catch (err) {
        }
        if (!containsDefaults()) {
            for (let i = 0; i < defaultRedirects.length; i++) {
                if (!arr || arr.indexOf(defaultRedirects[i]) === -1) {
                    if (!arr) arr = [defaultRedirects[i]];
                    else arr.push(defaultRedirects[i]);
                }
            }
            window.localStorage.setItem("redirections", JSON.stringify(arr));
            init();
        }
    });

    $("#showRedirects").click(function (e) {
        $("#redirectList").toggle();
        $("#exceptionList").hide();
        init();
    });

    $("#clearRedirectionList").click(function (e) {
        save("redirections", window.localStorage.getItem("redirections"));
        window.localStorage.setItem("redirections", JSON.stringify([]));
        init();
    });

    // Exceptions tab
    $("#showWebsiteExceptions").click(function (e) {
        $("#redirectList").hide();
        $("#exceptionList").toggle();
        init();
    });

    $("#clearExceptionList").click(function (e) {
        save("exceptions", window.localStorage.getItem("exceptions"));
        window.localStorage.setItem("exceptions", JSON.stringify([]));
        init();
    });

    $("#checkAfter20Checkbox").on('change', function (e) {
        save("checkAfter20Starts", window.localStorage.getItem("checkAfter20Starts"));
        let checked = $(this).prop("checked");
        window.localStorage.setItem("checkAfter20Starts", checked);
    });

    // Fields tab
    $("#pwField").on('change', function (e) {
        save("passwordField", window.localStorage.getItem("passwordField"));
        let checked = $(this).prop("checked");
        window.localStorage.setItem("passwordField", checked);
    });

    $("#pyField").on('change', function (e) {
        save("paymentField", window.localStorage.getItem("paymentField"));
        let checked = $(this).prop("checked");
        window.localStorage.setItem("paymentField", checked);
    });

    $("#perField").on('change', function (e) {
        save("personalField", window.localStorage.getItem("personalField"));
        let checked = $(this).prop("checked");
        window.localStorage.setItem("personalField", checked);
    });

    $("#sField").on('change', function (e) {
        save("searchField", window.localStorage.getItem("searchField"));
        let checked = $(this).prop("checked");
        window.localStorage.setItem("searchField", checked);
    });

    $("#classifySafeCheckbox").on('change', function (e) {
        save("brokenHTTPSSafe", window.localStorage.getItem("brokenHTTPSSafe"));
        let checked = $(this).prop("checked");
        window.localStorage.setItem("brokenHTTPSSafe", checked);
    });

    $("#revertChanges").on('click', function (e) {
        for (let i = 0; i < changes.length; i++) {
            if (!changes[i]) break;
            window.localStorage.setItem(changes[i][0], changes[i][1]);
        }
        init();
        $("#statusSettings").html(chrome.i18n.getMessage("reversedChanges"));
    });

    $("#defaultSettings").on('click', function (e) {
        window.localStorage.setItem("secureImage", "1");
        window.localStorage.setItem("secureEVImage", "1");
        window.localStorage.setItem("checkExceptionAuto", false);
        window.localStorage.setItem("passwordField", true);
        window.localStorage.setItem("paymentField", true);
        window.localStorage.setItem("personalField", true);
        window.localStorage.setItem("searchField", true);
        window.localStorage.setItem("brokenHTTPSSafe", false);
        window.localStorage.setItem("checkAfter20Starts", false);
        window.localStorage.setItem("exceptions", JSON.stringify([]));
        window.localStorage.setItem("redirections", JSON.stringify([]));
        init();
        $("#statusSettings").html(chrome.i18n.getMessage("defaultSettingsRestored"));
    });

}

/**
 * returns true if redirect list contains default redirects, else if not
 */
function containsDefaults() {
    let arr = [];
    try {
        arr = JSON.parse(window.localStorage.getItem("redirects"));
    } catch (err) {

    }
    let contains = true;
    for (let i = 0; i < defaultRedirects.length; i++) {
        // if one element is not contained, contains is false
        if (!arr || !arr.indexOf(defaultRedirects[i]) > -1) return false;
    }
    return contains;
}

function setImage() {
    let imgAddr = chrome.extension.getURL("skin/check/gruen/gr_icon" + window.localStorage.getItem("secureImage") + ".png");
    $("#secureInputType").css("background-image", "url('" + imgAddr + "')");
    $("#notSecureInputType").css("background-image", "url('" + chrome.extension.getURL("skin/yellow_triangle.png") + "')");
    $("#iconImg").attr("src", imgAddr);
}

function save(list, value) {
    for (let i = 0; i < changes.length; i++) {
        if (changes[i][0] === list) {
            return;
        }
    }
    changes.push([list, value]);
}

/**
 * adding all entries to the list of redirection domains
 */
function fillRedirectList() {
    console.log("fill list");
    let redirects = [];
    try {
        redirects = JSON.parse(window.localStorage.getItem("redirections"));
    } catch (err) {

    }
    console.log(redirects);
    let table = document.getElementById("redirectList");
    table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
    if (!redirects)
        return;
    for (let i = 0; i < redirects.length; i++) {
        let row = table.insertRow(table.rows.length);
        let cell = row.insertCell(0);
        $(cell).html('<div><button id="redirects' + i + '" name="' + redirects[i] + '" style="margin-right:10px;color:red">X</button><span>' + redirects[i] + '</span></div>');
        $("#redirects" + i).on("click", function (e) {
            save("redirects", window.localStorage.getItem("redirects"));
            let element = $(this).next().html();
            let index = $(this).attr("id").replace("redirects", "");
            $(this).parent().parent().parent().remove();
            let arr = [];
            try {
                arr = JSON.parse(window.localStorage.getItem("redirects"));
            } catch (err) {

            }
            if (arr)
                arr.splice(index, 1);
            window.localStorage.setItem("redirects", JSON.stringify(arr));
        });
    }
}

/**
 * adding all entries to the list of exceptions domains
 */
function fillExceptionList() {
    let exceptions = [];
    try {
        exceptions = JSON.parse(window.localStorage.getItem("exceptions"));
    } catch (err) {

    }
    let table = document.getElementById("exceptionList");
    table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
    if (!exceptions) return;
    for (let i = 0; i < exceptions.length; i++) {
        let row = table.insertRow(table.rows.length);
        let cell = row.insertCell(0);
        $(cell).html('<div><button id="exceptions' + i + '" name="' + exceptions[i] + '" style="margin-right:10px;color:red">X</button><span>' + exceptions[i] + '</span></div>');
        $("#exceptions" + i).on("click", function (e) {
            save("exceptions", window.localStorage.getItem("exceptions"));
            let element = $(this).next().html();
            let index = $(this).attr("id").replace("exceptions", "");
            $(this).parent().parent().parent().remove();
            let arr = [];
            try {
                arr = JSON.parse(window.localStorage.getItem("exceptions"));
            } catch (err) {

            }
            if (arr)
                arr.splice(index, 1);
            window.localStorage.setItem("exceptions", JSON.stringify(arr));
        });
    }
}
