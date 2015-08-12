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

(function () {
    var firstrun = ffpwwe.prefs.getBoolPref("firstrun");
    if (firstrun) {
        // the next run wont be the firstrun
        ffpwwe.prefs.setBoolPref("firstrun", false);

        ffpwwe.prefs.setIntPref("cookieBehavior_reset", ffpwwe.prefsNetworkCookie.getIntPref("cookieBehavior"));
        ffpwwe.prefs.setIntPref("lifetimePolicy_reset", ffpwwe.prefsNetworkCookie.getIntPref("lifetimePolicy"));

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
    else {
        var starts = ffpwwe.prefs.getIntPref("starts");
        ffpwwe.prefs.setIntPref("starts", starts+=1);
    }
})();
