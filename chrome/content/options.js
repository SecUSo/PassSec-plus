var ffpwwe = ffpwwe || {};

ffpwwe.options = ffpwwe.options || {};

ffpwwe.options.restoreInitialState = function () {
    // drop all database tables
    ffpwwe.db.dropTables();

    // reset options
    ffpwwe.prefs.resetPrefs();

    // TODO is this necessary?
    if (content)
        content.document.location.reload();
    alert("Ursprungszustand wurde wiederhergestellt.")
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

window.onload = function () {

    // update the selected index in the phishing detection list
    var phishingPrefOrdering = ["google", "startpage"];
    var phishingPref = ffpwwe.prefs.getStringPref("phishingsearchengine");
    var index = phishingPrefOrdering.indexOf(phishingPref);
    if (index > 0)
        document.getElementById("phishing-menulist").selectedIndex = index;

    ffpwwe.options.imageStyleChanger.initImages();
};
