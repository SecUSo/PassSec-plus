/*=========================================================================
 * PassSec+ is a Firefox extension which should prevent the user from
 * entering sensitive data on insecure websites. Additionally it should
 * help the user to choose privacy friendly cookie settings.
 * Copyright (C) 2016 SECUSO
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

var ffpwwe = ffpwwe || {};



/**
 * Adds the stylesheet to the document, if not present
 *
 * @param document the document to add the stylesheet
 * @param head the head of the document
 */
ffpwwe.addStylesheet = function (document, head) {

    if (!head) {
        ffpwwe.debug("no head available to add the stylesheet");
        return;
    }


    // add the static css
    var style = document.getElementById("firefox-password-warning-style");
    //If the css is not in the document, add the css to the current document
    if (!style) {
        style = document.createElement("link");
        style.id = "firefox-password-warning-style";
        style.type = "text/css";
        style.rel = "stylesheet";
        style.href = "chrome://firefoxpasswordwarningextension/skin/skin.css";
        head.appendChild(style);
    }


    var okImage = ffpwwe.prefs.getStringPref("styleokimage");
    var EVImage = ffpwwe.prefs.getStringPref("styleEVimage");

    // add the dynamic css
    var okImageStyle = '' +
        '.firefox-password-ok-check {' +
        '    background-image: url("' + okImage + '") !important;' +
        '    background-repeat: no-repeat !important;' +
        '    background-size: contain !important;' +
        '    background-position: right center !important;' +
        '}\n';

    var EVImageStyle = '' +
        '.firefox-password-EV-check {' +
        '    background-image: url("' + EVImage + '") !important;' +
        '    background-repeat: no-repeat !important;' +
        '    background-size: contain !important;' +
        '    background-position: right center !important;' +
        '}\n';

    var warningImageStyle = '' +
        '.firefox-password-warning-triangle {' +
        '    background-image: url("chrome://firefoxpasswordwarningextension/skin/yellow_triangle.png") !important;' +
        '    background-repeat: no-repeat !important;' +
        '    background-size: contain !important;' +
        '    background-position: right center !important;' +
        '}\n';

	var dynamicStyle = document.getElementById("firefox-password-warning-style-dynamic");
	//If the css is not in the document, add the css to the current document
	if (!dynamicStyle) {
		dynamicStyle = document.createElement("style");
		dynamicStyle.id = "firefox-password-warning-style-dynamic";
		dynamicStyle.type = "text/css";
		$(dynamicStyle).text(okImageStyle + warningImageStyle + EVImageStyle);
		head.appendChild(dynamicStyle);
	}
};
