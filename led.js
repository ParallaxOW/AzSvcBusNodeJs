const gpio = require("onoff").Gpio;

var led;
    
module.exports = {
    led: led,
    ledSetup: function(){
        led = new gpio(5, "out");
        //make sure its off.
        led.writeSync(0);
    },
    toggleLED: function(value){
        var value = (led.readSync() === 0 ? 1 : 0);
        led.writeSync(value);
    },
    cleanupGPIO: function(){
        led.writeSync(0);
        led.unexport();
    }
}


