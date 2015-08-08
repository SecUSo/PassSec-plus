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

            dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS " + database + " (url VARCHAR(100))");

            try
			{
                let statement = dbConn.createStatement("SELECT * FROM " + database + " WHERE url = '" + value + "'");

				statement.executeAsync({
						handleResult: function(resultSet)
						{
							//fire if resultSet is not empty
							dbConn.asyncClose();
						},
						handleError: function(error)
						{
							Application.console.log("insert row error:" + error);
							dbConn.asyncClose();
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
										dbConn.asyncClose();
									}
								});
							}
							else
							{
								dbConn.asyncClose();
							}
						}
					});
            }
            catch (e)
			{
                Application.console.log("error statement:" + dbConn.lastErrorString);
            }

        },
        deleteItem: function (database, col, value) {

                var dbConn = openConnection();

                try
    			{

                    var statement = dbConn.createStatement("DELETE FROM " + database + " WHERE " + col + " = '" + value + "'");

                    statement.executeAsync({
                            handleError: function(error)
        					{
                                Application.console.log("delete entry error:" + error);
        						dbConn.asyncClose();
                            },
                            handleCompletion: function(reason)
        					{
                                dbConn.asyncClose();
                            }
                    });
                }
                catch (e)
    			{
                    Application.console.log("error statement:" + dbConn.lastErrorString);
                }
        },
        dropTable: function(database) {

            var dbConn = openConnection();
            try
			{
                let statement = dbConn.createStatement("DROP TABLE IF EXISTS " + database);

                statement.executeAsync({
                        handleError: function(error)
                        {
                            Application.console.log("drop table error:" + error);
                            dbConn.asyncClose();
                        },
                        handleCompletion: function(reason)
                        {
                            dbConn.asyncClose();
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
         *
         *
         */
         getAll: function (database) {
             var dbConn = openConnection();

             dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS " + database + " (url VARCHAR(100))");

             try
 			{
                let statement = dbConn.createStatement("SELECT url FROM " + database);

                var result = [];

                while (statement.executeStep()) {
                    result.push(statement.getString(0));
                }
 				statement.reset();
 				dbConn.close();

 				return result;
             }
             catch (error)
 			{
                 Application.console.log("error statement:" + dbConn.lastErrorString);
             }

 			return [];
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
						dbConn.asyncClose();
                    },
                    handleCompletion: function(reason)
					{
                        dbConn.asyncClose();
                    }
            });
        }
    };
}();
