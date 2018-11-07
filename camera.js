const PiCamera = require("pi-camera");
const toStorage = require("./storage");
const dateFormat = require("dateformat");
const config = require("./local.settings.json");
const fs = require("fs");

const camOutputName = config.CAM_OUTPUT_FILENAME;

const myCamera = new PiCamera({
    mode: 'photo',
    output: camOutputName,
    width: 2592, 
    height: 1944,
    nopreview: true,
    rotation: 180
});

function getImageName()
{
    var fileName = `image_${getFormattedDate()}.jpg`;
    return fileName;
}

function getFormattedDate(){
    var now = new Date();
    var formattedDate = dateFormat(now, "yyyymmdd_HHMMss");
    return formattedDate;
}

module.exports = {
    snap: function(){
        console.log("snapping image.")
        myCamera.snap()
            .then(async (result) => {
                var filename = getImageName();
                //we'll rename the snapped pic, since we can't dynamically reset the cam output name.
                fs.renameSync(camOutputName, filename);
                console.log("uploading image...");
                toStorage.saveBlob(filename, filename);
            })
            .catch((error) => {
                console.log(error);
            });
    },
}


  

