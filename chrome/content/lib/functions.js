/*=========================================================================
 * PassSec+ is a Firefox extension which should prevent the user from
 * entering sensitive data on insecure websites. Additionally it should
 * help the user to choose privacy friendly cookie settings.
 * Copyright (C) 2015 SECUSO
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
 * prints a debug string to the console
 * @param text the string which should printed to the console
 */
ffpwwe.debug = function (text, verbose) {
    if (!!verbose && !ffpwwe.prefs.getBoolPref("debug.verbose")) {
        return;
    }

    if (ffpwwe.prefs.getBoolPref("debug")) {
        console.log(ffpwwe.prefs.getBoolPref("debug.verbose"));
        dump("FirefoxPasswordWarningExtension: " + text + "\n");
    }
};

ffpwwe.convertObjToArray = function (obj) {
    return [].map.call(obj, function (element) {
        return element;
    });
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

ffpwwe.calcWindowPosition = function (windowWidth,windowHeight) {
  var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
  var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

  width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
  height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

  if (width < screen.width && height < screen.height) {
    width = screen.width;
    height = screen.height;
  }

  var left = ((width / 2) - (windowWidth / 2)) + dualScreenLeft;
  var top = ((height / 2) - (windowHeight / 2)) + dualScreenTop;

  return {
    top: top,
    left: left
  };
};
