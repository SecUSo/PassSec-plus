/*=========================================================================
 * PassSec+ is a Firefox extension which should prevent the user from
 * entering sensitive data on insecure websites. Additionally it should
 * help the user to choose privacy friendly cookie settings.
 * Copyright (C) 2015 SecUSo
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *=========================================================================*/

// Line 79 - 109
// Copyright 2014 The Chromium Authors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//    * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//    * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var ffpwwe = ffpwwe || {};

/**
 * Handles a frame of the page
 *
 * @param page the surrounding page
 * @param document the frame element
 * @returns {{document: *}}
 */
ffpwwe.frameHandler = function (page, document) {

    ffpwwe.debug("Parse frame " + document.location.href, true);

    /*
     private functions
     */
    /**
     * adds the stylesheet to the document
     */
    function addStylesheet() {
        ffpwwe.addStylesheet(document, document.head || document.getElementsByTagName("head")[0]);
    }


    /**
     * Determines the type of the field by doing heuristic checks.
     * Returns the type of the field or undefined if the field should not be handled.
     *
     * @param element the input field element to be analyzed
     * @returns the field type as a string, undefined otherwise
     */
    function determineFieldType(element) {

        var fieldType = undefined;
        var determMap = {};

        var detectPwFields = ffpwwe.prefs.getBoolPref("passwordfields");
        var detectPayFields = ffpwwe.prefs.getBoolPref("paymentfields");
        var detectPersonalFields = ffpwwe.prefs.getBoolPref("personalfields");
        var detectSearchFields = ffpwwe.prefs.getBoolPref("searchfields");

        if (detectPwFields) {
            determMap["password"] = function (attrName) {
                let attr = element.getAttribute(attrName);
                if (!attr) return false;
                return attr.toLowerCase().match(/pass(word|text|phrase|field)?|pw\w*/);
            };
        }

        if (detectPayFields) {
            determMap["payment"] = function (attrName) {
                let attr = element.getAttribute(attrName);
                if (!attr) return false;

                let code = /(gift|promo)(card|code)|voucher|coupon/;
                let bank = /iban|(konto|account)(nr|nummer|number|bank)|blz|bankleitzahl|sortcode/;
                // Following Regular Expression are mainly from https://code.google.com/p/chromium/codesearch#chromium/src/out/Debug/gen/autofill_regex_constants.cc
                // License: https://code.google.com/p/chromium/codesearch#chromium/src/LICENSE
                let cc = /pay|ccard|(card|cc).?holder|name.*\\bon\\b.*card|(card|cc).?name|cc.?full.?name|owner|karteninhaber|(card|cc|acct).?(number|#|no|num|nummer)|verification|card identification|security code|card code|cvn|cvv|cvc|csc|(card|cc|payment).?type|payment.?method|expir|exp.*mo|exp.*date|ccmonth|cardmonth|gueltig|g\xc3\xbcltig|monat|exp|^\/|year|ablaufdatum|gueltig|g\xc3\xbcltig|jahr|exp.*date.*[^y]yy([^y]|$)|expir|exp.*date/;
                return attr.toLowerCase().match(cc) || attr.toLowerCase().match(code) || attr.toLowerCase().match(bank);
            };
        }

        if (detectPersonalFields) {
            determMap["personal"] = function (attrName) {
                let attr = element.getAttribute(attrName);
                if (!attr) return false;

                let book = /(buchungs|booking)(code|nummer|number)/;
                // Following Regular Expressions are mainly from https://code.google.com/p/chromium/codesearch#chromium/src/out/Debug/gen/autofill_regex_constants.cc
                // License: https://code.google.com/p/chromium/codesearch#chromium/src/LICENSE
                let addr = /province|region|company|business|organization|organisation|firma|firmenname|address.*line|address1|addr1|street|strasse|stra\xc3\x9f|hausnummer|housenumber|house.?name|address|address.*line2|address2|addr2|street|suite|unit|adresszusatz|erg\xc3\xa4nzende.?angaben|address|line|address.*line[3-9]|address[3-9]|addr[3-9]|street|line[3-9]|lookup|country|countries|location|zip|postal|post.*code|pcode|postleitzahl|plz|zip|^-$|post2|city|town|ort|stadt|state|county|region|province|land/;
                let email = /e.?mail/;
                let name = /user.?name|user.?id|nickname|maiden name|title|titel|anrede|prefix|suffix|vollst\xc3\xa4ndiger.?name|^name|full.?name|your.?name|customer.?name|firstandlastname|bill.?name|ship.?name|first.*name|initials|fname|first$|vorname|middle.*initial|m\\.i\\.|mi$|\\bmi\\b|middle.*name|mname|middle$|last.*name|lname|surname|last$|secondname|nachname/;
                let tel = /phone|mobile|telefonnummer|telefon|telefax|handy|fax|country.*code|ccode|_cc|area.*code|acode|area|vorwahl|prefix|exchange|suffix/;

                let attrLow = attr.toLowerCase();
                return attrLow.match(book) || attrLow.match(addr) || attrLow.match(email) || attrLow.match(name) || attrLow.match(tel);
            };
        }

        if (detectSearchFields) {
            determMap["search"] = function (attrName) {
                let attr = element.getAttribute(attrName);
                if (!attr) return false;
                return attr.toLowerCase().match(/q(?!\S)|query|search|such|find/);
            };
        }

        // Determine the field type by doing heuristic checks on different attributes
        var typeArray = [];
        for (var type in determMap) {
            if (!!(determMap[type]("id") || determMap[type]("name") || determMap[type]("value") || determMap[type]("placeholder") || determMap[type]("title"))) {
                typeArray.push(type);
            }
        }

        // If exactly one check matched, we can guess the fieldType
        if (typeArray.length == 1) {
            fieldType = typeArray[0];
        // If more than one heuristic check matched, we cant determine which fieldType it is exactly, so show generic warning
        } else if (typeArray.length > 1) {
            fieldType = "default";
        }

        // Add the appropriate field type if it is set by the type attribute
        var attr = element.getAttribute("type").toLowerCase();
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

    /**
     * Returns if the type (of an input field) matches a type which should be handled
     *
     * @param type the value of the type attribute
     * @returns {boolean}
     */
    function matchesInputType(type) {
        return (type == "password" || type == "text" || type == "email" || type == "search" || type == "tel");
    }

    /**
     * Parses a form for input fields which should be handled and injects information into them
     *
     * @param form the form to be parsed
     */
    function parseForm(form) {
        let formInputs = ffpwwe.convertObjToArray(form.getElementsByTagName("input"));
        let numOfPwFields = 0;
        let numOfOtherFields = 0;
        var referredURL = "";
        var linkedSSL = true;

        //Search all input fields and the button in the form
        for (let j = 0; j < formInputs.length; j++) {
            if (formInputs[j].type === null)
                continue;

            //If the field should be handled and the referring site is encrypted, set linkedSSL
            let inputType = formInputs[j].type.toLowerCase();
            if (matchesInputType(inputType)) {
                if (form.hasAttribute("action")) {
                    referredURL = form.getAttribute("action") + "";
                    ffpwwe.debug("ref: " + referredURL, true);
                } else {
                    referredURL = document.location.href;
                }
                linkedSSL = referredURL.substr(0, 5) == "https" || (!(referredURL.substr(0, 4) == "http") && page.usingSSL);
            }
        }

        // count the field types
        for (let j = 0; j < formInputs.length; j++) {
            switch (formInputs[j].type.toLowerCase()) {
                case "password":
                    numOfPwFields++;
                    break;
                case "text":
                case "email":
                    numOfOtherFields++;
                    break;
            }
        }

        // inject the information into the fields of the form
        formInputs.forEach(function (formInput) {
            var inputField = $(formInput);
            if (inputField.attr("type") !== undefined && matchesInputType(inputField.attr("type").toLowerCase())) {
                inputField.attr("data-numPW", numOfPwFields);
                inputField.attr("data-numOther", numOfOtherFields);
                inputField.attr("linked-ssl", linkedSSL);
            }
        });

    }

    /*
     constructor
     */
    addStylesheet();

    var frame = {
        document: document
    };

    var allForms = ffpwwe.convertObjToArray(document.getElementsByTagName("form"));
    ffpwwe.debug("Found " + allForms.length + " forms", true);

    // parse all forms
    allForms.forEach(function (form) {
        parseForm(form);
    });

    // add a field handler to all inputs we want to handle
    var documentInputs = ffpwwe.convertObjToArray(document.getElementsByTagName("input"));

    documentInputs.forEach(function (inputElem) {
        var type = $(inputElem).attr("type");

        if (type !== undefined && matchesInputType(type.toLowerCase())) {
            let fieldType = determineFieldType(inputElem);
            if (fieldType !== undefined) {

                let $inputElem = $(inputElem);
                let numOfPWFields = $inputElem.attr("data-numPW") || 1;
                let numOfOtherFields = $inputElem.attr("data-numOther") || 0;
                let linkedSSL = !($inputElem.attr("linked-ssl")==="false");

                let form = {
                    numOfPwFields: numOfPWFields,
                    numOfOtherFields: numOfOtherFields,
                    linkedSSL: linkedSSL
                };

                ffpwwe.fieldHandler(page, frame, form, inputElem, fieldType);
            }
        }
    });


    return frame;
};
