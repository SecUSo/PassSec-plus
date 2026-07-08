/**
 *
 * @type {{SELECTOR: string, _determineFieldType(*, *): string, processInputs(*, *): Promise<void>}}
 */
const InputField = {
    SELECTOR: 'input:not([type=submit],[type=reset],[type=button],[type=image],[type=radio],[type=checkbox]):read-write,textarea:read-write',

    /**
     *
     * @param element
     * @param storage
     * @private
     */
    _determineFieldType(element, storage) {
        let fieldType;
        const determineMap = {};

        if (storage.passwordField) {
            determineMap.password = (attrName) => {
                if (attrName === "value") return false;
                const attr = element.getAttribute(attrName);
                if (!attr) return false;

                return attr.toLowerCase().match(/pass(word|text|phrase|field)?|pw\w*/);
            };
        }

        if (storage.paymentField) {
            determineMap.payment = (attrName) => {
                if (attrName === "value") return false;
                const attr = element.getAttribute(attrName);
                if (!attr) return false;

                const code = /(gift|promo)(card|code)|voucher|coupon/;
                const bank = /iban|(konto|account)(nr|nummer|number|bank)|blz|bankleitzahl|sortcode/;
                // Following regular expressions are mainly from https://code.google.com/p/chromium/codesearch#chromium/src/out/Debug/gen/autofill_regex_constants.cc
                // License: https://cs.chromium.org/chromium/src/LICENSE
                let cc = /pay|ccard|(card|cc).?holder|name.*\\bon\\b.*card|(card|cc).?name|cc.?full.?name|owner|karteninhaber|(card|cc|acct|kk).?(number|#|n[or]|num|nummer)|verification|card identification|security code|card code|cvn|cvv|cvc|csc|(card|cc|payment).?type|payment.?method|expir|exp.*mo|exp.*date|ccmonth|cardmonth|gueltig|g\xc3\xbcltig|monat|exp|^\/|year|ablaufdatum|gueltig|g\xc3\xbcltig|jahr|exp.*date.*[^y]yy([^y]|$)|expir|exp.*date/;

                const attrLow = attr.toLowerCase();
                return attrLow.match(cc) || attrLow.match(code) || attrLow.match(bank);
            };
        }

        if (storage.personalField) {
            determineMap.personal = (attrName) => {
                if (attrName === "value") return false;
                const attr = element.getAttribute(attrName);
                if (!attr) return false;

                let book = /(buchungs|booking)(code|nummer|number)/;
                // Following Regular Expressions are mainly from https://code.google.com/p/chromium/codesearch#chromium/src/out/Debug/gen/autofill_regex_constants.cc
                // License: https://cs.chromium.org/chromium/src/LICENSE
                let addr = /province|region|company|business|organization|organisation|firma|firmenname|address.*line|address1|addr1|street|strasse|stra\xc3\x9f|hausnummer|housenumber|house.?name|address|address.*line2|address2|addr2|street|suite|unit|adresszusatz|erg\xc3\xa4nzende.?angaben|address|line|address.*line[3-9]|address[3-9]|addr[3-9]|street|line[3-9]|lookup|country|countries|location|zip|postal|post.*code|pcode|postleitzahl|plz|zip|^-$|post2|city|town|ort|stadt|state|county|region|province|land/;
                let email = /e.?mail/;
                let name = /user.?name|user.?id|nickname|maiden name|title|titel|anrede|prefix|suffix|vollst\xc3\xa4ndiger.?name|^name|full.?name|your.?name|customer.?name|firstandlastname|bill.?name|ship.?name|first.*name|initials|fname|first$|vorname|middle.*initial|m\\.i\\.|mi$|\\bmi\\b|middle.*name|mname|middle$|last.*name|lname|surname|last$|secondname|nachname/;
                let tel = /phone|mobile|telefonnummer|telefon|telefax|handy|fax|country.*code|ccode|_cc|area.*code|acode|area|vorwahl|prefix|exchange|suffix/;

                const attrLow = attr.toLowerCase();
                return attrLow.match(book) || attrLow.match(addr) || attrLow.match(email) || attrLow.match(name) || attrLow.match(tel);
            };
        }

        if (storage.searchField) {
            determineMap.search = (attrName) => {
                if (attrName === "value") return false;
                const attr = element.getAttribute(attrName);
                if (!attr) return false;

                return attr.toLowerCase().match(/q(?!\S)|query|search|such|find/);
            }
        }

        const typeArray = [];
        for (const type in determineMap) {
            if (["id", "name", "value", "placeholder", "title"].some((attrName) => determineMap[type](attrName))) {
                typeArray.push(type);
            }
        }

        if (typeArray.length === 1) {
            fieldType = typeArray[0];
        } else if (typeArray.length > 1) {
            fieldType = "default";
        }

        switch (element.getAttribute("type")) {
            case "password":
                if (storage.passwordField) fieldType = "password";
                break;
            case "email":
                if (storage.personalField) fieldType = "personal";
                break;
            case "search":
                if (storage.searchField) fieldType = "search";
                break;
            default:
                break;
        }

        return fieldType;
    },

    /**
     *
     * @param storage
     * @private
     */
    _ensureDynamicStylesInjected(storage) {
        console.log("Enabled dynamic styles");
        if (document.getElementById("addedPassSecCSS")) return;

        const rule = (className, imageUrl, borderColor) => `
        .${className}, [data-passsec-security-class="${className}"] {
        background-image: url("${imageUrl}") !important;
        background-repeat: no-repeat !important;
        background-size: contain !important;
        background-position: right center !important;
        border: 2px solid ${borderColor} !important;
        }`;

        const redRule = (className, imageUrl, borderColor) => `
        .${className}, [data-passsec-security-class="${className}"] {
        background-image: url("${imageUrl}") !important;
        background-repeat: no-repeat !important;
        background-size: contain !important;
        background-position: right center !important;
        background-color: ${borderColor} !important;
        border: 2px solid ${borderColor} !important;
        }`;

        const css = [
            rule("passSec-green", browser.runtime.getURL(`skin/check/gruen/gr_icon${storage.secureImage}.png`), "#4dbc4f"),
            rule("passSec-blue", browser.runtime.getURL(`skin/check/blue/blue_icon${storage.secureImage}.png`), "#1a509d"),
            rule("passSec-grey", browser.runtime.getURL(`skin/check/grey/gr_icon${storage.secureImage}.png`), "#bfb9b9"),
            redRule("passSec-red", browser.runtime.getURL("skin/yellow_triangle.png"), "red"),
            redRule("passSec-redException", browser.runtime.getURL("skin/yellow_triangle.png"), "red")
        ].join("\n");

        const style = document.createElement("style");
        style.id = "addedPassSecCSS";
        style.textContent = css;
        document.head.appendChild(style);
    },

    /**
     *
     * @param storage
     * @param elements
     * @returns {Promise<void>}
     */
    async processInputs(storage, elements) {
        const targets = elements ?? Array.from(document.querySelectorAll(this.SELECTOR));

        console.log("amount:", targets.length);
        console.log("targets:", targets);

        for (const element of targets) {
            if (!element.matches(this.SELECTOR)) continue;

            const fieldType = this._determineFieldType(element, storage);
            console.log(`fieldType is ${fieldType} for ${element}`);
            if (fieldType === undefined) continue;

            const securityState = await SecurityStatus.getSecurityStatus(storage, element.form);
            const securityStateClass = SecurityStatus.getSecurityStateClass(securityState);
            if (securityStateClass !== "passSec-none") {
                element.classList.add(securityStateClass);
            }

            // Added as attributes too, so we have a backup selector for websites
            // that reset the 'class' attribute for styling instead of only adding/removing classes.
            element.setAttribute("data-passsec-security-class", securityStateClass);
            element.setAttribute("data-passsec-input-type", fieldType);
        }

        this._ensureDynamicStylesInjected(storage);
    }
}
