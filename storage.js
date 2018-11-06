const path = require('path');
const storage = require('azure-storage');
const config = require("./local.settings.json");

const blobService = storage.createBlobService(config.AZURE_STORAGE_CONNECTION_STRING);

module.exports = {
    saveMessage: function(blobname, message){
        blobService.createBlockBlobFromText(config.AZURE_STORAGE_CONTAINER_NAME, blobname, message, function(error, result, response) {
            if (!error) {
                console.log(`${message} Uploaded!`);
            }else{
                console.log(`File not uploaded :: ${error}`);
                throw error;
            }
        });
    }
};