var ffpwwe = ffpwwe || {};

// A page ist build by page>frame>form>field

ffpwwe.processDOM = function () {

    if (content == null) return;

    //Hide the popup initially
    document.getElementById('warnpanel2').hidePopup();

    var location = content.document.location;

    ffpwwe.page = ffpwwe.page || ffpwwe.pageHandler();
    ffpwwe.page = (ffpwwe.page.href == location.href) ? ffpwwe.page : ffpwwe.pageHandler();
    ffpwwe.page.parseDocument();
};

ffpwwe.debug("STARTING...");

//Everytime the DOMContent is loaded the .init method starts
window.addEventListener("DOMContentLoaded", ffpwwe.processDOM, false);

//window.addEventListener("DOMSubtreeModified", ffpwwe.processDOM, false);


//If the tab changes run our script again to prevent the tooltip from showing in other open tabs
var container = gBrowser.tabContainer;
container.addEventListener("TabSelect", ffpwwe.processDOM, false);
