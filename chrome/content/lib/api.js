var ffpwwe = ffpwwe || {};

ffpwwe.api = ffpwwe.api || {};

/**
 * Changes the page to the https version and adds the url into the https-redirection-database
 *
 * @param target the button, which stores the https version of the url
 */
ffpwwe.api.goToHttps = function (target) {
    var domain = ffpwwe.pruneURL(content.document.location);
    var strbundle = document.getElementById("firefoxpasswordwarning-strings");
    document.getElementById('warnpanel2').hidePopup();

    const windowWidth = 350;
    const windowHeight = 200;
    var dimension = ffpwwe.calcWindowPosition(windowWidth,windowHeight);

    var domainDisplay = domain.split("").join(" ");
    conf_url_1 = strbundle.getString("confirm_url_1");
    conf_url_2 = strbundle.getString("confirm_url_2").replace(/<insert-url>/g, domainDisplay);
    conf_url_3 = strbundle.getString("confirm_url_3");
    conf_url_4 = strbundle.getString("confirm_url_4");
    conf_url_5 = strbundle.getString("confirm_url_5").replace(/<insert-url>/g, domainDisplay);
    conf_url_6 = strbundle.getString("confirm_url_6");
    quest = conf_url_1 + " " + ffpwwe.escapeHTML(conf_url_2) + " " + conf_url_3 + " " + conf_url_4 + " " + ffpwwe.escapeHTML(conf_url_5) + " " + conf_url_6;

    var params = {inn:{question: quest}, out:{accept:false}};

    window.openDialog("chrome://firefoxpasswordwarningextension/content/dialog/confirmURL.xul", "bmarks", "chrome, centerscreen, resizable=no, dialog, modal,width="+windowWidth+",height="+windowHeight+",top="+dimension.top+",left="+dimension.left+"",params);

	if(params.out.accept) {
        // insert the new exception into the databases
        ffpwwe.db.insert("httpToHttpsRedirects", content.document.location.host);
        ffpwwe.db.insert("userVerifiedDomains", content.document.location.host);

		//changed the url in the login data
		/**
		* ffpwwe.fieldHandler.element: bad access.Change it if you find a better way see field.js -> openOnClickPopup()
		*/
		ffpwwe.loginManagerHandler.changeLoginDataToHttps(content.document.location.href,target.url,ffpwwe.fieldHandler.element.form.action);

        // switch to the new ssl url
        content.wrappedJSObject.location = target.url;
    }
};

/**
 * Changes the page to the page stored in the argument
 *
 * @param target the button, which stores the url
 */
ffpwwe.api.goToPage = function (target) {
    document.getElementById('warnpanel2').hidePopup();
    content.wrappedJSObject.location = target.url;
};

/**
 * Adds the domain into the verified-domains-database
 */
ffpwwe.api.domainKnown = function () {
    var domain = ffpwwe.pruneURL(content.document.location);
    var strbundle = document.getElementById("firefoxpasswordwarning-strings");
    document.getElementById('warnpanel2').hidePopup();
    //  var answer = window.confirm(strbundle.getString("confirm_url").replace("<insert-url>", domain)); => Prompt to check URL when HTTPS if EV
    //  if(answer) {
    // insert the new exception into the database
    ffpwwe.db.insert("userVerifiedDomains", content.document.location.host);
    document.getElementById('warnpanel2').hidePopup();
    ffpwwe.setuserVerified(true);
    ffpwwe.processDOM();
    ffpwwe.setuserVerified(false);
    //content.document.location.reload();
};

/**
 * Hides the popup
 */
ffpwwe.api.closeOnClickPopup = function () {
    ffpwwe.page.popupClosedBefore = true;
    document.getElementById('warnpanel2').hidePopup();
};

/**
 * Expands the message in the popup panel
 * @param id the id of the message
 */
ffpwwe.api.expandMessage = function (id) {
    var messageBox = $("#warntext" + id);

    var data = messageBox.attr("data-toggle");
    if (data != "<no-text>") {
        messageBox.attr("data-toggle", messageBox.text());
        messageBox.text(data);
    }
};

/**
 * Adds the domain into the exception database to disable the addon on this page
 */
ffpwwe.api.disableOnThisPage = function () {
    var domain = ffpwwe.pruneURL(content.document.location);
    var strbundle = document.getElementById("firefoxpasswordwarning-strings");
    document.getElementById('warnpanel2').hidePopup();

    const windowWidth = 400;
    const windowHeight = 270;
    var dimension = ffpwwe.calcWindowPosition(windowWidth,windowHeight);

    var domainDisplay = domain.split("").join(" ");
    add_excp_1 = strbundle.getString("add_exception_1");
    add_excp_2 = strbundle.getString("add_exception_2");
    add_excp_3 = strbundle.getString("add_exception_3");
    add_excp_4 = strbundle.getString("add_exception_4").replace(/<insert-url>/g, domainDisplay);
    add_excp_5 = strbundle.getString("add_exception_5");
    quest = add_excp_1 + "<html:br /><html:br />" + add_excp_2 + "<html:br /><html:br />" + add_excp_3 + " <html:b>" + ffpwwe.escapeHTML(add_excp_4) + "</html:b>" + add_excp_5;

    var params = {inn:{question: quest}, out:{accept:false}};
    window.openDialog("chrome://firefoxpasswordwarningextension/content/dialog/confirmURL.xul", "bmarks", "chrome, centerscreen, dialog, modal,width="+windowWidth+",height="+windowHeight+",top="+dimension.top+",left="+dimension.left+"",params);

    //var disable = window.confirm(strbundle.getString("add_exception").replace("<insert-url>", domain));
    if (params.out.accept) {
        ffpwwe.db.insert("pageExceptions", content.document.location.host);
        content.document.location.reload();
    }// else {
    //    window.confirm(strbundle.getString("confirm_url_recommendation").replace("<insert-url>", domain));
    //}
};
