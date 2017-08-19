/**
* processes every input field on a page
*/
function processInputs(){
  console.log("processinputs");
  chrome.runtime.sendMessage({name:"getStorage"}, function(r){
    var borderType = "passSec-" + passSec.security;

    $('input[type=password]').addClass(borderType);
    $('input[type=search]').addClass(borderType);

    console.log("got storage");
    var dynamicStyle = document.getElementById("addedPassSecCSS");
    //If the css is not in the document, add the css to the current document
    if (!dynamicStyle) {
      console.log("adding dynamic style " +passSec.security);
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
      '    background-image: url("'+chrome.extension.getURL("skin/red_triangle.png")+'") !important;' +
      '    background-repeat: no-repeat !important;' +
      '    background-size: contain !important;' +
      '    background-position: right center !important;' +
      '    border: 2px solid red !important;' +
      '}\n';

      var css = secureImageStyle + warningImageStyle + secureEVImageStyle;
      $('head').append('<style id="addedPassSecCSS" type="text/css">'+ css +'</style>');
    }
  });
}
