const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
const db = new JsonDB(new Config("./database/db", true, false, '/'));
module.exports = {
    insertData: function (userId, clientId, cookie) {
        db.push(`/${userId}`, {
            user_id: userId,
            client_id: clientId,
            cookie: cookie
        }, true)
    },

    getData: function (userId) {
        try {
            return db.getData(`/${userId}`)
        } catch (error) {
            return null;
        }
    },

    deleteData: function (userId) {
        db.delete(`/${userId}`)
    }
};