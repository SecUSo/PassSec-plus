/**
* processes every input field on a page
*/
function processInputs(r){
  var borderType = "passSec-" + passSec.security;
  // TODO: remove previous styles to prevent input background from being red
  // if user added an exception
  $('input[type=password]').addClass(borderType);
  $('input[type=search]').addClass(borderType);

  var dynamicStyle = document.getElementById("addedPassSecCSS");
  //If the css is not in the document, add the css to the current document
  if (!dynamicStyle) {
    var secureImageStyle = '' +
    '.passSec-https {' +
    '    background-image: url("' + chrome.extension.getURL("skin/check/orange/o_icon"+r.secureImage+".png") + '") !important;' +
    '    background-repeat: no-repeat !important;' +
    '    background-size: contain !important;' +
    '    background-position: right center !important;' +
    '    border: 2px solid #fdb000 !important;' +
    '}\n';

    var secureEVImageStyle = '' +
    '.passSec-httpsEV {' +
    '    background-image: url("' + chrome.extension.getURL("skin/check/gruen/gr_icon"+r.secureImage+".png") + '") !important;' +
    '    background-repeat: no-repeat !important;' +
    '    background-size: contain !important;' +
    '    background-position: right center !important;' +
    '    border: 2px solid #4dbc4f !important;' +
    '}\n';

    var warningImageStyle = '' +
    '.passSec-http {' +
    '    background-image: url("'+chrome.extension.getURL("skin/yellow_triangle.png")+'") !important;' +
    '    background-repeat: no-repeat !important;' +
    '    background-size: contain !important;' +
    '    background-position: right center !important;' +
    '    background-color: red !important;' +
    '    border: 2px solid red !important;' +
    '}\n';

    var css = secureImageStyle + warningImageStyle + secureEVImageStyle;
    $('head').append('<style id="addedPassSecCSS" type="text/css">'+ css +'</style>');
  }
}
