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
    $("#passwordField").html(chrome.i18n.getMessage("passwordFieldDescription"));
    $("#paymentField").html(chrome.i18n.getMessage("paymentFieldDescription"));
    $("#personalField").html(chrome.i18n.getMessage("personalFieldDescription"));
    $("#searchField").html(chrome.i18n.getMessage("searchFieldDescription"));
    $("#notesOnFields").html(chrome.i18n.getMessage("notesOnFields"));

    // Symbol tab
    $("#general").html(chrome.i18n.getMessage("symbolTab"));
    $("#changeIconText").html(chrome.i18n.getMessage("changeIconText"));
    $("#iconHint").html(chrome.i18n.getMessage("iconHint"));
    $("#changeIconButton").html(chrome.i18n.getMessage("changeIconButton"));

    // Domains and redirects exception tab
    $("#exceptions").html(chrome.i18n.getMessage("domainsTab"));
    $("#trustedListText").html(chrome.i18n.getMessage("lowRiskDomains"));
    $("#activateTrustedList").html(chrome.i18n.getMessage("activateLowRiskList"));
    $("#showTrustedDomains").html(chrome.i18n.getMessage("showList"));
    $("#userListText").html(chrome.i18n.getMessage("userTrustedDomains"));
    $("#userHttpListText").html(chrome.i18n.getMessage("userExceptions"));
    $("#editUserDefined").html(chrome.i18n.getMessage("editList"));
    $("#editHttpUserDefined").html(chrome.i18n.getMessage("editList"));
    $("#httpsRedirects").html(chrome.i18n.getMessage("httpsRedirects"));
    $("#showRedirects").html(chrome.i18n.getMessage("editList"));

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

    //timer tab
    $("#timerCheckbox").prop("checked", storage.timer > 0);
    $("#timerInput").val(storage.timer);
}

function openConfirmDialog(title, content, confirmButtonFunction, cancelButtonText) {
    $.confirm({
        title: title,
        content: content,
        buttons: {
            ok: function () {
                confirmButtonFunction();
            },
            cancel: {
                text: cancelButtonText
            }
        },
    });
};

var passSecOptions = {
    updateHTMLTable(id, listElements, userInputOpt, deleteOpt, deleteAllOpt, dialog) {
        var listHTMLStr = getListHTML(id, listElements, userInputOpt, deleteOpt, deleteAllOpt);
        dialog.setContent(listHTMLStr);
        dialog.onContentReady();
    },
    isTableEmpty(tableID) {
        return document.getElementById(tableID).getElementsByTagName("td").length == 0;
    }
};

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


    // Exceptions tab
    $("#trustedListActivated").on('change', function (e) {
        chrome.storage.local.set({ trustedListActivated: $(this).prop("checked") });
    });

    $("#showRedirects").click(function (e) {
        var redirectsDialog = $.dialog({
            title: chrome.i18n.getMessage("domainsTab") + ": " + chrome.i18n.getMessage("httpsRedirects"),
            onOpenBefore: function () {
                chrome.storage.local.get("redirects", function (item) {
                    var listHTMLStr = getListHTML("redirectList", item.redirects, false, true, true);
                    redirectsDialog.setContent(listHTMLStr);
                });
            },
            onContentReady: function () {
                var table = document.getElementById('redirectList');
                if (table != null) {
                    let tableRowsArr = document.getElementById('redirectList').getElementsByTagName("td");

                    for (let i = 0; i < tableRowsArr.length; i++) {
                        var elementToDelete = this.$content.find('#redirectList' + i);
                        elementToDelete.on("mousedown", function () {
                            var removeEntryDialogAcceptFunc = function () {
                                elementToDelete.parent().parent().parent().remove();
                                removeUserException("redirects", i);
                                if (passSecOptions.isTableEmpty('redirectList')) {
                                    passSecOptions.updateHTMLTable("redirectList", [], false, true, true, redirectsDialog);
                                }
                            }
                            var deleteEntryWarning = chrome.i18n.getMessage("deleteEntryWarning", elementToDelete.next().text());
                            openConfirmDialog("PassSec+", deleteEntryWarning, removeEntryDialogAcceptFunc, chrome.i18n.getMessage("cancelButton"));
                        });
                    }
                }
                redirectsDialog.$content.find('#clearList').on("mousedown", function () {
                    var removeAllEntriesDialogFunc = function () {
                        removeAll("redirects");
                        redirectsDialog.setContent(chrome.i18n.getMessage("listIsEmpty"));
                    }
                    openConfirmDialog("PassSec+", chrome.i18n.getMessage("deleteAllEntriesWarning"), removeAllEntriesDialogFunc, chrome.i18n.getMessage("cancelButton"));
                });
            }
        });
    });

    $("#showTrustedDomains").click(function (e) {
        $.dialog({
            title: chrome.i18n.getMessage("domainsTab") + ": " + chrome.i18n.getMessage("lowRiskDomains"),
            draggable: true,
            dragWindowBorder: false,
            onOpenBefore: function () {
                let listHTMLStr = getListHTML("trustedlist", storage.trustedDomains, false, false, false);
                this.setContent(listHTMLStr);
            },
        });
    });

    $("#editUserDefined").click(function (e) {
        var userTrustedDialog = $.dialog({
            title: chrome.i18n.getMessage("domainsTab") + ": " + chrome.i18n.getMessage("userTrustedDomains"),
            onOpenBefore: function () {
                chrome.storage.local.get("userTrustedDomains", function (item) {
                    var listHTMLStr = getListHTML("userTrustedList", item.userTrustedDomains, true, true, true);
                    userTrustedDialog.setContent(listHTMLStr);
                });
            },
            onContentReady: function () {
                var table = document.getElementById('userTrustedList');
                if (table != null) {
                    let tableRowsArr = table.getElementsByTagName("td");
                    for (let i = 0; i < tableRowsArr.length; i++) {
                        let elementToDelete = this.$content.find('#userTrustedList' + i);
                        elementToDelete.on("mousedown", function (event) {
                            var removeEntryDialogAcceptFunc = function () {
                                removeUserException("userTrustedDomains", i);
                                elementToDelete.parent().parent().parent().remove();
                                if (passSecOptions.isTableEmpty('userTrustedList')) {
                                    passSecOptions.updateHTMLTable("userTrustedList", [], true, true, true, userTrustedDialog);
                                }
                            }
                            var deleteEntryWarning = chrome.i18n.getMessage("deleteEntryWarning", elementToDelete.next().text());
                            openConfirmDialog("PassSec+", deleteEntryWarning, removeEntryDialogAcceptFunc, chrome.i18n.getMessage("cancelButton"));
                        });
                    }
                }
                this.$content.find('#clearList').on("mousedown", function (event) {
                    var removeAllEntriesDialogFunc = function () {
                        removeAll("userTrustedDomains");
                        passSecOptions.updateHTMLTable("userTrustedList", [], true, true, true, userTrustedDialog);
                    }
                    openConfirmDialog("PassSec+", chrome.i18n.getMessage("deleteAllEntriesWarning"), removeAllEntriesDialogFunc, chrome.i18n.getMessage("cancelButton"));
                });

                userTrustedDialog.$content.find('#addUserDefined').on("mousedown", function (event) {
                    var userInput = $("#userDefinedInput").val().replace(" ", "");
                    addUserDefined(userInput, "userTrustedDomains", userTrustedDialog);
                    $("#userDefinedInput").val("");
                });
            }
        });
    });

    $("#editHttpUserDefined").click(function (e) {
        var userExceptionsDialog = $.dialog({
            title: chrome.i18n.getMessage("domainsTab") + ": " + chrome.i18n.getMessage("userExceptions"),
            onOpenBefore: function () {
                chrome.storage.local.get("userExceptions", function (item) {
                    var listHTMLStr = getListHTML("userExceptionList", item.userExceptions, false, true, true);
                    userExceptionsDialog.setContent(listHTMLStr);
                });
            },
            onContentReady: function () {
                var table = document.getElementById('userExceptionList');
                if (table != null) {
                    let tableRowsArr = table.getElementsByTagName("td");
                    for (let i = 0; i < tableRowsArr.length; i++) {
                        var elementToDelete = this.$content.find('#userExceptionList' + i);
                        elementToDelete.on("mousedown", function (event) {
                            var removeEntryDialogAcceptFunc = function () {
                                elementToDelete.parent().parent().parent().remove();
                                removeUserException("userExceptions", i);
                                if (passSecOptions.isTableEmpty('userExceptionList')) {
                                    passSecOptions.updateHTMLTable("userExceptionList", [], false, true, true, userExceptionsDialog);
                                }
                            }
                            var deleteEntryWarning = chrome.i18n.getMessage("deleteEntryWarning", elementToDelete.next().text());
                            openConfirmDialog("PassSec+", deleteEntryWarning, removeEntryDialogAcceptFunc, chrome.i18n.getMessage("cancelButton"));
                        });
                    }
                }
                this.$content.find('#clearList').on("mousedown", function (event) {
                    var removeAllEntriesDialogFunc = function () {
                        removeAll("userExceptions");
                        userExceptionsDialog.setContent(chrome.i18n.getMessage("listIsEmpty"));
                    }
                    openConfirmDialog("PassSec+", chrome.i18n.getMessage("deleteAllEntriesWarning"), removeAllEntriesDialogFunc, chrome.i18n.getMessage("cancelButton"));
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

    //timer tab
    $("#timerCheckbox").on("change", function (e) {
        var checked = $(this).prop("checked");
        if (!checked) {
            chrome.storage.local.set({ timer: 0 });
            $("#timerInput").val("0");
        } else {
            chrome.storage.local.set({ timer: 3 });
            $("#timerInput").val("3");
        }
    });

    $("#timerInput").on("change", function (e) {
        var timer = $(this).val();
        chrome.storage.local.set({ timer: timer });
        if (timer == 0) $("#timerCheckbox").prop("checked", false);
        else $("#timerCheckbox").prop("checked", true);
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

function getListHTML(id, listElements, userInputOpt, deleteOpt, deleteAllOpt) {
    var listHTML = "";
    if (userInputOpt) {
        buttonText = chrome.i18n.getMessage("addEntries");
        listHTML += "<div><input id='userDefinedInput' type='text' autofocus/><button id='addUserDefined'>" + buttonText + "</button></div>";
        listHTML += "<br><br>";
    }
    if (listElements.length == 0) {
        listHTML += chrome.i18n.getMessage("listIsEmpty");
    } else {
        listHTML += "<table id='" + id + "'>";
        for (let i = 0; i < listElements.length; i++) {
            switch (id) {
                case "trustedlist", "userTrustedList":
                    var displayedContent = listElements[i];
                    break;
                case "userExceptionList":
                    let obj = listElements[i];
                    var displayedContent = obj.siteProtocol.toString() + obj.siteDom.toString() + "<em> nach </em>" + obj.formProtocol.toString() + obj.formDom.toString();
                    break;
                case "redirectList":
                    var displayedContent = listElements[i];
            }
            if (deleteOpt) {
                listHTML += '<tr><td><div><button id="' + id + i + '" style="margin-right:10px;color:red">X</button><span>' + displayedContent + '</span></div></td></tr>';
            } else {
                listHTML += "<tr><td>" + listElements[i] + "</td></tr>";
            }
        }
        listHTML += "</table>";
        if (deleteAllOpt) {
            listHTML += "<br><br>";
            listHTML += "<div><button id='clearList'>Liste leeren</button></div>";
        }
    }
    return listHTML;
}

/**
 * Adds or updates the currently chosen secure image
 *
 * @param secureImage Integer indicating the current secure image
 */
function setImage(secureImage) {
    let imgAddress = chrome.runtime.getURL("skin/check/gruen/gr_icon" + secureImage + ".png");
    $("#secureInputType").css("background-image", "url('" + imgAddress + "')");
    $("#notSecureInputType").css("background-image", "url('" + chrome.runtime.getURL("skin/yellow_triangle.png") + "')");
    $("#iconImg").attr("src", imgAddress);
}


function addUserDefined(exception, storageListName, userTrustedDialog) {
    chrome.storage.local.get(storageListName, function (item) {
        let updatedExceptions = item[storageListName].slice(0);
        if (!updatedExceptions.includes(exception)) {
            updatedExceptions.push(exception);
            chrome.storage.local.set({ [storageListName]: updatedExceptions });
            passSecOptions.updateHTMLTable("userTrustedList", updatedExceptions, true, true, true, userTrustedDialog);
        }
    });
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

