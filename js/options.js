
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
    $("#addNewIconButton").html(chrome.i18n.getMessage("addNewIconButton"));

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

   
}

/**
 *   Adds functionality for the option page elements
 *
 *   @param storage Object containing the stored options at the time of opening the options page
 */
function addEvents(storage) {
    // Appearance tab
    $("#changeIconButton").click(function (e) {
        if (typeof storage.secureImage != 'number') {
            console.log("storage.secureImage is not a number");
            let currentSecureImage = $("#iconImg").attr("src").split("icon")[1].split(".")[0];
            currentSecureImage = (currentSecureImage % 10) + 1;
            chrome.storage.local.set({'secureImage': currentSecureImage});
            setImage(currentSecureImage);
        } else {
            let currentSecureImage = $("#iconImg").attr("src").split("icon")[1].split(".")[0];
            currentSecureImage = (currentSecureImage % 10) + 1;
            chrome.storage.local.set({secureImage: currentSecureImage});
            setImage(currentSecureImage);
        }
    });

    $("#addNewIconButton").change(function (e) {
        const fileList = e.target.files;
        fileupload(fileList);
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
    $("#iconImg").attr("src", chrome.extension.getURL("skin/check/gruen/gr_icon1.png"));
    $("#notSecureInputType").css("background-image", "url('" + chrome.extension.getURL("skin/yellow_triangle.png") + "')");
    
    if(typeof secureImage === 'number') {
        console.log("secureImage is a number: " + secureImage);
        let imgAddress = chrome.extension.getURL("skin/check/gruen/gr_icon" + secureImage + ".png");
        $("#secureInputType").css("background-image", "url('" + imgAddress + "')");
        $("#iconImg").attr("src", imgAddress);
    } else {
        console.log("secure Image is not a number its data:image");
        let customImgAddress = chrome.extension.getURL(localStorage.getItem('customIcon')); // customImgAddress = "chrome-extension://mhgmcanloimbdgagakolhennlaklhink/data:image/png;base64,"
        chrome.storage.local.get('secureImage', function(data) {
            $("#newIconImg").attr("src",data.secureImage);
        });
        /*  $("#newIconImg").css("background-image", "url(" + localStorage['customIcon'] + ")");
            $("#iconImg").attr("src", customImgAddress); */
    }
}

function fileupload(fileList) {
    // erste Datei auswählen (wichtig, weil IMMER ein FileList Objekt generiert wird)
    var uploadFile = fileList[0];
    
    // Ein Objekt um Dateien einzulesen
    var reader = new FileReader();

    // Wenn der Dateiinhalt ausgelesen wurde...
    reader.onload = function(theFileData) {
        var icon = theFileData.target.result; // Ergebnis vom FileReader auslesen
        localStorage['customIcon'] = icon;
        chrome.storage.local.set({'secureImage': icon}, function() {alert('Image set!')});
    };
    // Die Datei einlesen und in eine Data-URL konvertieren
    reader.readAsDataURL(uploadFile);
    setImage("custom");
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
        let nameToDisplay = listType === "exceptions" ? listElements[i].split("passSec-")[0] : listElements[i].slice(9).slice(0, listElements[i].length - 11);
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