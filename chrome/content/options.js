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
var secusoWhitelist = ["www.google.de","de-de.facebook.com","www.youtube.com", "www.google.com", "de.wikipedia.org", "wikipedia.de", "de.yahoo.com", "login.yahoo.com", "www.tumblr.com"];

ffpwwe.options = ffpwwe.options || {};

ffpwwe.options.restoreInitialState = function () {
  const windowWidth = 400;
  const windowHeight = 80;
  var dimension = ffpwwe.calcWindowPosition(windowWidth,windowHeight);
  paramsConfirm = {out:{accept:false}};
  window.openDialog("chrome://firefoxpasswordwarningextension/content/dialog/resetDialog.xul", "bmarks", "chrome, centerscreen, resizable=no, dialog, modal,width="+windowWidth+",height="+windowHeight+",top="+dimension.top+",left="+dimension.left+"", paramsConfirm);

  if (paramsConfirm.out.accept) {
    // drop all database tables
    ffpwwe.db.dropTables();
    ffpwwe.options.clearHttpsList();

    // reset options
    ffpwwe.prefs.resetPrefs();

    // TODO is this necessary?
    if (content)
        content.document.location.reload();
  }
};


ffpwwe.options.imageStyleChanger = function () {
    /**
     * Changes the image for the element
     * @param element
     * @param imageUrl
     */
    function changeImage(element, imageUrl) {
        element.style["background-image"] = 'url("' + imageUrl + '")';
    }

    /**
     * Changes the secure style image
     * @param imageString
     */
    function changeSecureImage(imageString) {
        changeImage(document.getElementById("display-securecase"), imageString);
        document.getElementById("image-securecase").src = imageString;
    }

    /**
     * Initializes and sets the image for the element
     * @param element
     * @param imageUrl
     */
    function initialSetImage(element, imageUrl) {
        element.style["background-repeat"] = 'no-repeat';
        element.style["background-size"] = 'contain';
        element.style["background-position"] = 'right center';
        changeImage(element, imageUrl);
    }

	function setSecureImage() {
		if (0 <= currentImage < secureEVStyleImages.length) {
			ffpwwe.prefs.setStringPref("styleokimage", secureStyleImages[currentImage]);
            ffpwwe.prefs.setStringPref("styleEVimage", secureEVStyleImages[currentImage]);
		}
	}

    /**
     * the possible images for the secure style
     */
    var secureStyleImages = ffpwwe.options.secureStyleImages;
    var secureEVStyleImages = ffpwwe.options.secureEVStyleImages;

    /**
     * the index in the secureStyleImages array
     * -1 for not in the array, but the current preference
     */
    var currentImage = -1;
    return {
        initImages: function () {
            currentImage = -1;
            initialSetImage(document.getElementById("display-securecase"),
                ffpwwe.prefs.getStringPref("styleEVimage"));
            changeSecureImage(ffpwwe.prefs.getStringPref("styleEVimage"));
            initialSetImage(document.getElementById("display-unsecurecase"),
                "chrome://firefoxpasswordwarningextension/skin/yellow_triangle.png");
        },

        nextSecureImage: function () {
            if (++currentImage < secureEVStyleImages.length) {
                let imageString = secureEVStyleImages[currentImage];

                if (imageString != ffpwwe.prefs.getStringPref("styleEVimage")) {
                    changeSecureImage(imageString);
                } else // FIXME might be infiniteloop with only one image
                    this.nextSecureImage();

            } else {
                currentImage = -1;
                changeSecureImage(ffpwwe.prefs.getStringPref("styleEVimage"));
                this.nextSecureImage();
            }

			setSecureImage();
        }
    };
}();

ffpwwe.options.loadHttpsList = function () {
    var https_list = document.getElementById("https_list");
    var items = ffpwwe.db.getAll("httpToHttpsRedirects");

    for (var i = 0; i < items.length; i++) {
        https_list.appendItem(items[i]);
    }

    if (https_list.getRowCount() === 0) {
        document.getElementById("deleteHttps").disabled = true;
        document.getElementById("clearHttps").disabled = true;
    }
};

ffpwwe.options.removeHttpsItem = function () {
    var https_list = document.getElementById("https_list");
    var index = https_list.selectedIndex;
    var del = https_list.getItemAtIndex(index).label;
    https_list.removeItemAt(index);
    ffpwwe.db.deleteItem("httpToHttpsRedirects", "url", del);
    ffpwwe.db.deleteItem("userVerifiedDomains", "url", del);

    if (https_list.getRowCount() === 0) {
        document.getElementById("deleteHttps").disabled = true;
        document.getElementById("clearHttps").disabled = true;
    }
};

ffpwwe.options.clearHttpsList = function (drop) {
    var https_list = document.getElementById("https_list");

    for (var i = https_list.getRowCount()-1; i >= 0; i--) {
        https_list.removeItemAt(i);
    }

    if(drop) {
        ffpwwe.db.dropTable("httpToHttpsRedirects");
        ffpwwe.db.dropTable("userVerifiedDomains");
        document.getElementById("deleteHttps").disabled = true;
        document.getElementById("clearHttps").disabled = true;
    }
};

ffpwwe.options.loadPageExceptions = function () {
    var pageExceptions = document.getElementById("pageExceptions");
    var items = ffpwwe.db.getAll("pageExceptions");

    for (var i = 0; i < items.length; i++) {
        pageExceptions.appendItem(items[i]);
    }

    if (pageExceptions.getRowCount() === 0) {
        document.getElementById("deleteException").disabled = true;
        document.getElementById("clearExceptions").disabled = true;
        document.getElementById("checkExceptions").disabled = true;
    }
};

ffpwwe.options.removePageExceptionItem = function () {
    var pageExceptions = document.getElementById("pageExceptions");
    var index = pageExceptions.selectedIndex;
    var del = pageExceptions.getItemAtIndex(index).label;
    pageExceptions.removeItemAt(index);
    ffpwwe.db.deleteItem("pageExceptions", "url", del);

    if (pageExceptions.getRowCount() === 0)
        document.getElementById("deleteException").disabled = true;
        document.getElementById("clearExceptions").disabled = true;
        document.getElementById("checkExceptions").disabled = true;
};

ffpwwe.options.clearPageExceptions = function (drop) {
    var pageExceptions = document.getElementById("pageExceptions");

    for (var i = pageExceptions.getRowCount()-1; i >= 0; i--) {
        pageExceptions.removeItemAt(i);
    }

    if(drop) {
        ffpwwe.db.dropTable("pageExceptions");
    }
    document.getElementById("clearExceptions").disabled = true;
    document.getElementById("deleteException").disabled = true;
    document.getElementById("checkExceptions").disabled = true;
};

ffpwwe.options.insertSecusoWhitelist = function () {
    var https_list = document.getElementById("https_list");

    for (var i = 0; i < secusoWhitelist.length; i++) {
        ffpwwe.db.insert("httpToHttpsRedirects", secusoWhitelist[i]);
    }

    for (var k = 0; k < secusoWhitelist.length; k++) {
        ffpwwe.db.insert("userVerifiedDomains", secusoWhitelist[k]);
    }

    document.getElementById("deleteHttps").disabled = false;
    document.getElementById("clearHttps").disabled = false;

    ffpwwe.options.clearHttpsList(false);


    var addDone = {inn:{message: document.getElementById("firefoxpasswordwarning-strings").getString("secuso_whitelist_add")}};
    const windowWidth = 300;
    const windowHeight = 100;
    var dimension = ffpwwe.calcWindowPosition(windowWidth,windowHeight);
    window.openDialog("chrome://firefoxpasswordwarningextension/content/dialog/messageInformation.xul", "bmarks", "chrome, centerscreen, dialog,resizable=no, modal,width="+windowWidth+",height="+windowHeight+",top="+dimension.top+",left="+dimension.left+"",addDone);

    ffpwwe.options.loadHttpsList();
};

ffpwwe.options.checkForHttps = function () {
    var pageExceptions = ffpwwe.db.getAll("pageExceptions");

    for (var i = 0; i < pageExceptions.length; i++) {
        ffpwwe.options.sslAvailableCheck(pageExceptions[i]);
    }

    var checkDone = {inn:{message: document.getElementById("firefoxpasswordwarning-strings").getString("exception_check_done")}};
    const windowWidth = 300;
    const windowHeight = 100;
    var dimension = ffpwwe.calcWindowPosition(windowWidth,windowHeight);
    window.openDialog("chrome://firefoxpasswordwarningextension/content/dialog/messageInformation.xul", "bmarks", "chrome, centerscreen, dialog,resizable=no, modal,width="+windowWidth+",height="+windowHeight+",top="+dimension.top+",left="+dimension.left+"",checkDone);
};

ffpwwe.options.sslAvailableCheck = function (checkUrl) {
    var url = checkUrl;

    if(!url.startsWith("http://")) {
        url = "http://" + url;
    }

    var sslUrl = url.replace("http://", "https://");
    var sslAvailableCheckPromise = new Promise(function (resolve, reject) {
        if (url.match(/http:/)) {
            ffpwwe.debug("starting ssl availability check for '" + sslUrl + "'");
            var httpsRequest = new XMLHttpRequest();
            httpsRequest.open("HEAD", sslUrl);

            httpsRequest.onreadystatechange = function () {
                if (this.readyState == this.DONE) {
                    let sslAvail = this.status >= 200 && this.status <= 299 && !!this.responseURL.match(/https:/);
                    // test async
                    //window.setTimeout(function () { resolve(sslAvail, sslUrl); }, 5000);
                    ffpwwe.debug("ssl availability check done with result: " + sslAvail);
                    resolve(sslAvail);
                }
            };

            httpsRequest.send();

        } else {
            // if the page was not a http page, https cannot be available
            resolve(false);
        }
    });

    var sslAvailableCheck = {
        promise: sslAvailableCheckPromise,
        done: false,
        sslAvailable: undefined,
        sslUrl: undefined
    };

    sslAvailableCheckPromise.then(function (sslAvailable) {
        sslAvailableCheck.done = true;
        sslAvailableCheck.sslAvailable = sslAvailable;
        sslAvailableCheck.sslUrl = sslUrl;
        if(sslAvailable) {
            ffpwwe.db.insert("httpToHttpsRedirects", url);
            ffpwwe.db.insert("userVerifiedDomains", url);
            ffpwwe.db.deleteItem("pageExceptions", "url", checkUrl);
            var httpsList = document.getElementById("https_list");
            httpsList.appendItem(url);
            ffpwwe.options.clearPageExceptions(false);
            ffpwwe.options.loadPageExceptions();
        }
    });

    return sslAvailableCheck;
};

window.onload = function () {
    ffpwwe.options.loadHttpsList();
    ffpwwe.options.loadPageExceptions();
    ffpwwe.options.imageStyleChanger.initImages();
};
