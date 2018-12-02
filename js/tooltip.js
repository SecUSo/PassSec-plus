/**
 * Returns the HTML skeleton for a tooltip
 */
function getTooltipHTML() {
    return '<span id="passSecWarning" class="http-warning passSecTooltipText"></span>' +
        '<hr class="http-warning">' +
        '<span id="passSecURL" class="passSecTooltipText">' + chrome.i18n.getMessage("domainInfo") + '<span id="passSecDomain" class="passSecTooltipText">' + passSec.domain + '</span>.</span>' +
        '<span id="passSecVerify" class="passSecTooltipText">' + chrome.i18n.getMessage("verifyDomain") + '</span>' +
        '<div id="passSecConsequence" class="http-warning">' +
        '<img id="passSecConsequenceImage" src=' + chrome.extension.getURL("skin/consequence.png") + '>' +
        '<p id="passSecConsequenceText" class="passSecTooltipText"></p>' +
        '</div>' +
        '<div id="passSecRecommendation" class="http-warning littleText">' +
        '<img id="passSecRecommendationImage" src=' + chrome.extension.getURL("skin/recommendation.png") + '>' +
        '<p id="passSecRecommendationText" class="passSecTooltipText"></p>' +
        '</div>' +
        '<div id="passSecInfo" class="http-warning littleText">' +
        '<img id="passSecInfoImage" src=' + chrome.extension.getURL("skin/more_info.png") + '>' +
        '<p id="passSecInfoText" class="passSecClickable passSecTooltipText">' + chrome.i18n.getMessage("moreInfo") + '</p>' +
        '</div>' +
        '<div id="passSecButtons>">' +
        '<button id="passSecButtonException" type="button" class="passSecTooltipText"></button>' +
        '<button id="passSecButtonClose" type="button" class="passSecTooltipText">' + chrome.i18n.getMessage("OK") + ' </button>' +
        '</div>';
}

/**
 * Adds functionality for the tooltip elements
 */
function processTooltip(securityStatus) {
    let tooltip = passSec.tooltip;
    $(tooltip.find("#passSecButtonClose")[0]).on("mousedown", function (event) {
        // prevent input element losing focus
        event.stopImmediatePropagation();
        event.preventDefault();
    }).on("mouseup", function (event) {
        passSec.api.destroy(true);
    });

    switch (securityStatus){
        case "passSec-https"://"https":
            $(tooltip.find(".http-warning")).hide();
            $(tooltip.find("#passSecButtonException")[0]).html(chrome.i18n.getMessage("exceptionHTTPS"));
            $(tooltip.find("#passSecButtonException")[0]).on("mousedown", function (event) {
                // prevent input element losing focus
                event.stopImmediatePropagation();
                event.preventDefault();
            }).on("mouseup", function (event) {
                addException(true , securityStatus);
            });
            break;

        case "passSec-http":
            $(tooltip.find(".http-warning")).show();
            if (passSec.httpsAvailable) {
                $(tooltip.find("#passSecButtonException")[0]).addClass("greenButton");
                $(tooltip.find("#passSecButtonException")[0]).html(chrome.i18n.getMessage("secureMode"));
            } else {
                $(tooltip.find("#passSecButtonException")[0]).addClass("redButton");
                $(tooltip.find("#passSecButtonException")[0]).html(chrome.i18n.getMessage("exceptionHTTP"));
            }
            $(tooltip.find("#passSecButtonException")[0]).on("mousedown", function (event) {
                // prevent input element losing focus
                event.stopImmediatePropagation();
                event.preventDefault();
            }).on("mouseup", function (event) {
                if (passSec.httpsAvailable) {
                    chrome.storage.local.get("redirects", function (item) {
                        let redirectPattern = "http://*." + passSec.domain + "/*";
                        if (!item.redirects.includes(redirectPattern)) {
                            let updatedRedirects = item.redirects.slice(0);
                            updatedRedirects.push(redirectPattern);
                            chrome.storage.local.set({redirects: updatedRedirects}, function () {
                                let httpsUrl = passSec.url.replace("http://", "https://");
                                chrome.runtime.sendMessage({type: "doRedirect", httpsURL: httpsUrl});
                                passSec.api.destroy(true);
                            });
                        } else {
                            let httpsUrl = passSec.url.replace("http://", "https://");
                            chrome.runtime.sendMessage({type: "doRedirect", httpsURL: httpsUrl});
                            passSec.api.destroy(true);
                        }
                    });
                } else {
                    addException(true, securityStatus);
                }
            });
            getHttpFieldTexts("http");
            break;
    }
}

/**
 * Adds an exception to storage
 *
 * @param tooltip   Boolean indicating whether this function was triggered by a click inside of a tooltip (true)
 *                  or by a click in the browser action context menu (false)
 */
function addException(tooltip, securityStatus) {
	function add() {
        chrome.storage.local.get("exceptions", function (item) {
			let field = $(passSec.target)
			let classToRemove = field.attr("data-passSec-security");
			let oppositeClass = "";
			
			if(classToRemove == "passSec-http"){
				oppositeClass = "passSec-https";
			}else if(classToRemove == "passSec-https"){
				oppositeClass = "passSec-http";
			}
				
			
            if (!item.exceptions.includes(passSec.domain + classToRemove )) {
                let updatedExceptions = item.exceptions.slice(0);
				
				if (!item.exceptions.includes(passSec.domain + oppositeClass )) {
					updatedExceptions.push(passSec.domain + classToRemove);
				}else {
					name = passSec.domain + oppositeClass;
					nameToReplace = passSec.domain + "passSec-all";
					let index = updatedExceptions.indexOf(name);
					
					updatedExceptions.splice(index, 1, nameToReplace);
                  
                    chrome.storage.local.set({exceptions: updatedExceptions});
					
				
				}
			
                chrome.storage.local.set({exceptions: updatedExceptions}, function () {
                    updateElem = $('.' + classToRemove)
					updateElem.removeClass(classToRemove)
					if(classToRemove == "passSec-https"){
					updateElem.addClass("passSec-httpsEV");
					$('[data-passSec-security='+ classToRemove + ']').attr("data-passSec-security", "passSec-httpsEV");
					}else{
					$('[data-passSec-security='+ classToRemove + ']').attr("data-passSec-security", "passSec-none");
					}
                    
                    if (tooltip)
                        passSec.api.destroy(true);
                });
            }
        });
    }
	
    if (!tooltip || securityStatus === "passSec-http"){
        let message = securityStatus === "passSec-http" ? "confirmAddingHttpException" : "confirmAddingHttpsException";
        $.confirm({
            title: "PassSec+",
            titleClass: "passSecConfirmTitle",
            buttons: {
                ok: function () {
                    add();
                },
                cancel: {
                    text: chrome.i18n.getMessage("cancelButton")
                }
            },
            onOpenBefore: function () {
                this.setContent($(chrome.i18n.getMessage(message, passSec.domain)));
            },
            backgroundDismissAnimation: "none",
            animateFromElement: false,
            animation: "opacity",
            closeAnimation: "opacity",
            useBootstrap: false,
            boxWidth: "40%"
        });
    } else {
        add();
    }
}

/**
 * Fills the tooltip with texts corresponding to a certain input field type
 * The field type is one of "password", "payment", "personal", "search" or "default"
 */
function getHttpFieldTexts() {
    let fieldType = $(passSec.target).attr("data-passSec-input-type");
    let tooltip = passSec.tooltip;
	
	if (passSec.url.startsWith("https")) {
		$(tooltip.find("#passSecWarning")[0]).html(chrome.i18n.getMessage(fieldType + "Warning"));
		$(tooltip.find("#passSecConsequenceText")[0]).html(chrome.i18n.getMessage(fieldType + "ConsequenceHttp"));
		$(tooltip.find("#passSecRecommendationText")[0]).html(chrome.i18n.getMessage(fieldType + "RecommendationHttpMixed"));
        $(tooltip.find("#passSecInfoText")[0]).click(function (e) {
            if ($(this).html() === chrome.i18n.getMessage("moreInfo")) {
                $(this).html(chrome.i18n.getMessage(fieldType + "InfoHttpMixed"));
            } else {
                $(this).html(chrome.i18n.getMessage("moreInfo"));
            }
        });
	
	}else{
    $(tooltip.find("#passSecWarning")[0]).html(chrome.i18n.getMessage(fieldType + "Warning"));
    $(tooltip.find("#passSecConsequenceText")[0]).html(chrome.i18n.getMessage(fieldType + "ConsequenceHttp"));
    if (passSec.httpsAvailable) {
        $(tooltip.find("#passSecRecommendationText")[0]).click(function (e) {
            if ($(this).html() === chrome.i18n.getMessage("moreRecommendationHttpsAvailable")) {
                $(this).html(chrome.i18n.getMessage("recommendationHttpsAvailable"));
            } else {
                $(this).html(chrome.i18n.getMessage("moreRecommendationHttpsAvailable"));
            }
        }).addClass("passSecClickable").html(chrome.i18n.getMessage("recommendationHttpsAvailable"));
        $(tooltip.find("#passSecInfoText")[0]).click(function (e) {
            if ($(this).html() === chrome.i18n.getMessage("moreInfo")) {
                $(this).html(chrome.i18n.getMessage(fieldType + "InfoHttpsAvailable"));
            } else {
                $(this).html(chrome.i18n.getMessage("moreInfo"));
            }
        });
    }else {
        $(tooltip.find("#passSecRecommendationText")[0]).html(chrome.i18n.getMessage(fieldType + "RecommendationHttp"));
        $(tooltip.find("#passSecInfoText")[0]).click(function (e) {
            if ($(this).html() === chrome.i18n.getMessage("moreInfo")) {
                $(this).html(chrome.i18n.getMessage(fieldType + "InfoHttp"));
            } else {
                $(this).html(chrome.i18n.getMessage("moreInfo"));
            }
         });
		}
	}
}
