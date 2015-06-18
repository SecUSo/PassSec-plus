var ffpwwe = ffpwwe || {};


/**
 * prints a debug string to the console
 * @param text the string which should printed to the console
 */
ffpwwe.debug = function (text, verbose) {
    if (!!verbose && !ffpwwe.prefs.getBoolPref("debug.verbose")) {
        return;
    }

    if (ffpwwe.prefs.getBoolPref("debug")) {
        Application.console.log(ffpwwe.prefs.getBoolPref("debug.verbose"));
        dump("FirefoxPasswordWarningExtension: " + text + "\n");
    }
};

ffpwwe.convertObjToArray = function (obj) {
    return [].map.call(obj, function (element) {
        return element;
    })
};

ffpwwe.pruneURL = function (url) {
  var eTLDService = Components.classes["@mozilla.org/network/effective-tld-service;1"].getService(Components.interfaces.nsIEffectiveTLDService);
  var tempURI = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI(""+url, null, null);

  try {
    return eTLDService.getBaseDomain(tempURI);
  }
  catch(err) {
    return null;
  }
};

ffpwwe.pruneFirstPartURL = function (url) {
    var domainReg = url.match(/https?:\/\/(\w|-|\.)*\.\w*$/);
    return domainReg ? domainReg[0] : null;
};
