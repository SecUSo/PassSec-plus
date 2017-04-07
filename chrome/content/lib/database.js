var ffpwwe = ffpwwe || {};
ffpwwe.db = ffpwwe.db || {};

/**
* inserts a value into a database
* @param database the name of the database
* @param value the value to insert into the database
*/
ffpwwe.db.insert = function (database, url) {
  var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
  var domainList = ffpwwe.prefs.getComplexValue(database, Components.interfaces.nsISupportsString).data;
  str.data = domainList + url + ",";
  ffpwwe.prefs.setComplexValue(database, Components.interfaces.nsISupportsString, str);
}

ffpwwe.db.deleteItem = function (database, url, value) {
  var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
	var domainList = ffpwwe.prefs.getComplexValue(database, Components.interfaces.nsISupportsString).data;
	url = url + ",";
  // cut selected element out of list of domains
	str.data = domainList.replace(url, "");
	ffpwwe.prefs.setComplexValue(database, Components.interfaces.nsISupportsString, str);
	}

ffpwwe.db.dropTable = function(database) {
  var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
  str.data = "";
	ffpwwe.prefs.setComplexValue(database, Components.interfaces.nsISupportsString, str);

}
        /**
         * checks whether a value is inside a database
         * @param database the name of the database
         * @param value the value to check
         * @returns {boolean}
         */
ffpwwe.db.isInside = function (database, website) {
	var sites = ffpwwe.prefs.getComplexValue(database, Components.interfaces.nsISupportsString).data;
	if(sites.indexOf(website) != 0 && sites.charAt(sites.indexOf(website)-1) != ','){
		return false;
	}
	return (sites.indexOf(website) > -1);
}
        /**
         *
         *
         */
ffpwwe.db.getAll = function (database) {
	var domainList = ffpwwe.prefs.getComplexValue(database, Components.interfaces.nsISupportsString).data;
  return defaultSites.split(",");
}
/**
* drops all database tables
*/
ffpwwe.db.dropTables = function () {
  ffpwwe.db.dropTable("httpToHttpsRedirects");
  ffpwwe.db.dropTable("userVerifiedDomains");
  ffpwwe.db.dropTable("pageExceptions");
}
