// listen for messages from background script
chrome.runtime.onMessage.addListener(function (message) {
    if (message.type === "deletedCookies") {
        if (message.status === "success")
            $("#statusSettings").html(chrome.i18n.getMessage("cookieOptionDeleteOnceSuccess")).show().delay(7000).fadeOut(500);
        else
            $("#statusSettings").html(chrome.i18n.getMessage("cookieOptionDeleteOnceFailure")).show().delay(7000).fadeOut(500);
    }
});

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
            $("#showRedirects").html(chrome.i18n.getMessage("showHttpsRedirects"));
        }
        if (tabId !== "exceptions") {
            $("#exceptionList").hide();
            $("#showWebsiteExceptions").html(chrome.i18n.getMessage("showWebsiteExceptions"));
        }
    });
    addTexts();
    chrome.storage.local.get(null, function (storage) {
        init(storage);
        addEvents(storage);
    });
});

/**
 * Sets the language dependant texts of the options page
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

    // Redirects tab
    $("#redirects").html(chrome.i18n.getMessage("tab2"));
    $("#httpsRedirects").html(chrome.i18n.getMessage("httpsRedirects"));
    $("#showRedirects").html(chrome.i18n.getMessage("showHttpsRedirects"));
    $("#clearRedirectionList").html(chrome.i18n.getMessage("emptyList"));

    // Exceptions tab
    $("#exceptions").html(chrome.i18n.getMessage("tab3"));
    $("#websiteExceptions").html(chrome.i18n.getMessage("websiteExceptions"));
    $("#showWebsiteExceptions").html(chrome.i18n.getMessage("showWebsiteExceptions"));
    $("#clearExceptionList").html(chrome.i18n.getMessage("emptyList"));
    // $("#checkExceptions").html(chrome.i18n.getMessage("checkExceptions"));
    // $("#checkAfter20").html(chrome.i18n.getMessage("checkExceptions20Starts")).attr("title", chrome.i18n.getMessage("checkExceptions20StartsTooltip"));

    // Fields tab
    $("#fields").html(chrome.i18n.getMessage("tab4"));
    $("#fieldTypes").html(chrome.i18n.getMessage("fieldTypes"));
    $("#passwordField").html(chrome.i18n.getMessage("passwordField"));
    $("#paymentField").html(chrome.i18n.getMessage("paymentField"));
    $("#personalField").html(chrome.i18n.getMessage("personalField"));
    $("#searchField").html(chrome.i18n.getMessage("searchField"));

    // Cookies tab
    $("#cookies").html(chrome.i18n.getMessage("tab5"));
    $("#cookieOptionsHeading").html(chrome.i18n.getMessage("cookieOptionsHeading"));
    $("#cookieIntroQuestion1").html(chrome.i18n.getMessage("cookieIntroQuestion1"));
    $("#cookieIntroAnswer1").html(chrome.i18n.getMessage("cookieIntroAnswer1"));
    $("#cookieIntroQuestion2").html(chrome.i18n.getMessage("cookieIntroQuestion2"));
    $("#cookieIntroAnswer2").html(chrome.i18n.getMessage("cookieIntroAnswer2"));
    $("#cookieIntroQuestion3").html(chrome.i18n.getMessage("cookieIntroQuestion3"));
    $("#cookieIntroAnswer3").html(chrome.i18n.getMessage("cookieIntroAnswer3"));
    $("#cookieIntroQuestion4").html(chrome.i18n.getMessage("cookieIntroQuestion4"));
    $("#cookieIntroAnswer4").html(chrome.i18n.getMessage("cookieIntroAnswer4"));
    $("#cookieOptionDeleteOnce1").html(chrome.i18n.getMessage("cookieOptionDeleteOnce1"));
    $("#cookieOptionDeleteOnce2").html(chrome.i18n.getMessage("cookieOptionDeleteOnce2"));
    $("#cookieOptionAdvantage1").html(chrome.i18n.getMessage("cookieOptionAdvantage"));
    $("#cookieOptionAdvantageText1").html(chrome.i18n.getMessage("cookieOptionAdvantageText1"));
    $("#cookieOptionLimitation1").html(chrome.i18n.getMessage("cookieOptionLimitation"));
    $("#cookieOptionLimitationText1").html(chrome.i18n.getMessage("cookieOptionLimitationText1"));
    $("#cookieOptionNote1").html(chrome.i18n.getMessage("cookieOptionNote"));
    $("#cookieOptionNoteText1").html(chrome.i18n.getMessage("cookieOptionNoteText1"));
    $("#cookieOptionDeleteOnceButton").html(chrome.i18n.getMessage("cookieOptionDeleteOnceButton"));
    $("#cookieOptionDeleteAutomatically1").html(chrome.i18n.getMessage("cookieOptionDeleteAutomatically1"));
    $("#cookieOptionDeleteAutomatically2").html(chrome.i18n.getMessage("cookieOptionDeleteAutomatically2"));
    $("#cookieOptionDeleteAutomatically3").html(chrome.i18n.getMessage("cookieOptionDeleteAutomatically3"));
    $("#cookieOptionAdvantage2").html(chrome.i18n.getMessage("cookieOptionAdvantage"));
    $("#cookieOptionAdvantageText2").html(chrome.i18n.getMessage("cookieOptionAdvantageText2"));
    $("#cookieOptionLimitation2").html(chrome.i18n.getMessage("cookieOptionLimitation"));
    $("#cookieOptionLimitationText2").html(chrome.i18n.getMessage("cookieOptionLimitationText2"));
    $("#cookieOptionNote2").html(chrome.i18n.getMessage("cookieOptionNote"));
    $("#cookieOptionNoteText2").html(chrome.i18n.getMessage("cookieOptionNoteText2"));
    $("#cookieOptionDeleteAutomaticallyCheckbox").html(chrome.i18n.getMessage("cookieOptionDeleteAutomaticallyCheckbox"));


    // Additional buttons
    $("#revertChanges").html(chrome.i18n.getMessage("revertChanges"));
    $("#defaultSettings").html(chrome.i18n.getMessage("defaultSettings"));

    // Lists
    $("#redirectListTitle").html(chrome.i18n.getMessage("httpsRedirects"));
    $("#exceptionListTitle").html(chrome.i18n.getMessage("websiteExceptions"));
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

    // Fields tab
    $("#pwField").prop("checked", storage.passwordField);
    $("#pyField").prop("checked", storage.paymentField);
    $("#perField").prop("checked", storage.personalField);
    $("#sField").prop("checked", storage.searchField);

    // Redirects and exceptions
    fillList("redirects", storage.redirects);
    fillList("exceptions", storage.exceptions);

    // Cookies tab
    $("#deleteCookiesOnStart").prop("checked", storage.deleteCookiesOnStart);
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
        chrome.storage.local.set({secureImage: currentSecureImage});
        setImage(currentSecureImage);
    });

    // Redirects tab
    $("#showRedirects").click(function (e) {
        if ($("#redirectList").toggle().is(":visible"))
            $("#showRedirects").html(chrome.i18n.getMessage("hideHttpsRedirects"));
        else
            $("#showRedirects").html(chrome.i18n.getMessage("showHttpsRedirects"));
    });

    $("#clearRedirectionList").click(function (e) {
        chrome.storage.local.set({redirects: []});
        fillList("redirects", []);
        chrome.runtime.sendMessage({type: "manageRedirectHandler"});
    });

    // Exceptions tab
    $("#showWebsiteExceptions").click(function (e) {
        if ($("#exceptionList").toggle().is(":visible"))
            $("#showWebsiteExceptions").html(chrome.i18n.getMessage("hideWebsiteExceptions"));
        else
            $("#showWebsiteExceptions").html(chrome.i18n.getMessage("showWebsiteExceptions"));
    });

    $("#clearExceptionList").click(function (e) {
        chrome.storage.local.set({exceptions: []});
        fillList("exceptions", []);
    });

    // $("#checkExceptions").click(function (e) {
    //     // TODO
    // });

    // $("#checkAfter20Checkbox").on('change', function (e) {
    //     let checked = $(this).prop("checked");
    //     if (checked)
    //         chrome.storage.local.set({checkExceptionsAfter20Starts: {doCheck: true, count: 0}});
    //     else
    //         chrome.storage.local.set({checkExceptionsAfter20Starts: {doCheck: false, count: 0}});
    // });

    // Fields tab
    $("#pwField").on('change', function (e) {
        chrome.storage.local.set({passwordField: $(this).prop("checked")});
    });

    $("#pyField").on('change', function (e) {
        chrome.storage.local.set({paymentField: $(this).prop("checked")});
    });

    $("#perField").on('change', function (e) {
        chrome.storage.local.set({personalField: $(this).prop("checked")});
    });

    $("#sField").on('change', function (e) {
        chrome.storage.local.set({searchField: $(this).prop("checked")});
    });

    // Cookies tab
    $("#cookieOptionDeleteOnceButton").on('click', function (e) {
        $.confirm({
            title: "PassSec+",
            content: chrome.i18n.getMessage("cookieOptionDeleteOnceWarning"),
            buttons: {
                ok: function () {
                    chrome.runtime.sendMessage({type: "deleteCookies"});
                },
                cancel: {
                    text: chrome.i18n.getMessage("cancelButton")
                }
            },
            backgroundDismissAnimation: "none",
            animateFromElement: false,
            animation: "opacity",
            closeAnimation: "opacity",
            useBootstrap: false,
            boxWidth: "40%"
        });
    });

    $("#deleteCookiesOnStart").on('change', function (e) {
        chrome.storage.local.set({deleteCookiesOnStart: $(this).prop("checked")});
    });

    // Option buttons
    $("#revertChanges").on('click', function (e) {
        chrome.storage.local.set(storage);
        init(storage);
        $("#statusSettings").html(chrome.i18n.getMessage("reversedChanges")).show().delay(7000).fadeOut(500);
        chrome.runtime.sendMessage({type: "manageRedirectHandler"});
    });

    $("#defaultSettings").on('click', function (e) {
        $.confirm({
            title: "PassSec+",
            content: chrome.i18n.getMessage("defaultSettingsWarning"),
            buttons: {
                ok: function () {
                    chrome.storage.local.set(PassSec);
                    init(PassSec);
                    $("#statusSettings").html(chrome.i18n.getMessage("defaultSettingsRestored")).show().delay(7000).fadeOut(500);
                    chrome.runtime.sendMessage({type: "manageRedirectHandler"});
                },
                cancel: {
                    text: chrome.i18n.getMessage("cancelButton")
                }
            },
            backgroundDismissAnimation: "none",
            animateFromElement: false,
            animation: "opacity",
            closeAnimation: "opacity",
            useBootstrap: false,
            boxWidth: "40%"
        });
    });
}

/**
 * Adds or updates the currently chosen secure image
 *
 * @param secureImage Integer indicating the current secure image
 */
function setImage(secureImage) {
    let imgAddress = chrome.extension.getURL("skin/check/gruen/gr_icon" + secureImage + ".png");
    $("#secureInputType").css("background-image", "url('" + imgAddress + "')");
    $("#notSecureInputType").css("background-image", "url('" + chrome.extension.getURL("skin/yellow_triangle.png") + "')");
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
            chrome.storage.local.get(listType, function (item) {
                let array = item[listType].slice(0);
                let index = array.indexOf(elementToRemove);
                if (index !== -1) {
                    array.splice(index, 1);
                    let itemToSet = listType === "exceptions" ? {exceptions: array} : {redirects: array};
                    chrome.storage.local.set(itemToSet);
                    if (listType === "redirects") {
                        chrome.runtime.sendMessage({type: "manageRedirectHandler"});
                    }
                }
            });
        });
    }
}