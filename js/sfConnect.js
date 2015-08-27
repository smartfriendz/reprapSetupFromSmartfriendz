/*
smartfriendz reprap setup
This is a step by step guide to first setup a reprap printer after all assembled and before first print
*/

//--------------------------------

//LOADER SETTINGS:
/*Set loaderOnLaunch to false if you dont want to run loader on every launch
(direct connction is useful when creating your app but not recommended for finished project).*/
var loaderOnLaunch = true;
//If you want to work without launcher you must define your connected arduino port:
var defaultSerialPort = "COM3";

//--------------------------------

//ADVANCED SETTINGS:
//Connection bitrate (slow bitrate will send errors)
var arduinoBitrate = 115200;
//Set update rate of analog pins in miliseconds (lower value increases CPU usage).
var updateRate = 50;
//Debug mode logs into console object data on send (buttons sends on click).
var debugMode = false;

//--------------------------------

//PORT DETECTION + LOADER PORT LIST
var loaderCtaPort = defaultSerialPort;
// ID of the connection, defined once.
var connectionID;

var onGetDevices = function(ports) {
  //create list of ports and print it to console 
  console.log("Available port list:");

  for (var j=0; j<ports.length; j++) {
    console.log(ports[j].path);
    //create port buttons for loader
    if (loaderOnLaunch){
      $(".loader-ports").append('<p>'+ports[j].path+'</p>');

      //change selected port when clicked
      $(".loader-ports > p").click(function() {
        $(".loader-ports > p").removeClass("active-port");
        $(this).addClass("active-port");
          loaderCtaPort = $(this).html();
      });

    };
  };
};

//Function when connecting to Arduino
var onConnect = function(connectionInfo) {
  //Error message
  if (!connectionInfo) {
    console.error('Could not open, check if Arduino is connected, try other serial port or relaunch Chrome.', "ヽ༼ຈل͜ຈ༽ﾉ RIOT ヽ༼ຈل͜ຈ༽ﾉ");
    $("body").append('<div id="loader-error">Could not open, check if device is connected, try other serial port or relaunch Chrome.</div>');
    $("#loader-error").delay(2500).fadeOut('slow');
    return;
  }
  //Remove loader if connection is successful + hack for knob and slider
  else {
    $("#loader-bg, #loader-error").remove();
  };

  console.log("Device connected:", loaderCtaPort);

  this.connectionId = connectionInfo.connectionId;

  console.log("connection ID:", connectionInfo.connectionId);

  connectionID = connectionInfo.connectionId;

};

//get the port list for loader
chrome.serial.getDevices(onGetDevices);

//LOADER
if(loaderOnLaunch){
  $(document).ready(function() {
    //create loader elements
    $("body").prepend('<div id="loader-bg"><div id="loader"></div></div>');
      $("#loader").append('<div id="loader-logo"><img src="img/logo.png" alt="" /></div><div>Please select your device:</div><div class="loader-ports"></div><div id="loader-button">Connect</div>');
    //connect button
    $("#loader-button").click(function() {
      chrome.serial.connect(loaderCtaPort, {bitrate: arduinoBitrate}, onConnect);
    });
  });

}
else{
  chrome.serial.connect(defaultSerialPort, {bitrate: arduinoBitrate}, onConnect);
};


$(document).ready(function() {
  // test commands
  $("#test").click(function(){arduinoSend("G1 X5")});
});



//SERIAL DATA READ
var onReceive = function(receiveInfo) {
  //ID test
  if (receiveInfo.connectionId !== connectionID) return;
  
  

  //create array from received arduino data
  var Int8View  = new Int8Array(receiveInfo.data);
  encodedString = String.fromCharCode.apply(null, Int8View);

console.log(encodedString);

};



//Error message when connection is interrupted
var onError = function (errorInfo) {
  console.error("Received error on serial connection: " + errorInfo.error);
};

chrome.serial.onReceive.addListener(onReceive);

chrome.serial.onReceiveError.addListener(onError);

//SERIAL DATA SEND
//Events triggered on action

//Empty function for testing
var onSend = function(){
  if(debugMode){
    console.log(ardSend);
    console.log(digitalPins);
  };
};

//Sends data to arduino based on event
var arduinoSend = function(pin, value){

  ardSend = pin+"V"+value+"\n";
  
  chrome.serial.send(connectionID, sendConvertString(ardSend), onSend);

};



//convert "ardSend" string to arduino serial-friendly format
var sendConvertString = function(ardSend) {

  var buf      = new ArrayBuffer(ardSend.length);
  var bufView  = new Uint8Array(buf);

  for (var i   = 0; i < ardSend.length; i++) {
    bufView[i] = ardSend.charCodeAt(i);
  };
  return buf;

};

