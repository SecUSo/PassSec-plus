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
        dynamicStyle.innerHTML = okImageStyle + warningImageStyle + EVImageStyle;
        head.appendChild(dynamicStyle);
    }
};
