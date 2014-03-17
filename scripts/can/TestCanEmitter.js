var _ = require('underscore');
var util = require('util');
var events = require('events');

/**
 * Fakes CAN messages. Events fire every 100 ms. Values fluctuate randomly. You can use the
 * accelPress, brakePressed, inPark, and charging properties to enact change in the values.
 * @type {Function}
 */
var TestCanEmitter = module.exports = function() {

    this.accelPressed = false;
    this.brakePressed = false;
    this.inPark = false;
    this.charging = false;

    var batteryVoltage = 375;
    var batteryCurrent = 0;
    var batterySoc = 80;
    var batteryTemp = 20;
    var motorRpm = 0;
    var motorTorque = 0;
    var motorTemp = 20;
    var transGear = -2;
    var transRatio = 0;
    var engineRpm = 1000;
    var engineTorque = 20;
    var engineTemp = 20;
    var vehicleAccel = 0;
    var vehicleBrake = 0;
    var vehicleSpeed = 0;
    var chargerVoltage = 0;
    var chargerCurrent = 0;
    
    setInterval(_.bind(function() {
        if (this.accelPressed) {
            transGear = Math.max(Math.min(transGear + 0.2, 6), 1);
            transRatio = 6.12 / transGear;
            vehicleAccel = 100;
            vehicleBrake = 'no';
            vehicleSpeed = Math.min(vehicleSpeed + 2, 120);
            engineRpm = Math.min(engineRpm + 100, 5000);
            engineTorque = 300;
            engineTemp = Math.min(engineTemp + 0.2, 100);
            motorRpm = Math.min(motorRpm + 200, 10000);
            motorTorque = 300;
            motorTemp = Math.min(motorTemp + 0.2, 100);
            batteryVoltage = 360;
            batteryCurrent = 400;
            batterySoc = Math.max(batterySoc - 0.4, 10);
            batteryTemp = Math.min(batteryTemp + 0.2, 100);
        } else if (this.brakePressed) {
            transGear = Math.max(transGear - 0.2, 1);
            transRatio = 6.12 / transGear;
            vehicleAccel = 0;
            vehicleBrake = 'yes';
            vehicleSpeed = Math.max(vehicleSpeed - 2, 0);
            engineRpm = Math.max(engineRpm - 100, 1000);
            engineTorque = 20;
            engineTemp = Math.max(engineTemp - 0.2, 20);
            motorRpm = Math.max(motorRpm - 200, 0);
            motorTorque = -200;
            motorTemp = Math.max(motorTemp - 0.2, 20);
            batteryVoltage = 390;
            batteryCurrent = -200;
            batterySoc = Math.min(batterySoc + 0.1, 100);
            batteryTemp = Math.max(batteryTemp - 0.2, 20);
        } else {
            transGear = 0;
            vehicleAccel = 0;
            vehicleBrake = 'no';
            engineTorque = 20;
            motorTorque = 0;
            batteryVoltage = 375;
            batteryCurrent = 0.0;
        }

        if (this.inPark) {
            transGear = -2;
        }

        if (this.charging) {
            chargerVoltage = 240;
            chargerCurrent = 10;
        } else {
            chargerVoltage = 0;
            chargerCurrent = 0;
        }

        var random = Math.random();
        var randomAroundZero = random - 0.5;
        this.emit('batteryVoltage', batteryVoltage + randomAroundZero);
        this.emit('batteryCurrent', batteryCurrent + randomAroundZero * 10);
        this.emit('batterySoc', batterySoc);
        this.emit('batteryTemp', batteryTemp + randomAroundZero);
        this.emit('motorRpm', motorRpm + randomAroundZero * 10);
        this.emit('motorTorque', motorTorque + randomAroundZero * 5);
        this.emit('motorTemp', motorTemp + randomAroundZero);
        this.emit('transGear', transGear);
        this.emit('transRatio', transRatio);
        this.emit('engineRpm', engineRpm + randomAroundZero * 20);
        this.emit('engineTorque', engineTorque + randomAroundZero * 7);
        this.emit('engineTemp', engineTemp + randomAroundZero);
        this.emit('vehicleAccel', vehicleAccel - random * 5);
        this.emit('vehicleBrake', vehicleBrake);
        this.emit('vehicleSpeed', vehicleSpeed + random * 2);
        this.emit('chargerVoltage', chargerVoltage);
        this.emit('chargerCurrent', chargerCurrent);
    }, this), 100);
};
util.inherits(TestCanEmitter, events.EventEmitter);