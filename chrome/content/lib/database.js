var ffpwwe = ffpwwe || {};

ffpwwe.db = function () {
    Components.utils.import("resource://gre/modules/FileUtils.jsm");
    Components.utils.import("resource://gre/modules/Services.jsm");

    /**
     * opens a connection to the default database
     * @returns {Database}
     */
    function openConnection() {
        let file = FileUtils.getFile("ProfD", ["PostPasswordExtensionExceptions.sqlite"]);
        let dbConn = Services.storage.openDatabase(file); // Will also create the file if it does not exist

        return dbConn;
    }

    return {
        /**
         * inserts a value into a database
         * @param database the name of the database
         * @param value the value to insert into the database
         */
        insert: function (database, value) {

            var dbConn = openConnection();

            try 
			{
                let statement = dbConn.createStatement("SELECT * FROM " + database + " WHERE url = '" + value + "'");
				
				statement.executeAsync({
						handleResult: function(resultSet) 
						{
							//fire if resultSet is not empty
							dbConn.close();
						},				
						handleError: function(error) 
						{  
							Application.console.log("insert row error:" + error);
							dbConn.close();							
						},      
						handleCompletion: function(reason) 
						{
							if (reason == 0) 
							{				
								let insertStmt = dbConn.createStatement("INSERT INTO " + database + " VALUES ('" + value + "')");
								insertStmt.executeAsync({   
									handleError: function(error) 
									{  
										Application.console.log("insert row error:" + error); 
									},      
									handleCompletion: function(aReason) 
									{
										dbConn.close();
									}  
								}); 
							}
							else
							{
								dbConn.close();
							}
						}  
					}); 
            }
            catch (e) 
			{
                Application.console.log("error statement:" + dbConn.lastErrorString);
            }
            
        },
        /**
         * checks whether a value is inside a database
         * @param database the name of the database
         * @param value the value to check
         * @returns {boolean}
         */
        isInside: function (database, value) {

            var dbConn = openConnection();

            dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS " + database + " (url VARCHAR(100))");

            try 
			{
                let statement = dbConn.createStatement("SELECT * FROM " + database + " WHERE url = '" + value + "'");
				
				let result = !!statement.executeStep();
				statement.reset();
				dbConn.close();
							
				return result;
            }
            catch (error) 
			{
                Application.console.log("error statement:" + dbConn.lastErrorString);
            }
			
			return false;
        },
        /**
         * drops all database tables
         */
        dropTables: function () 
		{
		
            var dbConn = openConnection();
			
			var statements = [dbConn.createStatement("DROP TABLE IF EXISTS pageExceptions"),
					    dbConn.createStatement("DROP TABLE IF EXISTS httpToHttpsRedirects"),
						dbConn.createStatement("DROP TABLE IF EXISTS userVerifiedDomains"),
						dbConn.createStatement("DROP TABLE IF EXISTS errorHTTPS"),
						dbConn.createStatement("DROP TABLE IF EXISTS httpsAvail")];
			
			dbConn.executeAsync(statements,statements.length,{  
                    handleError: function(error) 
					{  
                        Application.console.log("drop table error:" + error);
						dbConn.close();
                    },      
                    handleCompletion: function(reason) 
					{
                        dbConn.close();
                    }  
                }); 
        }
    };
}();
