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
        let tabId = $(this).children().first().attr("id");
        if (tabId !== "redirects") {
            $("#redirectList").hide();
            $("#showRedirects").html(browser.i18n.getMessage("showHttpsRedirects"));
        }
        if (tabId !== "exceptions") {
            $("#exceptionList").hide();
            $("#showWebsiteExceptions").html(browser.i18n.getMessage("showWebsiteExceptions"));
        }
    });
    addTexts();
    browser.storage.local.get().then(function (storage) {
        init(storage);
        addEvents(storage);
    });
});

/**
 * Sets the language dependant texts of the options page
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
    // $("#checkExceptions").html(browser.i18n.getMessage("checkExceptions"));
    // $("#checkAfter20").html(browser.i18n.getMessage("checkExceptions20Starts")).attr("title", browser.i18n.getMessage("checkExceptions20StartsTooltip"));

    // Field tab
    $("#fields").html(browser.i18n.getMessage("tab4"));
    $("#fieldTypes").html(browser.i18n.getMessage("fieldTypes"));
    $("#passwordField").html(browser.i18n.getMessage("passwordField"));
    $("#paymentField").html(browser.i18n.getMessage("paymentField"));
    $("#personalField").html(browser.i18n.getMessage("personalField"));
    $("#searchField").html(browser.i18n.getMessage("searchField"));

    // Cookies tab
    $("#cookies").html(browser.i18n.getMessage("tab5"));
    $("#cookieOptionsHeading").html(browser.i18n.getMessage("cookieOptionsHeading"));
    $("#cookieIntroQuestion1").html(browser.i18n.getMessage("cookieIntroQuestion1"));
    $("#cookieIntroAnswer1").html(browser.i18n.getMessage("cookieIntroAnswer1"));
    $("#cookieIntroQuestion2").html(browser.i18n.getMessage("cookieIntroQuestion2"));
    $("#cookieIntroAnswer2").html(browser.i18n.getMessage("cookieIntroAnswer2"));
    $("#cookieIntroQuestion3").html(browser.i18n.getMessage("cookieIntroQuestion3"));
    $("#cookieIntroAnswer3").html(browser.i18n.getMessage("cookieIntroAnswer3"));
    $("#cookieIntroQuestion4").html(browser.i18n.getMessage("cookieIntroQuestion4"));
    $("#cookieIntroAnswer4").html(browser.i18n.getMessage("cookieIntroAnswer4"));
    $("#cookieOptionDeleteOnce1").html(browser.i18n.getMessage("cookieOptionDeleteOnce1"));
    $("#cookieOptionDeleteOnce2").html(browser.i18n.getMessage("cookieOptionDeleteOnce2"));
    $("#cookieOptionAdvantage1").html(browser.i18n.getMessage("cookieOptionAdvantage"));
    $("#cookieOptionAdvantageText1").html(browser.i18n.getMessage("cookieOptionAdvantageText1"));
    $("#cookieOptionLimitation1").html(browser.i18n.getMessage("cookieOptionLimitation"));
    $("#cookieOptionLimitationText1").html(browser.i18n.getMessage("cookieOptionLimitationText1"));
    $("#cookieOptionNote1").html(browser.i18n.getMessage("cookieOptionNote"));
    $("#cookieOptionNoteText1").html(browser.i18n.getMessage("cookieOptionNoteText1"));
    $("#cookieOptionDeleteOnceButton").html(browser.i18n.getMessage("cookieOptionDeleteOnceButton"));
    $("#cookieOptionDeleteAutomatically1").html(browser.i18n.getMessage("cookieOptionDeleteAutomatically1"));
    $("#cookieOptionDeleteAutomatically2").html(browser.i18n.getMessage("cookieOptionDeleteAutomatically2"));
    $("#cookieOptionDeleteAutomatically3").html(browser.i18n.getMessage("cookieOptionDeleteAutomatically3"));
    $("#cookieOptionAdvantage2").html(browser.i18n.getMessage("cookieOptionAdvantage"));
    $("#cookieOptionAdvantageText2").html(browser.i18n.getMessage("cookieOptionAdvantageText2"));
    $("#cookieOptionLimitation2").html(browser.i18n.getMessage("cookieOptionLimitation"));
    $("#cookieOptionLimitationText2").html(browser.i18n.getMessage("cookieOptionLimitationText2"));
    $("#cookieOptionNote2").html(browser.i18n.getMessage("cookieOptionNote"));
    $("#cookieOptionNoteText2").html(browser.i18n.getMessage("cookieOptionNoteText2"));
    $("#cookieOptionDeleteAutomaticallyCheckbox").html(browser.i18n.getMessage("cookieOptionDeleteAutomaticallyCheckbox"));


    // Additional buttons
    $("#revertChanges").html(browser.i18n.getMessage("revertChanges"));
    $("#defaultSettings").html(browser.i18n.getMessage("defaultSettings"));

    // Lists
    $("#redirectListTitle").html(browser.i18n.getMessage("httpsRedirects"));
    $("#exceptionListTitle").html(browser.i18n.getMessage("websiteExceptions"));
}

/**
 * Initializes the options page by repopulating it with storage content
 *
 * @param storage Object containing the stored options at the time of opening the options page
 */
function init(storage) {
    // Appearance tab
    setImage(storage.secureImage);

    // Exceptions tab
    // $("#checkAfter20Checkbox").prop("checked", storage.checkExceptionsAfter20Starts.doCheck);

    // Field tab
    $("#pwField").prop("checked", storage.passwordField);
    $("#pyField").prop("checked", storage.paymentField);
    $("#perField").prop("checked", storage.personalField);
    $("#sField").prop("checked", storage.searchField);

    // Additional
    fillList("redirects", storage.redirects);
    fillList("exceptions", storage.exceptions);
}

/**
 *   Adds functionality for the option page elements
 *
 *   @param storage Object containing the stored options at the time of opening the options page
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
        if ($("#redirectList").toggle().is(":visible"))
            $("#showRedirects").html(browser.i18n.getMessage("hideHttpsRedirects"));
        else
            $("#showRedirects").html(browser.i18n.getMessage("showHttpsRedirects"));
    });

    $("#clearRedirectionList").click(function (e) {
        browser.storage.local.set({redirects: []});
        fillList("redirects", []);
        browser.runtime.sendMessage({type: "manageRedirectHandler"});
    });

    // Exceptions tab
    $("#showWebsiteExceptions").click(function (e) {
        if ($("#exceptionList").toggle().is(":visible"))
            $("#showWebsiteExceptions").html(browser.i18n.getMessage("hideWebsiteExceptions"));
        else
            $("#showWebsiteExceptions").html(browser.i18n.getMessage("showWebsiteExceptions"));
    });

    $("#clearExceptionList").click(function (e) {
        browser.storage.local.set({exceptions: []});
        fillList("exceptions", []);
    });

    // $("#checkExceptions").click(function (e) {
    //     // TODO
    // });

    // $("#checkAfter20Checkbox").on('change', function (e) {
    //     let checked = $(this).prop("checked");
    //     if (checked)
    //         browser.storage.local.set({checkExceptionsAfter20Starts: {doCheck: true, count: 0}});
    //     else
    //         browser.storage.local.set({checkExceptionsAfter20Starts: {doCheck: false, count: 0}});
    // });

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

    // Cookies tab
    $("#cookieOptionDeleteOnceButton").on('click', function (e) {
        if (window.confirm(browser.i18n.getMessage("cookieOptionDeleteOnceWarning"))) {
            browser.runtime.sendMessage({type: "deleteCookies"});
        }
    });

    $("#deleteCookiesOnStart").on('change', function (e) {
        browser.storage.local.set({deleteCookiesOnStart: $(this).prop("checked")});
    });

    // Option buttons
    $("#revertChanges").on('click', function (e) {
        browser.storage.local.set(storage);
        init(storage);
        $("#statusSettings").html(browser.i18n.getMessage("reversedChanges")).show().delay(7000).fadeOut(500);
        browser.runtime.sendMessage({type: "manageRedirectHandler"});
    });

    $("#defaultSettings").on('click', function (e) {
        if (window.confirm(browser.i18n.getMessage("defaultSettingsWarning"))) {
            browser.storage.local.set(PassSec);
            init(PassSec);
            $("#statusSettings").html(browser.i18n.getMessage("defaultSettingsRestored")).show().delay(7000).fadeOut(500);
            browser.runtime.sendMessage({type: "manageRedirectHandler"});
        }
    });
}

/**
 * Adds or updates the currently chosen secure image
 *
 * @param secureImage Integer indicating the current secure image
 */
function setImage(secureImage) {
    let imgAddress = browser.extension.getURL("skin/check/gruen/gr_icon" + secureImage + ".png");
    $("#secureInputType").css("background-image", "url('" + imgAddress + "')");
    $("#notSecureInputType").css("background-image", "url('" + browser.extension.getURL("skin/yellow_triangle.png") + "')");
    $("#iconImg").attr("src", imgAddress);
}

/**
 * Adds all entries to the list of either exceptions or redirects
 *
 * @param listType Either "exceptions" or "redirects", indicating which list to fill
 * @param listElements Array containing the elements to add to the list
 */
function fillList(listType, listElements) {
    let htmlListId  = listType === "exceptions" ? "exceptionList" : "redirectList";
    let table = document.getElementById(htmlListId);
    table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
    for (let i = 0; i < listElements.length; i++) {
        let row = table.insertRow(table.rows.length);
        let cell = row.insertCell(0);
        let nameToDisplay = listType === "exceptions" ? listElements[i] : listElements[i].slice(9).slice(0, listElements[i].length - 11);
            $(cell).html('<div><button id="' + listType + i + '" name="' + listElements[i] + '" style="margin-right:10px;color:red">X</button><span>' + nameToDisplay + '</span></div>');
        $("#" + listType + i).on("click", function (e) {
            let elementToRemove = $(this).attr("name");
            $(this).parent().parent().parent().remove();
            browser.storage.local.get(listType).then(function (item) {
                let array = item[listType].slice(0);
                let index = array.indexOf(elementToRemove);
                if (index !== -1) {
                    array.splice(index, 1);
                    let itemToSet = listType === "exceptions" ? {exceptions: array} : {redirects: array};
                    browser.storage.local.set(itemToSet);
                    if (listType === "redirects") {
                        browser.runtime.sendMessage({type: "manageRedirectHandler"});
                    }
                }
            });
        });
    }
}