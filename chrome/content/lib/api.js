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

    var domainDisplay = domain.split("").join(" ");
	  var params = {inn:{question: strbundle.getString("confirm_url").replace(/<insert-url>/g, domainDisplay)}, out:{accept:false}};
	  window.openDialog("chrome://firefoxpasswordwarningextension/content/dialog/confirmURL.xul", "bmarks", "chrome, centerscreen, resizable=no, dialog, modal,width="+windowWidth+",height="+windowHeight+"",params);


	if(params.out.accept)
	{
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
    } //else {
      //  window.confirm(strbundle.getString("confirm_url_recommendation").replace("<insert-url>", domain));
    //}

};

/**
 * Changes the page to the https version and adds the url into the https-redirection-database
 *
 * @param target the button, which stores the https version of the url
 */
ffpwwe.api.goToHttpsImmediately = function (target) {
    document.getElementById('warnpanel2').hidePopup();

    // insert the new exception into the databases
    ffpwwe.db.insert("httpToHttpsRedirects", content.document.location.host);
    ffpwwe.db.insert("userVerifiedDomains", content.document.location.host);

    // Not available without field
	//ffpwwe.loginManagerHandler.changeLoginDataToHttps(content.document.location.href,target.url,ffpwwe.fieldHandler.element.form.action);

    // switch to the new ssl url
    content.wrappedJSObject.location = target.url;

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
    ffpwwe.processDOM();
    //content.document.location.reload();
  //  } else {
  //      window.confirm(strbundle.getString("confirm_url_recommendation").replace("<insert-url>", domain));
  //  }
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
        messageBox.attr("data-toggle", messageBox.html());
        messageBox.html(data);
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

    var domainDisplay = domain.split("").join(" ");
	  var params = {inn:{question: strbundle.getString("add_exception").replace(/<insert-url>/g, domainDisplay)}, out:{accept:false}};
	  window.openDialog("chrome://firefoxpasswordwarningextension/content/dialog/confirmURL.xul", "bmarks", "chrome, centerscreen, dialog, modal,width="+windowWidth+",height="+windowHeight+"",params);

    //var disable = window.confirm(strbundle.getString("add_exception").replace("<insert-url>", domain));
    if (params.out.accept) {
        ffpwwe.db.insert("pageExceptions", content.document.location.host);
        content.document.location.reload();
    }// else {
    //    window.confirm(strbundle.getString("confirm_url_recommendation").replace("<insert-url>", domain));
    //}
};
