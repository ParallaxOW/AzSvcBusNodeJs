const azure = require("azure");
const config = require("./local.settings.json");
const toStorage = require("./storage");
const dateFormat = require("dateformat");
const pins = require("./led");
const cam = require("./camera");

console.log("setup led...");
pins.ledSetup();

var serviceBusService =azure.createServiceBusService(config.AZURE_SERVICEBUS_CONNECTION_STRING);

serviceBusService.createQueueIfNotExists(config.AZURE_SERVICE_BUS_QUEUE_NAME, function(error){
    if(!error){
        console.log("queue created!!");
    }else{
        console.log("queue exists!");
    }
});

setInterval(getMessages, 50);

console.log("listening for messages...");

process.on('exit', function (){
    pins.cleanupGPIO();
    process.exit(0);
});

function getMessages(){
    serviceBusService.receiveQueueMessage(config.AZURE_SERVICE_BUS_QUEUE_NAME, { isPeekLock: true }, function(error, lockedMessage){
        if(!error){
            // Message received and locked
            try{
                actionOnMessage(lockedMessage.body);
                //console.log(lockedMessage.body);
                serviceBusService.deleteMessage(lockedMessage, function (deleteError){
                    if(!deleteError){
                        // Message deleted
                        console.log("message deleted!")
                    }
                });
            }catch(error){
                console.log(error);
            }
        }
    });
}

function actionOnMessage(message)
{
    var msgObject = JSON.parse(message);

    switch(msgObject.action){
        case "update":
            console.log(`Updating my configuration: ${msgObject.updatekey} :: ${msgObject.updatevalue}`);
            break;
        case "storage":
            console.log(`saving message to storage!`);
            var blobname = getFileName(msgObject.dataType);
            toStorage.saveMessage(blobname, msgObject.data);
            break;
        case "capturestill":
            console.log("snapping image!");
            cam.snap();
            break;
        case "toggleLED":
            console.log("toggling LED!");
            pins.toggleLED();
            break;
        default: 
            console.log("taking other action!!!");
            break;
    }
}

function getFormattedDate(){
    var now = new Date();
    var formattedDate = dateFormat(now, "yyyymmdd_HHMMss");
    return formattedDate;
}

function getFileName(type){
    var ext = "";
    
    switch(type.toUpperCase()){
        case "TEXT":
            ext = "txt";
            break;
        // case "IMAGE":
        //     ext = "jpg";
        //     break;
        case "JSON":
            ext = "json";
            break;
        default: 
            ext = "";
    }

    return `${type}_${getFormattedDate()}.${ext}`;
}

