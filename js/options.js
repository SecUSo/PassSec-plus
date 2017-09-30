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
    browser.storage.local.get().then(function (storage) {
        init(storage);
        addEvents(storage);
    });
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
function init(storage) {
    // Appearance tab
    setImage(storage.secureImage);

    // Exceptions tab
    $("#checkAfter20Checkbox").prop("checked", storage.checkExceptionsAfter20Starts.doCheck);

    // Field tab
    $("#pwField").prop("checked", storage.passwordField);
    $("#pyField").prop("checked", storage.paymentField);
    $("#perField").prop("checked", storage.personalField);
    $("#sField").prop("checked", storage.searchField);

    // Additional
    fillList("redirects", storage.redirects);
    fillList("exceptions", storage.exceptions);
    $("#statusSettings").html("");
}

/**
 *   filling the options page elements with functionality
 */
function addEvents(storage) {
    // Appearance tab
    $("#changeIconButton").click(function (e) {
        let currentSecureImage = $("#iconImg").attr("src").split("icon")[1].split(".")[0];
        currentSecureImage = (currentSecureImage % 10) + 1;
        browser.storage.local.set({secureImage: currentSecureImage});
        setImage(currentSecureImage);
    });

    // Redirects tab
    $("#showRedirects").click(function (e) {
        $("#redirectList").toggle();
        $("#exceptionList").hide();
    });

    $("#clearRedirectionList").click(function (e) {
        browser.storage.local.set({redirects: []});
        fillList("redirects", []);
    });

    // Exceptions tab
    $("#showWebsiteExceptions").click(function (e) {
        $("#redirectList").hide();
        $("#exceptionList").toggle();
    });

    $("#clearExceptionList").click(function (e) {
        browser.storage.local.set({exceptions: []});
        fillList("exceptions", []);
    });

    $("#checkAfter20Checkbox").on('change', function (e) {
        let checked = $(this).prop("checked");
        if (checked)
            browser.storage.local.set({checkExceptionsAfter20Starts: {doCheck: true, count: 0}});
        else
            browser.storage.local.set({checkExceptionsAfter20Starts: {doCheck: false, count: 0}});
    });

    // Fields tab
    $("#pwField").on('change', function (e) {
        browser.storage.local.set({passwordField: $(this).prop("checked")});
    });

    $("#pyField").on('change', function (e) {
        browser.storage.local.set({paymentField: $(this).prop("checked")});
    });

    $("#perField").on('change', function (e) {
        browser.storage.local.set({personalField: $(this).prop("checked")});
    });

    $("#sField").on('change', function (e) {
        browser.storage.local.set({searchField: $(this).prop("checked")});
    });

    // Option buttons
    $("#revertChanges").on('click', function (e) {
        browser.storage.local.set(storage);
        init(storage);
        $("#statusSettings").html(browser.i18n.getMessage("reversedChanges"));
    });

    $("#defaultSettings").on('click', function (e) {
        browser.storage.local.set(PassSec);
        init(PassSec);
        $("#statusSettings").html(browser.i18n.getMessage("defaultSettingsRestored"));
    });
}

function setImage(secureImage) {
    let imgAddress = browser.extension.getURL("skin/check/gruen/gr_icon" + secureImage + ".png");
    $("#secureInputType").css("background-image", "url('" + imgAddress + "')");
    $("#notSecureInputType").css("background-image", "url('" + browser.extension.getURL("skin/yellow_triangle.png") + "')");
    $("#iconImg").attr("src", imgAddress);
}

/**
 * add all entries to the list of either exceptions or redirects
 */
function fillList(listType, listElements) {
    let htmlListId  = listType === "exceptions" ? "exceptionList" : "redirectList";
    let table = document.getElementById(htmlListId);
    table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
    for (let i = 0; i < listElements.length; i++) {
        let row = table.insertRow(table.rows.length);
        let cell = row.insertCell(0);
        $(cell).html('<div><button id="' + listType + i + '" name="' + listElements[i] + '" style="margin-right:10px;color:red">X</button><span>' + listElements[i] + '</span></div>');
        $("#" + listType + i).on("click", function (e) {
            let index = $(this).attr("id").replace(listType, "");
            $(this).parent().parent().parent().remove();
            browser.storage.local.get(listType).then(function (item) {
                let array = item[listType];
                array.splice(index, 1);
                let itemToSet = listType === "exceptions" ? {exceptions: array} : {redirects: array};
                browser.storage.local.set(itemToSet);
            });
        });
    }
}