let changes = [];

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
    addTexts();
    init();
    addEvents();
});

/**
 * set texts of options page
 */
function addTexts() {
    // Title
    $("#options").html(browser.i18n.getMessage("settingsTitle"));
    $("#title").html(browser.i18n.getMessage("settingsTitle"));

    // Appearance tab
    $("#general").html(browser.i18n.getMessage("tab1"));
    $("#appearance").html(browser.i18n.getMessage("appearance"));
    $("#appearanceSecure").html(browser.i18n.getMessage("appearanceSecure"));
    $("#appearanceNotSecure").html(browser.i18n.getMessage("appearanceNotSecure"));
    $("#changeIconText").html(browser.i18n.getMessage("changeIconText"));
    $("#changeIconButton").html(browser.i18n.getMessage("changeIconButton"));

    // Redirects tab
    $("#redirects").html(browser.i18n.getMessage("tab2"));
    $("#httpsRedirects").html(browser.i18n.getMessage("httpsRedirects"));
    $("#showRedirects").html(browser.i18n.getMessage("showHttpsRedirects"));
    $("#clearRedirectionList").html(browser.i18n.getMessage("emptyList"));

    // Exceptions tab
    $("#exceptions").html(browser.i18n.getMessage("tab3"));
    $("#websiteExceptions").html(browser.i18n.getMessage("websiteExceptions"));
    $("#showWebsiteExceptions").html(browser.i18n.getMessage("showWebsiteExceptions"));
    $("#clearExceptionList").html(browser.i18n.getMessage("emptyList"));
    $("#checkExceptions").html(browser.i18n.getMessage("checkExceptions"));
    $("#checkAfter20").html(browser.i18n.getMessage("checkExceptions20Starts")).attr("title", browser.i18n.getMessage("checkExceptions20StartsTooltip"));

    // Field tab
    $("#fields").html(browser.i18n.getMessage("tab4"));
    $("#fieldTypes").html(browser.i18n.getMessage("fieldTypes"));
    $("#passwordField").html(browser.i18n.getMessage("passwordField"));
    $("#paymentField").html(browser.i18n.getMessage("paymentField"));
    $("#personalField").html(browser.i18n.getMessage("personalField"));
    $("#searchField").html(browser.i18n.getMessage("searchField"));

    // Additional buttons
    $("#revertChanges").html(browser.i18n.getMessage("revertChanges"));
    $("#defaultSettings").html(browser.i18n.getMessage("defaultSettings"));

    // Lists
    $("#redirectListTitle").html(browser.i18n.getMessage("httpsRedirects"));
    $("#exceptionListTitle").html(browser.i18n.getMessage("websiteExceptions"));
}

/**
 * initialize the options page
 */
function init() {
    // Appearance tab
    setImage();

    // Exceptions tab
    $("#checkAfter20Checkbox").prop("checked", window.localStorage.getItem("checkExceptionsAfter20Starts") === "true");

    // Field tab
    $("#pwField").prop("checked", window.localStorage.getItem("passwordField") === "true");
    $("#pyField").prop("checked", window.localStorage.getItem("paymentField") === "true");
    $("#perField").prop("checked", window.localStorage.getItem("personalField") === "true");
    $("#sField").prop("checked", window.localStorage.getItem("searchField") === "true");

    // Additional
    if ($("#redirectList")[0]) fillList("redirects");
    if ($("#exceptionList")[0]) fillList("exceptions");
    $("#statusSettings").html("");
}

/**
 *   filling the options page elements with functionality
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

    // Redirects tab
    $("#showRedirects").click(function (e) {
        $("#redirectList").toggle();
        $("#exceptionList").hide();
    });

    $("#clearRedirectionList").click(function (e) {
        save("redirects", window.localStorage.getItem("redirects"));
        window.localStorage.setItem("redirects", JSON.stringify([]));
        init();
    });

    // Exceptions tab
    $("#showWebsiteExceptions").click(function (e) {
        $("#redirectList").hide();
        $("#exceptionList").toggle();
    });

    $("#clearExceptionList").click(function (e) {
        save("exceptions", window.localStorage.getItem("exceptions"));
        window.localStorage.setItem("exceptions", JSON.stringify([]));
        init();
    });

    $("#checkAfter20Checkbox").on('change', function (e) {
        save("checkExceptionsAfter20Starts", window.localStorage.getItem("checkExceptionsAfter20Starts"));
        let checked = $(this).prop("checked");
        if (checked)
            window.localStorage.setItem("checkExceptionsAfter20Starts", {doCheck: true, count: 0});
        else
            window.localStorage.setItem("checkExceptionsAfter20Starts", {doCheck: false, count: 0});
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

    // Option buttons
    $("#revertChanges").on('click', function (e) {
        for (let i = 0; i < changes.length; i++) {
            if (!changes[i]) break;
            window.localStorage.setItem(changes[i][0], changes[i][1]);
        }
        init();
        $("#statusSettings").html(browser.i18n.getMessage("reversedChanges"));
    });

    $("#defaultSettings").on('click', function (e) {
        $.each(PassSec, function (i, v) {
            window.localStorage.setItem(v.label, v.value);
        });
        init();
        $("#statusSettings").html(browser.i18n.getMessage("defaultSettingsRestored"));
    });

}

function setImage() {
    let imgAddr = browser.extension.getURL("skin/check/gruen/gr_icon" + window.localStorage.getItem("secureImage") + ".png");
    $("#secureInputType").css("background-image", "url('" + imgAddr + "')");
    $("#notSecureInputType").css("background-image", "url('" + browser.extension.getURL("skin/yellow_triangle.png") + "')");
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
 * add all entries to the list of either exceptions or redirects
 */
function fillList(listId) {
    let listElements = [];
    try {
        listElements = JSON.parse(window.localStorage.getItem(listId));
    } catch (err) {

    }
    let htmlListId  = listId === "exceptions" ? "exceptionList" : "redirectList";
    let table = document.getElementById(htmlListId);
    table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
    if (!listElements) return;
    for (let i = 0; i < listElements.length; i++) {
        let row = table.insertRow(table.rows.length);
        let cell = row.insertCell(0);
        $(cell).html('<div><button id="' + listId + i + '" name="' + listElements[i] + '" style="margin-right:10px;color:red">X</button><span>' + listElements[i] + '</span></div>');
        $("#" + listId + i).on("click", function (e) {
            save(listId, window.localStorage.getItem(listId));
            let index = $(this).attr("id").replace(listId, "");
            $(this).parent().parent().parent().remove();
            let arr = [];
            try {
                arr = JSON.parse(window.localStorage.getItem(listId));
            } catch (err) {

            }
            if (arr)
                arr.splice(index, 1);
            window.localStorage.setItem(listId, JSON.stringify(arr));
        });
    }
}