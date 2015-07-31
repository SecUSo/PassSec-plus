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

var ffpwwe = ffpwwe || {};

ffpwwe.options = ffpwwe.options || {};

ffpwwe.options.restoreInitialState = function () {
  const windowWidth = 400;
  const windowHeight = 80;

  paramsConfirm = {out:{accept:false}}
  window.openDialog("chrome://firefoxpasswordwarningextension/content/dialog/resetDialog.xul", "bmarks", "chrome, centerscreen, resizable=no, dialog, modal,width="+windowWidth+",height="+windowHeight+"", paramsConfirm);
  if (paramsConfirm.out.accept) {
    // drop all database tables
    ffpwwe.db.dropTables();

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
        changeImage(element, imageUrl)
    }

	function setSecureImage()
	{
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
                    changeSecureImage(imageString)
                } else // FIXME might be infiniteloop with only one image
                    this.nextSecureImage();

            } else {
                currentImage = -1;
                changeSecureImage(ffpwwe.prefs.getStringPref("styleEVimage"));
                this.nextSecureImage();
            }

			setSecureImage();
        }
    }
}();

ffpwwe.options.removeHttpsItem = function () {
    var list = document.getElementById("https_list");
    var index = list.getSelectedItem();
    var del = list.getItemAtIndex(index).label;
    list.removeItemAt(index);
    ffpwwe.db.deleteItem("httpToHttpsRedirects", "url", del);
    ffpwwe.db.deleteItem("userVerifiedDomains", "url", del);
};

ffpwwe.options.clearHttpsList = function () {
    var https_list = document.getElementById("https_list");
    for (var i = https_list.getRowCount()-1; i >= 0; i--) {
        https_list.removeItemAt(i);
    }
    ffpwwe.db.dropTable("httpToHttpsRedirects");
    ffpwwe.db.dropTable("userVerifiedDomains");
};

ffpwwe.options.removePageExceptionItem = function () {
    var list = document.getElementById("pageExceptions");
    var index = list.getSelectedItem();
    list.removeItemAt(index);
};

ffpwwe.options.clearPageExceptions = function () {
    var pageExceptions = document.getElementById("pageExceptions");
    for (var i = pageExceptions.getRowCount()-1; i >= 0; i--) {
        https_list.removeItemAt(i);
    }
    ffpwwe.db.dropTable("pageExceptions");
};

window.onload = function () {

    // update the selected index in the phishing detection list
    var phishingPrefOrdering = ["google", "startpage"];
    var phishingPref = ffpwwe.prefs.getStringPref("phishingsearchengine");
    var index = phishingPrefOrdering.indexOf(phishingPref);
    if (index > 0)
        document.getElementById("phishing-menulist").selectedIndex = index;

    var https_list = document.getElementById("https_list");
    var items = ffpwwe.db.getAll("httpToHttpsRedirects");
    for (var i = 0; i < items.length; i++) {
        https_list.appendItem(items[i]);
    }

    var whitelist = document.getElementById("pageExceptions");
    var items = ffpwwe.db.getAll("pageExceptions");
    for (var i = 0; i < 15; i++) {
        pageExceptions.appendItem(items[i])
    }

    ffpwwe.options.imageStyleChanger.initImages();
};
