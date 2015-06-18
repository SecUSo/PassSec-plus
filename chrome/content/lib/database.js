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

            let statement = null;
            try {
                statement = dbConn.createStatement("SELECT * FROM " + database + " WHERE url = '" + value + "'");
            }
            catch (e) {
                Application.console.log("error statement:" + dbConn.lastErrorString);
            }

            if (!statement.executeStep()) {
                dbConn.executeSimpleSQL("INSERT INTO " + database + " VALUES ('" + value + "')");
            }

            dbConn.close();
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

            let statement = null;
            try {
                statement = dbConn.createStatement("SELECT * FROM " + database + " WHERE url = '" + value + "'");
            }
            catch (e) {
                Application.console.log("error statement:" + dbConn.lastErrorString);
            }

            let result = !!statement.executeStep();
            dbConn.close();

            return result;
        },
        /**
         * drops all database tables
         */
        dropTables: function () {

            var dbConn = openConnection();

            dbConn.executeSimpleSQL("DROP TABLE IF EXISTS pageExceptions");
            dbConn.executeSimpleSQL("DROP TABLE IF EXISTS httpToHttpsRedirects");
            dbConn.executeSimpleSQL("DROP TABLE IF EXISTS userVerifiedDomains");
            dbConn.executeSimpleSQL("DROP TABLE IF EXISTS errorHTTPS");
            dbConn.executeSimpleSQL("DROP TABLE IF EXISTS httpsAvail");

            dbConn.close();
        }
    };
}();
