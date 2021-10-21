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

    // Fields tab
    $("#fields").html(chrome.i18n.getMessage("fieldsTab"));
    $("#fieldTypes").html(chrome.i18n.getMessage("fieldTypes"));
    $("#passwordField").html(chrome.i18n.getMessage("passwordField"));
    $("#paymentField").html(chrome.i18n.getMessage("paymentField"));
    $("#personalField").html(chrome.i18n.getMessage("personalField"));
    $("#searchField").html(chrome.i18n.getMessage("searchField"));
    $("#notesOnFields").html(chrome.i18n.getMessage("notesOnFields"));

    // Symbol tab
    $("#general").html(chrome.i18n.getMessage("symbolTab"));
    $("#changeIconText").html(chrome.i18n.getMessage("changeIconText"));
    $("#iconHint").html(chrome.i18n.getMessage("iconHint"));
    $("#changeIconButton").html(chrome.i18n.getMessage("changeIconButton"));

    // Domains tab
    $("#httpsRedirects").html(chrome.i18n.getMessage("httpsRedirects"));
    $("#showRedirects").html(chrome.i18n.getMessage("showList"));
    $("#clearRedirectionList").html(chrome.i18n.getMessage("emptyList"));
    $("#exceptions").html(chrome.i18n.getMessage("domainsTab"));
    $("#trustedListText").html(chrome.i18n.getMessage("lowRiskDomains"));
    $("#activateTrustedList").html(chrome.i18n.getMessage("activateLowRiskList"));
    $("#showTrustedDomains").html(chrome.i18n.getMessage("showList"));
    $("#userListText").html(chrome.i18n.getMessage("userTrustedDomains"));
    $("#userHttpListText").html(chrome.i18n.getMessage("userExceptions"));
    $("#editUserDefined").html(chrome.i18n.getMessage("editList"));
    $("#editHttpUserDefined").html(chrome.i18n.getMessage("editList"));;
    
    // Timer tab
    $("#passSecTimer").html(chrome.i18n.getMessage("timerTab"));
    $("#timerCheckboxText").html(chrome.i18n.getMessage("timerActivated"));
    $("#timerAmountText").html(chrome.i18n.getMessage("timerAmount"));
    $("#seconds").html(chrome.i18n.getMessage("seconds"));

    // Additional buttons
    $("#revertChanges").html(chrome.i18n.getMessage("revertChanges"));
    $("#defaultSettings").html(chrome.i18n.getMessage("defaultSettings"));

}

/**
 * Initializes the options page by repopulating it with storage content
 *
 * @param storage Object containing the stored options at the time of opening the options page
 */
function init(storage) {
    // Appearance tab
    setImage(storage.secureImage);

    // Fields tab
    $("#pwField").prop("checked", storage.passwordField);
    $("#pyField").prop("checked", storage.paymentField);
    $("#perField").prop("checked", storage.personalField);
    $("#sField").prop("checked", storage.searchField);

    // Redirects and exceptions
    $("#trustedListActivated").prop("checked", storage.trustedListActivated);
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
        chrome.storage.local.set({ secureImage: currentSecureImage });
        setImage(currentSecureImage);
    });

    $("#clearRedirectionList").click(function (e) {
        chrome.storage.local.set({ redirects: [] });
        fillList("redirects", "redirectList", []);
        chrome.runtime.sendMessage({ type: "manageRedirectHandler" });
    });

    // Exceptions tab
    $("#trustedListActivated").on('change', function (e) {
        chrome.storage.local.set({ trustedListActivated: $(this).prop("checked") });
    });

    $("#showTrustedDomains").click(function (e) {
        $("#exceptionList").hide();
        $("#exceptionHttpList").hide();

        $.dialog({
            title: chrome.i18n.getMessage("domainsTab"),
            onOpenBefore: function () {
                let listHeader = chrome.i18n.getMessage("trustedList");
                let listHTMLStr = getListHTML("trustedlist", listHeader, storage.trustedDomains, false);
                this.setContent(listHTMLStr);
            },
        });
    });

    $("#editUserDefined").click(function (e) {
        var userTrustedDialog = $.dialog({
            title: chrome.i18n.getMessage("domainsTab"),
            onOpenBefore: function () {
                chrome.storage.local.get("userTrustedDomains", function (item) {
                    let listHeader = chrome.i18n.getMessage("userTrustedList");
                    let listHTMLStr = getListHTML("userTrustedList", listHeader, item.userTrustedDomains, true);
                    userTrustedDialog.setContent(listHTMLStr);
                });
            },
            onContentReady: function () {
                let tableRowsArr = document.getElementById('userTrustedList').getElementsByTagName("td");
                for (let i = 0; i < tableRowsArr.length; i++) {
                    this.$content.find('#userTrustedList' + i).on("mousedown", function (event) {
                        $(this).parent().parent().parent().remove();
                        removeUserException("userTrustedDomains", i);
                    });
                }
                this.$content.find('#clearUserTrustedList').on("mousedown", function (event) {
                    removeAll("userTrustedDomains");
                    userTrustedDialog.close();
                });
            }
        });
    });

    $("#editHttpUserDefined").click(function (e) {
        var userExceptionsDialog = $.dialog({
            title: chrome.i18n.getMessage("domainsTab"),
            onOpenBefore: function () {
                chrome.storage.local.get("exceptions", function (item) {
                    let listHeader = chrome.i18n.getMessage("userExceptionList");
                    let listHTMLStr = getListHTML("userExceptionList", listHeader, item.exceptions, true);
                    listHTMLStr += "<div><button id='clearUserExceptionList'>Liste leeren</button></div>";
                    userExceptionsDialog.setContent(listHTMLStr);
                });
            },
            onContentReady: function () {
                let tableRowsArr = document.getElementById('userExceptionList').getElementsByTagName("td");
                for (let i = 0; i < tableRowsArr.length; i++) {
                    this.$content.find('#userExceptionList' + i).on("mousedown", function (event) {
                        $(this).parent().parent().parent().remove();
                        removeUserException("exceptions", i);
                    });
                }
                this.$content.find('#clearUserExceptionList').on("mousedown", function (event) {
                    removeAll("exceptions");
                    userExceptionsDialog.close();
                });
            }
        });
    });


    // Fields tab
    $("#pwField").on('change', function (e) {
        chrome.storage.local.set({ passwordField: $(this).prop("checked") });
    });

    $("#pyField").on('change', function (e) {
        chrome.storage.local.set({ paymentField: $(this).prop("checked") });
    });

    $("#perField").on('change', function (e) {
        chrome.storage.local.set({ personalField: $(this).prop("checked") });
    });

    $("#sField").on('change', function (e) {
        chrome.storage.local.set({ searchField: $(this).prop("checked") });
    });


    // Option buttons
    $("#revertChanges").on('click', function (e) {
        chrome.storage.local.set(storage);
        init(storage);
        $("#statusSettings").html(chrome.i18n.getMessage("reversedChanges")).show().delay(7000).fadeOut(500);
        chrome.runtime.sendMessage({ type: "manageRedirectHandler" });
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
                    chrome.runtime.sendMessage({ type: "manageRedirectHandler" });
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

function getListHTML(id, listHeader, listElements, deleteOpt) {
    var listHTML = "<table id='" + id + "'>";
    listHTML += "<tr><th>" + listHeader + "</th></tr>";
    for (let i = 0; i < listElements.length; i++) {
        switch (id) {
            case "trustedlist", "userTrustedList":
                var displayedContent = listElements[i];
                break;
            case "userExceptionList":
                let obj = listElements[i];
                var displayedContent = obj.siteProtocol.toString() + obj.siteDom.toString() + " nach " + obj.formProtocol.toString() + obj.formDom.toString();
                break;
        }
        if (deleteOpt) {
            listHTML += '<tr><td><div><button id="' + id + i + '" style="margin-right:10px;color:red">X</button><span>' + displayedContent + '</span></div></td></tr>';
        } else {
            listHTML += "<tr><td>" + listElements[i] + "</td></tr>";
        }
    }
    listHTML += "</table>";
    return listHTML;
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
 * 
 * @param {string} list 
 * @returns result object which contains a list of all https exceptions and a list of all http exceptions
 */

function getExceptions(list) {
    let result = {
        httpsExceptionList: [],
        httpExceptionList: []
    }
    for (let listitem of list) {
        let listitemTuple = listitem.split("passSec-");
        let listitemSecurityStatus = listitemTuple[1]
        if (listitemSecurityStatus == "all" || listitemSecurityStatus == "https") {
            result.httpsExceptionList.push(listitem);
        }
        if (listitemSecurityStatus == "all" || listitemSecurityStatus == "http") {
            result.httpExceptionList.push(listitem);
        }
    }
    return result;
}
function removeUserException(storageListName, index) {
    chrome.storage.local.get(storageListName, function (item) {
        let listItems = item[storageListName].slice(0);
        if (index !== -1) {
            listItems.splice(index, 1);
            chrome.storage.local.set({ [storageListName]: listItems });
        }
    });
}

function removeAll(storageListName) {
    chrome.storage.local.set({ [storageListName]: [] });
}


function removeException(list, listName, elementToRemove) {
    chrome.storage.local.get(list, function (storage) {
        let listItems = storage[list].slice(0);
        let index = listItems.indexOf(elementToRemove);
        if (index !== -1) {
            if (elementToRemove.endsWith("passSec-all")) {
                if (listName == "exceptionsHttpList")
                    listItems.push(elementToRemove.replace("passSec-all", "passSec-https"));
                else {
                    listItems.push(elementToRemove.replace("passSec-all", "passSec-http"));
                }
            }
            listItems.splice(index, 1);
            chrome.storage.local.set({ exceptions: listItems });
        }
    });
}
/**
 * Adds all entries to the list of either exceptions or redirects
 *
 * @param listType Either "exceptions" or "redirects", indicating which list to fill
 * @param listElements Array containing the elements to add to the list
 */
function fillList(listType, listName, listElements) {
    let htmlListId = listName; //listType === "exceptions" ? "exceptionList" : "redirectList";
    let table = document.getElementById(htmlListId);
    table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
    for (let i = 0; i < listElements.length; i++) {
        let row = table.insertRow(table.rows.length);
        let cell = row.insertCell(0);
        let nameToDisplay = (listType === "exceptions" || listType === "httpExceptions") ? listElements[i].split("passSec-")[0] : listElements[i].slice(9).slice(0, listElements[i].length - 11);
        $(cell).html('<div><button id="' + listName + i + '" name="' + listElements[i] + '" style="margin-right:10px;color:red">X</button><span>' + nameToDisplay + '</span></div>');
        $("#" + listName + i).on("click", function (e) {
            let elementToRemove = $(this).attr("name");
            $(this).parent().parent().parent().remove();
            removeException(listType, listName, elementToRemove);
        });
    }
}