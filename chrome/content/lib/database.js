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
						/*handleError: function(error) {
							//Application.console.error("insert row error:" + error);
							console.error("select row error:" + error);
							dbConn.asyncClose();
						},
						handleCompletion: function(reason) {
							if (reason === 0 && !statement.executeStep()) {
								let insertStmt = dbConn.createStatement("INSERT INTO " + database + " VALUES (:url)");
								insertStmt.params.url = value;
								insertStmt.executeAsync({
									handleError: function(error) {
										//Application.console.error("insert row error:" + error);
										console.error("insert row error:" + error);
									},
									handleCompletion: function(aReason) {
										dbConn.asyncClose();
									}
								});
							}
							else {
								dbConn.asyncClose();
							}
						}
					});
            }
            catch (e) {
                //Application.console.error("error statement:" + dbConn.lastErrorString);
				console.error("error statement:" + dbConn.lastErrorString);
            }

        },*/

ffpwwe.db.deleteItem = function (database, url, value) {
  var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
	var domainList = ffpwwe.prefs.getComplexValue(database, Components.interfaces.nsISupportsString).data;
	url = url + ",";
  // cut selected element out of list of domains
	str.data = domainList.replace(url, "");
	ffpwwe.prefs.setComplexValue(database, Components.interfaces.nsISupportsString, str);
	}
          /*
                var statement = dbConn.createStatement("DELETE FROM " + database + " WHERE " + col + " = :url");
				statement.params.url = value;
                statement.executeAsync({
                        handleError: function(error) {
                            //Application.console.error("delete entry error:" + error);
							console.error("delete entry error:" + error);
    						dbConn.asyncClose();
                        },
                        handleCompletion: function(reason) {
                            dbConn.asyncClose();
                        }
                });
            }
            catch (e) {
                //Application.console.error("error statement:" + dbConn.lastErrorString);
				console.error("error statement:" + dbConn.lastErrorString);
      }*/
        
ffpwwe.db.dropTable = function(database) {
  var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
  str.data = "";
	ffpwwe.prefs.setComplexValue(database, Components.interfaces.nsISupportsString, str);

/*
            try	{
                let statement = dbConn.createStatement("DROP TABLE IF EXISTS " + database);

                statement.executeAsync({
                        handleError: function(error) {
                            //Application.console.error("drop table error:" + error);
							console.error("drop table error:" + error);
                            dbConn.asyncClose();
                        },
                        handleCompletion: function(reason) {
                            dbConn.asyncClose();
                        }
                });
            }
            catch (e) {
                //Application.console.error("error statement:" + dbConn.lastErrorString);
				console.error("error statement:" + dbConn.lastErrorString);
      }*/
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
          /*  dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS " + database + " (url VARCHAR(100))");

            try	{
                let statement = dbConn.createStatement("SELECT * FROM " + database + " WHERE url = :url");
        				statement.params.url = value;
        				let result = !!statement.executeStep();
        				statement.reset();
        				dbConn.close();

        				return result;
            }
            catch (error) {
                //Application.console.error("error statement:" + dbConn.lastErrorString);
				        console.error("error statement:" + dbConn.lastErrorString);
            }*/
}
        /**
         *
         *
         */
ffpwwe.db.getAll = function (database) {
	var domainList = ffpwwe.prefs.getComplexValue(database, Components.interfaces.nsISupportsString).data;
  return defaultSites.split(",");
  /*
             dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS " + database + " (url VARCHAR(100))");

             try {
                let statement = dbConn.createStatement("SELECT url FROM " + database);

                var result = [];

                while (statement.executeStep()) {
                    result.push(statement.getString(0));
                }
 				statement.reset();
 				dbConn.close();

 				return result;
             }
             catch (error) {
                 //Application.console.error("error statement:" + dbConn.lastErrorString);
				 console.error("error statement:" + dbConn.lastErrorString);
             }

 			return [];*/
}
/**
* drops all database tables
*/
ffpwwe.db.dropTables = function () {
  ffpwwe.db.dropTable("httpToHttpsRedirects");
  ffpwwe.db.dropTable("userVerifiedDomains");
  ffpwwe.db.dropTable("pageExceptions");
  /*
			var statements = [dbConn.createStatement("DROP TABLE IF EXISTS pageExceptions"),
					    dbConn.createStatement("DROP TABLE IF EXISTS httpToHttpsRedirects"),
						dbConn.createStatement("DROP TABLE IF EXISTS userVerifiedDomains"),
						dbConn.createStatement("DROP TABLE IF EXISTS errorHTTPS"),
						dbConn.createStatement("DROP TABLE IF EXISTS httpsAvail")];

			dbConn.executeAsync(statements,statements.length,{
                    handleError: function(error) {
                        //Application.console.error("drop table error:" + error);
						console.error("drop table error:" + error);
						dbConn.asyncClose();
                    },
                    handleCompletion: function(reason) {
                        dbConn.asyncClose();
                    }
            });
        }
    };*/
}
