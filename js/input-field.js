/**
 * Examines every input field on a page and applies the necessary
 * classes and attributes to the relevant input fields
 *
 * @param storage Object containing the set options at the time of calling this function
 */
function processInputs(storage) {
    let borderType = "passSec-" + passSec.security;
    // exclude input elements from analysis that cannot be used to input meaningful data (type submit|reset|button|image)
    // and that cannot be styled appropriately (type radio|checkbox)
    $('input:not([type=submit],[type=reset],[type=button],[type=image],[type=radio],[type=checkbox])').each(function (index) {
        let fieldType = determineFieldType(this, storage);
        if (typeof fieldType !== "undefined") {
            $(this).addClass(borderType);
            // add border type as attribute, so we have a backup selector for websites that
            // reset the 'class' attribute for styling, instead of only adding/removing classes
            $(this).attr("data-passSec-security", borderType);
            // add field type as attribute, so we don't have to do the check a second time when opening the tooltip
            switch (fieldType) {
                case "password":
                    $(this).attr("data-passSec-input-type", "password");
                    break;
                case "payment":
                    $(this).attr("data-passSec-input-type", "payment");
                    break;
                case "personal":
                    $(this).attr("data-passSec-input-type", "personal");
                    break;
                case "search":
                    $(this).attr("data-passSec-input-type", "search");
                    break;
                case "default":
                    // this type occurs if more then one of the other types were matched
                    $(this).attr("data-passSec-input-type", "default");
                    break;
            }
        }
    });

    let dynamicStyle = document.getElementById("addedPassSecCSS");
    //If the css is not in the document, add the css to the current document
    if (!dynamicStyle) {
        let secureImageStyle = '' +
            '.passSec-https, [data-passSec-security=passSec-https] {' +
            '    background-image: url("' + chrome.extension.getURL("skin/check/orange/o_icon" + storage.secureImage + ".png") + '") !important;' +
            '    background-repeat: no-repeat !important;' +
            '    background-size: contain !important;' +
            '    background-position: right center !important;' +
            '    border: 2px solid #fdb000 !important;' +
            '}\n';

        let secureEVImageStyle = '' +
            '.passSec-httpsEV, [data-passSec-security=passSec-httpsEV] {' +
            '    background-image: url("' + chrome.extension.getURL("skin/check/gruen/gr_icon" + storage.secureImage + ".png") + '") !important;' +
            '    background-repeat: no-repeat !important;' +
            '    background-size: contain !important;' +
            '    background-position: right center !important;' +
            '    border: 2px solid #4dbc4f !important;' +
            '}\n';

        let warningImageStyle = '' +
            '.passSec-http, [data-passSec-security=passSec-http] {' +
            '    background-image: url("' + chrome.extension.getURL("skin/yellow_triangle.png") + '") !important;' +
            '    background-repeat: no-repeat !important;' +
            '    background-size: contain !important;' +
            '    background-position: right center !important;' +
            '    background-color: red !important;' +
            '    border: 2px solid red !important;' +
            '}\n';

        let css = secureImageStyle + warningImageStyle + secureEVImageStyle;
        $('head').append('<style id="addedPassSecCSS" type="text/css">' + css + '</style>');
    }
}

/**
 * Determines the type of the field by doing heuristic checks.
 * Returns the type of the field or undefined if the field should not be handled.
 *
 * @param element The input field element to be analyzed
 * @param storage Object containing the set options at the time of calling this function
 * @returns The field type as a string, undefined otherwise
 */
function determineFieldType(element, storage) {
    let fieldType = undefined;
    let determineMap = {};

    // only process input fields set in options
    let detectPwFields = storage.passwordField;
    let detectPayFields = storage.paymentField;
    let detectPersonalFields = storage.personalField;
    let detectSearchFields = storage.searchField;

    if (detectPwFields) {
        determineMap["password"] = function (attrName) {
            if (attrName !== "value") {
                let attr = element.getAttribute(attrName);
                if (!attr) return false;
                return attr.toLowerCase().match(/pass(word|text|phrase|field)?|pw\w*/);
            }
        };
    }

    if (detectPayFields) {
        determineMap["payment"] = function (attrName) {
            if (attrName !== "value") {
                let attr = element.getAttribute(attrName);
                if (!attr) return false;

                let code = /(gift|promo)(card|code)|voucher|coupon/;
                let bank = /iban|(konto|account)(nr|nummer|number|bank)|blz|bankleitzahl|sortcode/;
                // Following Regular Expression are mainly from https://code.google.com/p/chromium/codesearch#chromium/src/out/Debug/gen/autofill_regex_constants.cc
                // License: https://cs.chromium.org/chromium/src/LICENSE
                let cc = /pay|ccard|(card|cc).?holder|name.*\\bon\\b.*card|(card|cc).?name|cc.?full.?name|owner|karteninhaber|(card|cc|acct|kk).?(number|#|n[or]|num|nummer)|verification|card identification|security code|card code|cvn|cvv|cvc|csc|(card|cc|payment).?type|payment.?method|expir|exp.*mo|exp.*date|ccmonth|cardmonth|gueltig|g\xc3\xbcltig|monat|exp|^\/|year|ablaufdatum|gueltig|g\xc3\xbcltig|jahr|exp.*date.*[^y]yy([^y]|$)|expir|exp.*date/;
                return attr.toLowerCase().match(cc) || attr.toLowerCase().match(code) || attr.toLowerCase().match(bank);
            }
        };
    }

    if (detectPersonalFields) {
        determineMap["personal"] = function (attrName) {
            if (attrName !== "value") {
                let attr = element.getAttribute(attrName);
                if (!attr) return false;

                let book = /(buchungs|booking)(code|nummer|number)/;
                // Following Regular Expressions are mainly from https://code.google.com/p/chromium/codesearch#chromium/src/out/Debug/gen/autofill_regex_constants.cc
                // License: https://cs.chromium.org/chromium/src/LICENSE
                let addr = /province|region|company|business|organization|organisation|firma|firmenname|address.*line|address1|addr1|street|strasse|stra\xc3\x9f|hausnummer|housenumber|house.?name|address|address.*line2|address2|addr2|street|suite|unit|adresszusatz|erg\xc3\xa4nzende.?angaben|address|line|address.*line[3-9]|address[3-9]|addr[3-9]|street|line[3-9]|lookup|country|countries|location|zip|postal|post.*code|pcode|postleitzahl|plz|zip|^-$|post2|city|town|ort|stadt|state|county|region|province|land/;
                let email = /e.?mail/;
                let name = /user.?name|user.?id|nickname|maiden name|title|titel|anrede|prefix|suffix|vollst\xc3\xa4ndiger.?name|^name|full.?name|your.?name|customer.?name|firstandlastname|bill.?name|ship.?name|first.*name|initials|fname|first$|vorname|middle.*initial|m\\.i\\.|mi$|\\bmi\\b|middle.*name|mname|middle$|last.*name|lname|surname|last$|secondname|nachname/;
                let tel = /phone|mobile|telefonnummer|telefon|telefax|handy|fax|country.*code|ccode|_cc|area.*code|acode|area|vorwahl|prefix|exchange|suffix/;

                let attrLow = attr.toLowerCase();
                return attrLow.match(book) || attrLow.match(addr) || attrLow.match(email) || attrLow.match(name) || attrLow.match(tel);
            }
        };
    }

    if (detectSearchFields) {
        determineMap["search"] = function (attrName) {
            if (attrName !== "value") {
                let attr = element.getAttribute(attrName);
                if (!attr) return false;
                return attr.toLowerCase().match(/q(?!\S)|query|search|such|find/);
            }
        };
    }

    // Determine the field type by doing heuristic checks on different attributes
    let typeArray = [];
    for (let type in determineMap) {
        if (!!(determineMap[type]("id") || determineMap[type]("name") || determineMap[type]("value") || determineMap[type]("placeholder") || determineMap[type]("title"))) {
            typeArray.push(type);
        }
    }

    // If exactly one check matched, we can guess the fieldType
    if (typeArray.length === 1) {
        fieldType = typeArray[0];
        // If more than one heuristic check matched, we cant determine which fieldType it is exactly, so show generic warning
    } else if (typeArray.length > 1) {
        fieldType = "default";
    }

    // Add the appropriate field type if it is set by the type attribute
    let attr = element.getAttribute("type");
    if (attr) {
        switch (attr) {
            case "password":
                if (detectPwFields) {
                    fieldType = "password";
                }
                break;
            case "email":
                if (detectPersonalFields) {
                    fieldType = "personal";
                }
                break;
            case "search":
                if (detectSearchFields) {
                    fieldType = "search";
                }
                break;
            default:
                break;
        }
    }
    return fieldType;
}
