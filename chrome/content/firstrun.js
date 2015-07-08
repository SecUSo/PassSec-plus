(function () {
    var firstrun = ffpwwe.prefs.getBoolPref("firstrun");
    if (firstrun) {
        // the next run wont be the firstrun
        ffpwwe.prefs.setBoolPref("firstrun", false);
        //ffpwwe.cookieOption.showWindow();

        // change the secure-image to a random one
        var secureStyleImages = ffpwwe.options.secureStyleImages;
        var secureEVStyleImages = ffpwwe.options.secureEVStyleImages;
        var image = Math.floor(Math.random() * secureStyleImages.length);
        if(image < secureStyleImages.length){
            ffpwwe.prefs.setStringPref("styleokimage", secureStyleImages[image]);
            ffpwwe.prefs.setStringPref("styleEVimage", secureEVStyleImages[image]);
        }

        // open the optionswindow at the firstrun
        window.setTimeout(function () {
            // example to open a new tab
            //gBrowser.selectedTab = gBrowser.addTab("http://example.com");
            var paramsFirstrun = {inn:{message: document.getElementById("firefoxpasswordwarning-strings").getString("first_start_message")}};
            const windowWidth = 300;
            const windowHeight = 100;

            var dimension = ffpwwe.calcWindowPosition(windowWidth,windowHeight);
            window.openDialog("chrome://firefoxpasswordwarningextension/content/dialog/messageInformation.xul", "bmarks", "chrome, centerscreen, dialog,resizable=no, modal,width="+windowWidth+",height="+windowHeight+"",paramsFirstrun);
            window.openDialog('chrome://firefoxpasswordwarningextension/content/options.xul');
        }, 1000);
    }
})();
