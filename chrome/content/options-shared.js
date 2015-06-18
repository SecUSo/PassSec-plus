/*
 * we need this in an extra file to have access to this array outside the options panel
 */

var ffpwwe = ffpwwe || {};

ffpwwe.options = ffpwwe.options || {};

/**
 * the possible images for the secure style
 */
ffpwwe.options.secureStyleImages = [
    "chrome://firefoxpasswordwarningextension/skin/check/orange/o_icon1.png"
].concat([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (i) {
        return "chrome://firefoxpasswordwarningextension/skin/check/orange/o_icon" + i + ".png";
    })
);

/**
 * the possible images for the EV secure style
 */
ffpwwe.options.secureEVStyleImages = [
    "chrome://firefoxpasswordwarningextension/skin/check/gruen/gr_icon1.png"
].concat([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (i) {
        return "chrome://firefoxpasswordwarningextension/skin/check/gruen/gr_icon" + i + ".png";
    })
);
