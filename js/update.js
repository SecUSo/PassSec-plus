let lang = "en";

// STARTING WHEN CONTENT IS LOADED ON PAGE
document.addEventListener("DOMContentLoaded", function (event) {
    // get language details
    lang = chrome.i18n.getUILanguage().substr(0, 2);
    init();
});



/**
 * Initialize the update page with correct lang
 */
function init() {
    document.getElementById('update-title').textContent = getMsg("update_title");
    document.getElementById('update-txt').textContent = getMsg("update_txt");
    document.getElementById('update-domains').textContent = getMsg("update_domains");
    document.getElementById('update-contact').innerHTML = getMsg("update_contact") + '<a href="mailto:addons@secuso.org">addons@secuso.org</a>';
    document.getElementById('settings-button').addEventListener('click', function (e) {
        chrome.runtime.openOptionsPage();
    });
}


// PAGE PREPARATION
/**
 *
 * @param {*} msg msg to be caught in ling
 *
 *  This function is shorter but works like chrome.i18n.getMessage(msg);
 */
function getMsg(msg) {
    return chrome.i18n.getMessage(msg.replace(/-/g, "_"));
}