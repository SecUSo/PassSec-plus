/**
 * processes every input field on a page
 */
function processInputs(storage) {
    let borderType = "passSec-" + passSec.security;
    // TODO: remove previous styles to prevent input background from being red
    // if user added an exception
    $('input[type=password]').addClass(borderType);
    $('input[type=search]').addClass(borderType);

    let dynamicStyle = document.getElementById("addedPassSecCSS");
    //If the css is not in the document, add the css to the current document
    if (!dynamicStyle) {
        let secureImageStyle = '' +
            '.passSec-https {' +
            '    background-image: url("' + browser.extension.getURL("skin/check/orange/o_icon" + storage.secureImage + ".png") + '") !important;' +
            '    background-repeat: no-repeat !important;' +
            '    background-size: contain !important;' +
            '    background-position: right center !important;' +
            '    border: 2px solid #fdb000 !important;' +
            '}\n';

        let secureEVImageStyle = '' +
            '.passSec-httpsEV {' +
            '    background-image: url("' + browser.extension.getURL("skin/check/gruen/gr_icon" + storage.secureImage + ".png") + '") !important;' +
            '    background-repeat: no-repeat !important;' +
            '    background-size: contain !important;' +
            '    background-position: right center !important;' +
            '    border: 2px solid #4dbc4f !important;' +
            '}\n';

        let warningImageStyle = '' +
            '.passSec-http {' +
            '    background-image: url("' + browser.extension.getURL("skin/yellow_triangle.png") + '") !important;' +
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
